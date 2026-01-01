import { Job } from '@nemoventures/adonis-jobs'
import type { BullJobsOptions } from '@nemoventures/adonis-jobs/types'
import mail from '@adonisjs/mail/services/main'
import { SendEmailData } from '#types/send_email_type'
import EmailBounceService from '#services/email_bounce_service'
import EmailLogService from '#services/email_log_service'
import logger from '@adonisjs/core/services/logger'
import { Edge } from 'edge.js'
import { join } from 'node:path'

export type SendEmailReturn = {}

export default class SendEmail extends Job<SendEmailData, SendEmailReturn> {
  static options: BullJobsOptions = {}

  async process(): Promise<any> {
    const { to, from, subject, htmlView, html, data, emailLogId } = this.data

    // Check if we can send email to this address
    const canSend = await EmailBounceService.canSendEmail(to)
    if (!canSend) {
      logger.warn(`Skipping email to ${to} due to bounce/complaint status`)

      // Mark email log as failed if provided
      if (emailLogId) {
        await EmailLogService.markAsFailed(emailLogId, 'Email address has bounce/complaint status')
      }

      return { skipped: true, reason: 'Email address has bounce/complaint status' }
    }

    try {
      let renderedHtml = html

      // If using htmlView, pre-render the template to capture HTML content
      if (htmlView && !html && data) {
        try {
          // Create Edge instance and configure paths
          const edge = Edge.create()
          const viewsPath = join(process.cwd(), 'resources', 'views')
          edge.mount(viewsPath)

          // Pre-render the HTML template for capture
          renderedHtml = await edge.render(htmlView, data)
        } catch (renderError) {
          logger.warn(`Failed to pre-render template ${htmlView}:`, renderError.message)
          // Continue without pre-rendered content - mail.send will still work
        }
      }

      const result = await mail.send((message) => {
        if (html) {
          message.to(to).from(from).subject(subject).html(html)
        } else if (htmlView) {
          message.to(to).from(from).subject(subject).htmlView(htmlView, data)
        } else {
          throw new Error('Either html or an html view must be provided')
        }
      })

      // Update email log with rendered content and delivery info
      if (emailLogId) {
        const messageId = result?.messageId || undefined

        // Update the email log with the rendered content and sent status
        const emailLog = await EmailLogService.findById(emailLogId)
        if (emailLog) {
          // Store the HTML content if we have it
          if (renderedHtml) {
            emailLog.htmlContent = renderedHtml
          }

          // Mark as sent
          emailLog.markAsSent(
            typeof messageId === 'string' ? messageId : undefined,
            JSON.stringify(result)
          )

          await emailLog.save()
        }
      }

      logger.info(`Successfully sent email to ${to}`)
      return { sent: true, messageId: result?.messageId }
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error)

      // Mark email log as failed if provided
      if (emailLogId) {
        await EmailLogService.markAsFailed(emailLogId, error.message)
      }

      throw error
    }
  }
}

import { Job } from '@nemoventures/adonis-jobs'
import type { BullJobsOptions } from '@nemoventures/adonis-jobs/types'
import Subscription from '#models/subscription'
import SendEmailJob from '#jobs/send_email_job'
import EmailLogService from '#services/email_log_service'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'

export type SendSubscriptionFailureEmailData = {
  subscriptionId: number
  error: string
  failedAt: string
}

export type SendSubscriptionFailureEmailReturn = {}

export default class SendSubscriptionFailureEmailJob extends Job<
  SendSubscriptionFailureEmailData,
  SendSubscriptionFailureEmailReturn
> {
  static options: BullJobsOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  }

  async process(): Promise<SendSubscriptionFailureEmailReturn> {
    const { subscriptionId, error, failedAt } = this.data

    try {
      // Load subscription with user data
      const subscription = await Subscription.query()
        .where('id', subscriptionId)
        .preload('user')
        .firstOrFail()

      logger.info(
        `Sending failure notification for subscription ${subscription.id} to ${subscription.user.email}`
      )

      // Create email log entry for failure notification
      const emailLog = await EmailLogService.createLog({
        subject: `${subscription.name} - Fetch Failed`,
        recipientEmail: subscription.user.email,
        userId: subscription.user.id,
        subscriptionId: subscription.id,
        emailType: 'failure',
        templateData: {
          subscription: {
            id: subscription.id,
            name: subscription.name,
            endpoint: subscription.endpoint,
            failureCount: subscription.failureCount || 0,
          },
          user: {
            email: subscription.user.email,
          },
          error,
          failedAt,
        },
      })

      // Queue the failure notification email
      await SendEmailJob.dispatch({
        to: subscription.user.email,
        from: env.get('EMAIL_NOTIFICATIONS'),
        subject: `${subscription.name} - Fetch Failed`,
        htmlView: 'emails/subscription_failure',
        emailLogId: emailLog.id,
        data: {
          subscription: {
            id: subscription.id,
            name: subscription.name,
            endpoint: subscription.endpoint,
            failureCount: subscription.failureCount || 0,
          },
          user: {
            email: subscription.user.email,
          },
          error,
          failedAt,
        },
      })

      logger.info(`Successfully queued failure email for subscription ${subscription.id}`)

      return {}
    } catch (emailError) {
      logger.error(
        `Failed to send failure notification for subscription ${subscriptionId}:`,
        emailError.message
      )
      throw emailError
    }
  }
}

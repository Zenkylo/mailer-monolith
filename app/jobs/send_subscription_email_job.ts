import { Job } from '@nemoventures/adonis-jobs'
import type { BullJobsOptions } from '@nemoventures/adonis-jobs/types'
import Subscription from '#models/subscription'
import SendEmailJob from '#jobs/send_email_job'
import EmailLogService from '#services/email_log_service'
import BouncerHelper from '#services/bouncer_helper'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'

export type SendSubscriptionEmailData = {
  subscriptionId: number
  data: any
  fetchedAt: string
  statusCode?: number
}

export type SendSubscriptionEmailReturn = {}

export default class SendSubscriptionEmailJob extends Job<
  SendSubscriptionEmailData,
  SendSubscriptionEmailReturn
> {
  static options: BullJobsOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  }

  async process(): Promise<SendSubscriptionEmailReturn> {
    const { subscriptionId, data, fetchedAt, statusCode } = this.data

    try {
      // Load subscription with user data
      const subscription = await Subscription.query()
        .where('id', subscriptionId)
        .preload('user')
        .firstOrFail()

      // Check if user can receive emails (plan limits) using bouncer
      const canReceive = await BouncerHelper.canSendEmail(subscription.user)
      if (!canReceive) {
        logger.warn(
          `Skipping subscription email for user ${subscription.user.id} - plan limit exceeded`
        )
        return { skipped: true, reason: 'Plan limit exceeded' }
      }

      // Check if user can receive emails (bounce status)
      if (!subscription.user.canReceiveEmails()) {
        logger.warn(
          `Skipping subscription email for user ${subscription.user.id} - email status: ${subscription.user.emailStatus}`
        )

        // Still log the attempt for audit purposes
        await EmailLogService.createLog({
          subject: `${subscription.name} - Data Update`,
          recipientEmail: subscription.user.email,
          userId: subscription.user.id,
          subscriptionId: subscription.id,
          emailType: 'subscription',
          templateData: {
            subscription: {
              id: subscription.id,
              name: subscription.name,
              endpoint: subscription.endpoint,
            },
            fetchedData: data,
            fetchedAt,
            statusCode,
            skippedReason: `User email status: ${subscription.user.emailStatus}`,
          },
        })

        return { skipped: true, reason: `User email status: ${subscription.user.emailStatus}` }
      }

      logger.info(`Sending subscription email for ${subscription.id} to ${subscription.user.email}`)

      // Create email log entry
      const emailLog = await EmailLogService.createLog({
        subject: `${subscription.name} - Data Update`,
        recipientEmail: subscription.user.email,
        userId: subscription.user.id,
        subscriptionId: subscription.id,
        emailType: 'subscription',
        templateData: {
          subscription: {
            id: subscription.id,
            name: subscription.name,
            endpoint: subscription.endpoint,
          },
          user: {
            email: subscription.user.email,
          },
          fetchedData: data,
          fetchedAt,
          statusCode,
        },
      })

      // Queue the actual email with email log ID for tracking
      await SendEmailJob.dispatch({
        to: subscription.user.email,
        from: env.get('EMAIL_NOTIFICATIONS'),
        subject: `${subscription.name} - Data Update`,
        htmlView: 'emails/subscription_data',
        emailLogId: emailLog.id, // Pass email log ID for tracking
        data: {
          subscription: {
            id: subscription.id,
            name: subscription.name,
            endpoint: subscription.endpoint,
          },
          user: {
            email: subscription.user.email,
          },
          fetchedData: data,
          fetchedAt,
          statusCode,
        },
      })

      logger.info(`Successfully queued email for subscription ${subscription.id}`)

      return {}
    } catch (error) {
      logger.error(`Failed to send subscription email for ${subscriptionId}:`, error.message)
      throw error
    }
  }
}

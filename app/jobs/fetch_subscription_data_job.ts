import Subscription from '#models/subscription'
import CronService from '#services/cron_service'
import SecureDataFetcher from '#services/secure_data_fetcher'
import logger from '@adonisjs/core/services/logger'
import { Job } from '@nemoventures/adonis-jobs'
import type { BullJobsOptions } from '@nemoventures/adonis-jobs/types'

export type FetchSubscriptionDataData = {
  subscriptionId: number
}

export type FetchSubscriptionDataReturn = {}

export default class FetchSubscriptionDataJob extends Job<
  FetchSubscriptionDataData,
  FetchSubscriptionDataReturn
> {
  static options: BullJobsOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  }

  async process(): Promise<FetchSubscriptionDataReturn> {
    const { subscriptionId } = this.data

    // Configurable failure threshold
    const FAILURE_THRESHOLD = 3

    // Load the subscription with user data
    const subscription = await Subscription.query()
      .where('id', subscriptionId)
      .preload('user')
      .firstOrFail()

    // Check failure count before attempting fetch
    if ((subscription.failureCount ?? 0) >= FAILURE_THRESHOLD) {
      logger.warn(
        `Skipping data fetch for subscription ${subscription.id} due to failure count (${subscription.failureCount}) >= threshold (${FAILURE_THRESHOLD})`
      )
      return {}
    }

    try {
      logger.info(`Fetching data for subscription ${subscription.id} (${subscription.name})`)

      // Securely fetch data from the user's endpoint
      const result = await SecureDataFetcher.fetchData(subscription.endpoint, {
        timeout: 5000,
      })

      logger.info(`Successfully fetched data for subscription ${subscription.id}`)

      // Queue email job with the fetched data
      const { default: SendSubscriptionEmailJob } = await import('./send_subscription_email_job.js')
      await SendSubscriptionEmailJob.dispatch({
        subscriptionId: subscription.id,
        data: result.data,
        fetchedAt: new Date().toISOString(),
        statusCode: result.status,
      })

      // Mark subscription as successfully run and reset failure count
      await CronService.markAsRun(subscription)
      // Optionally reset failureCount to 0 if you want to clear on success
      if (subscription.failureCount && subscription.failureCount > 0) {
        subscription.failureCount = 0
        await subscription.save()
      }

      logger.info(`Queued email for subscription ${subscription.id}`)

      return {}
    } catch (error) {
      logger.error(`Failed to fetch data for subscription ${subscriptionId}:`, error.message)

      try {
        // Increment failure count on the already loaded subscription
        subscription.failureCount = (subscription.failureCount ?? 0) + 1
        await subscription.save()

        // Mark subscription as failed
        await CronService.markAsFailed(subscription, error.message)

        // Queue failure notification email
        const { default: SendSubscriptionFailureEmailJob } = await import(
          './send_subscription_failure_email_job.js'
        )
        await SendSubscriptionFailureEmailJob.dispatch({
          subscriptionId: subscription.id,
          error: error.message,
          failedAt: new Date().toISOString(),
        })

        logger.info(`Queued failure notification for subscription ${subscriptionId}`)
      } catch (dbError) {
        logger.error(`Failed to handle error for subscription ${subscriptionId}:`, dbError.message)
      }

      throw error
    }
  }
}

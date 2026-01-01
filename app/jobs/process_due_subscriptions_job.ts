import { Job } from '@nemoventures/adonis-jobs'
import type { BullJobsOptions } from '@nemoventures/adonis-jobs/types'
import CronService from '#services/cron_service'
import logger from '@adonisjs/core/services/logger'

export type ProcessDueSubscriptionsData = {}
export type ProcessDueSubscriptionsReturn = {}

export default class ProcessDueSubscriptionsJob extends Job<
  ProcessDueSubscriptionsData,
  ProcessDueSubscriptionsReturn
> {
  static options: BullJobsOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  }

  async process(): Promise<ProcessDueSubscriptionsReturn> {
    logger.info('Starting to process due subscriptions...')

    try {
      // Find all subscriptions that are due to run
      const dueSubscriptions = await CronService.getDueSubscriptions()

      logger.info(`Found ${dueSubscriptions.length} due subscriptions`)

      // Queue each subscription for individual processing
      for (const subscription of dueSubscriptions) {
        // Import the job dynamically to avoid circular dependencies
        const { default: FetchSubscriptionDataJob } = await import(
          './fetch_subscription_data_job.js'
        )

        await FetchSubscriptionDataJob.dispatch({
          subscriptionId: subscription.id,
        })

        logger.info(`Queued subscription ${subscription.id} (${subscription.name}) for processing`)
      }

      logger.info('Successfully queued all due subscriptions')
      return {}
    } catch (error) {
      logger.error('Error processing due subscriptions:', error)
      throw error
    }
  }
}

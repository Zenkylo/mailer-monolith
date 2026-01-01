import { Job } from '@nemoventures/adonis-jobs'
import type { BullJobsOptions } from '@nemoventures/adonis-jobs/types'
import Subscription from '#models/subscription'
import CronService from '#services/cron_service'
import logger from '@adonisjs/core/services/logger'
import axios from 'axios'

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

    try {
      // Load the subscription with user data
      const subscription = await Subscription.query()
        .where('id', subscriptionId)
        .preload('user')
        .firstOrFail()

      logger.info(`Fetching data for subscription ${subscription.id} (${subscription.name})`)

      // Fetch data from the user's endpoint
      const response = await axios.get(subscription.endpoint, {
        timeout: 5000,
        headers: {
          'User-Agent': 'SubscriptionService/1.0',
          'Accept': 'application/json',
        },
      })

      logger.info(`Successfully fetched data for subscription ${subscription.id}`)

      // Queue email job with the fetched data
      const { default: SendSubscriptionEmailJob } = await import('./send_subscription_email_job.js')
      await SendSubscriptionEmailJob.dispatch({
        subscriptionId: subscription.id,
        data: response.data,
        fetchedAt: new Date().toISOString(),
        statusCode: response.status,
      })

      // Mark subscription as successfully run
      await CronService.markAsRun(subscription)

      logger.info(`Queued email for subscription ${subscription.id}`)

      return {}
    } catch (error) {
      logger.error(`Failed to fetch data for subscription ${subscriptionId}:`, error.message)

      try {
        // Load subscription for error handling
        const subscription = await Subscription.findOrFail(subscriptionId)

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

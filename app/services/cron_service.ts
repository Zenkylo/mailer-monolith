import { DateTime } from 'luxon'
import parser from 'cron-parser'
import Subscription from '#models/subscription'
import logger from '@adonisjs/core/services/logger'

export default class CronService {
  /**
   * Check if a subscription is due to run based on its cron expression and last run time
   */
  static isDue(subscription: Subscription): boolean {
    // If it's never been run, it's due
    if (!subscription.lastRunAt) {
      return true
    }

    // If we have a pre-calculated next run time, use that for performance
    if (subscription.nextRunAt) {
      return DateTime.now() >= subscription.nextRunAt
    }

    // Fallback: calculate if due based on cron expression
    try {
      const cronExpression = parser.parseExpression(subscription.cronExpression, {
        tz: subscription.timezone || 'UTC',
      })

      // Get the next scheduled time after the last run
      const nextScheduledTime = cronExpression.next().toDate()
      return DateTime.now() >= DateTime.fromJSDate(nextScheduledTime)
    } catch (error) {
      // Invalid cron expression, don't run
      console.error(
        `Invalid cron expression for subscription ${subscription.id}: ${subscription.cronExpression}`
      )
      return false
    }
  }

  /**
   * Calculate the next run time for a subscription based on its cron expression
   */
  static calculateNextRun(cronExpression: string, timezone: string = 'UTC'): DateTime | null {
    try {
      const expression = parser.parseExpression(cronExpression, { tz: timezone })
      return DateTime.fromJSDate(expression.next().toDate())
    } catch (error) {
      console.error(`Error calculating next run for cron expression: ${cronExpression}`, error)
      return null
    }
  }

  /**
   * Update a subscription's next run time
   */
  static async updateNextRunTime(subscription: Subscription): Promise<void> {
    const nextRun = this.calculateNextRun(subscription.cronExpression, subscription.timezone)
    if (nextRun) {
      subscription.nextRunAt = nextRun
      await subscription.save()
    }
  }

  /**
   * Get all subscriptions that are due to run
   */
  static async getDueSubscriptions(): Promise<Subscription[]> {
    const allActiveSubscriptions = await Subscription.query().where('enabled', true).preload('user')

    const dueSubscriptions = allActiveSubscriptions.filter((subscription) =>
      this.isDue(subscription)
    )

    return dueSubscriptions
  }

  /**
   * Mark a subscription as having been run successfully
   */
  static async markAsRun(subscription: Subscription): Promise<void> {
    const now = DateTime.now()
    subscription.lastRunAt = now
    subscription.nextRunAt = this.calculateNextRun(
      subscription.cronExpression,
      subscription.timezone
    )
    await subscription.save()
  }

  /**
   * Mark a subscription as having failed
   */
  static async markAsFailed(subscription: Subscription, error?: string): Promise<void> {
    subscription.failureCount = (subscription.failureCount || 0) + 1
    subscription.lastFailureAt = DateTime.now()
    if (error) {
      logger.error(`Subscription ${subscription.id} failed: ${error}`)
    }
    await subscription.save()
  }
}

import User from '#models/user'
import logger from '@adonisjs/core/services/logger'

export interface BounceNotification {
  email: string
  bounceType: 'Permanent' | 'Transient'
  bounceSubType: string
  timestamp: string
  reason?: string
  provider: 'ses' | 'mailgun' | 'sendgrid' | 'other'
}

export interface ComplaintNotification {
  email: string
  timestamp: string
  provider: 'ses' | 'mailgun' | 'sendgrid' | 'other'
}

export default class EmailBounceService {
  /**
   * Process bounce notification from any email provider
   */
  static async processBounce(notification: BounceNotification): Promise<void> {
    const email = notification.email.toLowerCase()
    try {
      const user = await User.findBy('email', email)
      if (!user) {
        logger.warn(`Bounce received for unknown email: ${email}`)
        return
      }

      const bounceType = notification.bounceType === 'Permanent' ? 'hard' : 'soft'
      const reason = `${notification.bounceSubType}: ${notification.reason || 'No reason provided'}`

      await user.markEmailBounced(reason, bounceType)

      logger.info(`Email bounce processed for user ${user.id}: ${email} (${bounceType})`)

      // If user is now bounced, disable their active subscriptions
      if (user.emailStatus === 'bounced') {
        await this.disableUserSubscriptions(user)
      }
    } catch (error) {
      logger.error('Error processing email bounce:', error)
    }
  }

  /**
   * Process complaint notification from any email provider
   */
  static async processComplaint(notification: ComplaintNotification): Promise<void> {
    const email = notification.email.toLowerCase()
    try {
      const user = await User.findBy('email', email)
      if (!user) {
        logger.warn(`Complaint received for unknown email: ${email}`)
        return
      }

      await user.markEmailComplained()

      logger.info(`Email complaint processed for user ${user.id}: ${email}`)

      // Disable all subscriptions for complained users
      await this.disableUserSubscriptions(user)
    } catch (error) {
      logger.error('Error processing email complaint:', error)
    }
  }

  /**
   * Disable all subscriptions for a user with email issues
   */
  private static async disableUserSubscriptions(user: User): Promise<void> {
    const { default: Subscription } = await import('#models/subscription')

    await Subscription.query()
      .where('user_id', user.id)
      .where('enabled', true)
      .update({ enabled: false })

    logger.info(`Disabled all subscriptions for user ${user.id} due to email issues`)
  }

  /**
   * Check if email can be sent to user
   */
  static async canSendEmail(email: string): Promise<boolean> {
    email = email.toLowerCase()
    const user = await User.findBy('email', email)
    return user ? user.canReceiveEmails() : true
  }

  /**
   * Get bounce statistics
   */
  static async getBounceStats(): Promise<{
    totalBounced: number
    totalComplaints: number
    recentBounces: number
  }> {
    const totalBounced = await User.query().where('email_status', 'bounced').count('* as total')
    const totalComplaints = await User.query()
      .where('email_status', 'complained')
      .count('* as total')

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentBounces = await User.query()
      .where('last_bounce_at', '>', oneDayAgo)
      .count('* as total')

    return {
      totalBounced: Number((totalBounced[0] as any).total),
      totalComplaints: Number((totalComplaints[0] as any).total),
      recentBounces: Number((recentBounces[0] as any).total),
    }
  }

  /**
   * Get users with email issues for admin review
   */
  static async getUsersWithEmailIssues(limit: number = 50): Promise<User[]> {
    return await User.query()
      .whereIn('email_status', ['bounced', 'complained', 'suppressed'])
      .orderBy('email_status_updated_at', 'desc')
      .limit(limit)
  }

  /**
   * Bulk reactivate emails (for admin use)
   */
  static async bulkReactivateEmails(userIds: number[]): Promise<number> {
    const result = await User.query().whereIn('id', userIds).update({
      email_status: 'active',
      email_status_updated_at: new Date(),
      email_bounce_reason: null,
      bounce_count: 0,
    })

    const updated = Array.isArray(result) ? result.length : result
    logger.info(`Bulk reactivated ${updated} user emails`)
    return updated
  }
}

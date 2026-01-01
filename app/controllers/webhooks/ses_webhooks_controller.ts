import { HttpContext } from '@adonisjs/core/http'
import EmailBounceService from '#services/email_bounce_service'
import logger from '@adonisjs/core/services/logger'

export default class SesWebhooksController {
  /**
   * Handle SES bounce/complaint notifications
   */
  public async handleNotification({ request, response }: HttpContext) {
    try {
      const body = request.body()

      // Handle SNS subscription confirmation
      if (body.Type === 'SubscriptionConfirmation') {
        logger.info('SNS subscription confirmation received')
        return response.ok({ message: 'Subscription confirmed' })
      }

      // Parse the message
      const message = typeof body.Message === 'string' ? JSON.parse(body.Message) : body.Message

      if (message.notificationType === 'Bounce') {
        await this.handleBounce(message)
      } else if (message.notificationType === 'Complaint') {
        await this.handleComplaint(message)
      } else if (message.notificationType === 'Delivery') {
        // Log successful delivery but don't need to process
        logger.info(`Email delivered successfully to: ${message.delivery?.recipients?.join(', ')}`)
      }

      return response.ok({ message: 'Notification processed' })
    } catch (error) {
      logger.error('Error processing SES notification:', error)
      return response.internalServerError({ error: 'Failed to process notification' })
    }
  }

  /**
   * Handle bounce notifications from SES
   */
  private async handleBounce(message: any) {
    const bounce = message.bounce

    for (const recipient of bounce.bouncedRecipients) {
      await EmailBounceService.processBounce({
        email: recipient.emailAddress,
        bounceType: bounce.bounceType,
        bounceSubType: bounce.bounceSubType,
        timestamp: message.timestamp,
        reason: recipient.diagnosticCode || recipient.status,
        provider: 'ses',
      })
    }

    logger.info(`Processed ${bounce.bouncedRecipients.length} bounce(s) from SES`)
  }

  /**
   * Handle complaint notifications from SES
   */
  private async handleComplaint(message: any) {
    const complaint = message.complaint

    for (const recipient of complaint.complainedRecipients) {
      await EmailBounceService.processComplaint({
        email: recipient.emailAddress,
        timestamp: message.timestamp,
        provider: 'ses',
      })
    }

    logger.info(`Processed ${complaint.complainedRecipients.length} complaint(s) from SES`)
  }

  /**
   * Get bounce statistics (for admin dashboard)
   */
  public async getBounceStats({ response }: HttpContext) {
    try {
      const stats = await EmailBounceService.getBounceStats()
      return response.ok(stats)
    } catch (error) {
      logger.error('Error getting bounce stats:', error)
      return response.internalServerError({ error: 'Failed to get bounce stats' })
    }
  }

  /**
   * Get users with email issues (for admin dashboard)
   */
  public async getUsersWithEmailIssues({ request, response }: HttpContext) {
    try {
      const limit = request.input('limit', 50)
      const users = await EmailBounceService.getUsersWithEmailIssues(limit)
      return response.ok(users)
    } catch (error) {
      logger.error('Error getting users with email issues:', error)
      return response.internalServerError({ error: 'Failed to get users with email issues' })
    }
  }

  /**
   * Reactivate user emails (for admin use)
   */
  public async reactivateEmails({ request, response }: HttpContext) {
    try {
      const userIds = request.input('userIds', [])

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return response.badRequest({ error: 'userIds array is required' })
      }

      const reactivated = await EmailBounceService.bulkReactivateEmails(userIds)
      return response.ok({ message: `Reactivated ${reactivated} user emails`, count: reactivated })
    } catch (error) {
      logger.error('Error reactivating emails:', error)
      return response.internalServerError({ error: 'Failed to reactivate emails' })
    }
  }
}

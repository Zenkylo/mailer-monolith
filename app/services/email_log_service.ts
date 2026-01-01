import EmailLog from '#models/email_log'
import type { EmailLogStatus, EmailLogType } from '#models/email_log'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

export interface CreateEmailLogData {
  subject: string
  recipientEmail: string
  userId: number
  subscriptionId?: number
  emailType: EmailLogType
  htmlContent?: string
  textContent?: string
  templateData?: Record<string, any>
  provider?: string
}

export interface EmailSentData {
  messageId?: string
  providerResponse?: string
}

export default class EmailLogService {
  /**
   * Create a new email log entry
   */
  static async createLog(data: CreateEmailLogData): Promise<EmailLog> {
    const emailLog = await EmailLog.create({
      subject: data.subject,
      recipientEmail: data.recipientEmail,
      userId: data.userId,
      subscriptionId: data.subscriptionId,
      emailType: data.emailType,
      htmlContent: data.htmlContent,
      textContent: data.textContent,
      templateData: data.templateData,
      status: 'pending',
      provider: data.provider || 'ses',
    })

    logger.info(`Email log created: ${emailLog.id} for ${data.recipientEmail}`)
    return emailLog
  }

  /**
   * Mark email as sent
   */
  static async markAsSent(emailLogId: number, data: EmailSentData): Promise<void> {
    const emailLog = await EmailLog.findOrFail(emailLogId)
    emailLog.markAsSent(data.messageId, data.providerResponse)
    await emailLog.save()

    logger.info(`Email ${emailLogId} marked as sent with message ID: ${data.messageId}`)
  }

  /**
   * Mark email as delivered (via webhook)
   */
  static async markAsDelivered(messageId: string): Promise<void> {
    const emailLog = await EmailLog.query().where('message_id', messageId).first()
    if (emailLog) {
      emailLog.markAsDelivered()
      await emailLog.save()
      logger.info(`Email ${emailLog.id} marked as delivered`)
    }
  }

  /**
   * Mark email as bounced (via webhook)
   */
  static async markAsBounced(messageId: string, errorMessage?: string): Promise<void> {
    const emailLog = await EmailLog.query().where('message_id', messageId).first()
    if (emailLog) {
      emailLog.markAsBounced(errorMessage)
      await emailLog.save()
      logger.info(`Email ${emailLog.id} marked as bounced: ${errorMessage}`)
    }
  }

  /**
   * Mark email as complained (via webhook)
   */
  static async markAsComplained(messageId: string): Promise<void> {
    const emailLog = await EmailLog.query().where('message_id', messageId).first()
    if (emailLog) {
      emailLog.markAsComplained()
      await emailLog.save()
      logger.info(`Email ${emailLog.id} marked as complained`)
    }
  }

  /**
   * Mark email as failed
   */
  static async markAsFailed(emailLogId: number, errorMessage: string): Promise<void> {
    const emailLog = await EmailLog.findOrFail(emailLogId)
    emailLog.markAsFailed(errorMessage)
    await emailLog.save()

    logger.error(`Email ${emailLogId} marked as failed: ${errorMessage}`)
  }

  /**
   * Get email logs for a user with pagination
   */
  static async getUserEmailLogs(
    userId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: EmailLog[]
    pagination: {
      currentPage: number
      perPage: number
      total: number
      lastPage: number
    }
  }> {
    const emailLogs = await EmailLog.query()
      .where('user_id', userId)
      .preload('subscription', (query) => {
        query.select('id', 'name', 'nid')
      })
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return {
      data: emailLogs.all(),
      pagination: {
        currentPage: emailLogs.currentPage,
        perPage: emailLogs.perPage,
        total: emailLogs.total,
        lastPage: emailLogs.lastPage,
      },
    }
  }

  /**
   * Get email logs for a subscription
   */
  static async getSubscriptionEmailLogs(
    subscriptionId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<EmailLog[]> {
    const emailLogs = await EmailLog.query()
      .where('subscription_id', subscriptionId)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return emailLogs.all()
  }

  /**
   * Get email statistics for a user
   */
  static async getUserEmailStats(userId: number): Promise<{
    total: number
    sent: number
    delivered: number
    bounced: number
    complained: number
    failed: number
    pending: number
  }> {
    const stats = await EmailLog.query()
      .where('user_id', userId)
      .groupBy('status')
      .select('status')
      .count('* as count')

    const result = {
      total: 0,
      sent: 0,
      delivered: 0,
      bounced: 0,
      complained: 0,
      failed: 0,
      pending: 0,
    }

    for (const stat of stats) {
      const status = stat.$extras.status as EmailLogStatus
      const count = Number(stat.$extras.count)
      result[status] = count
      result.total += count
    }

    return result
  }

  /**
   * Clean up old email logs (retention policy)
   */
  static async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = DateTime.now().minus({ days: retentionDays })

    const deletedRows = await EmailLog.query().where('created_at', '<', cutoffDate.toSQL()).delete()

    const deletedCount = Array.isArray(deletedRows) ? deletedRows.length : deletedRows
    logger.info(`Cleaned up ${deletedCount} email logs older than ${retentionDays} days`)
    return deletedCount
  }

  /**
   * Find email log by message ID (for webhook processing)
   */
  static async findByMessageId(messageId: string): Promise<EmailLog | null> {
    return EmailLog.query().where('message_id', messageId).first()
  }

  /**
   * Find email log by ID
   */
  static async findById(id: number): Promise<EmailLog | null> {
    return EmailLog.find(id)
  }
}

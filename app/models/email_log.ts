import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { nanoid } from 'nanoid'
import User from '#models/user'
import Subscription from '#models/subscription'

export type EmailLogStatus = 'pending' | 'sent' | 'delivered' | 'bounced' | 'complained' | 'failed'
export type EmailLogType = 'subscription' | 'failure' | 'notification' | 'welcome' | 'other'

export default class EmailLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nid: string

  // Email identifiers
  @column()
  declare messageId: string | null

  @column()
  declare subject: string

  @column()
  declare recipientEmail: string

  @column()
  declare userId: number

  // Subscription context
  @column()
  declare subscriptionId: number | null

  @column()
  declare emailType: EmailLogType

  // Email content
  @column()
  declare htmlContent: string | null

  @column()
  declare textContent: string | null

  @column({
    consume: (value: any) => {
      if (value === null || value === undefined) return null
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return null
        }
      }
      return value
    },
    prepare: (value: any) => (value ? JSON.stringify(value) : null),
  })
  declare templateData: Record<string, any> | null

  // Delivery tracking
  @column()
  declare status: EmailLogStatus

  @column()
  declare provider: string

  @column()
  declare providerResponse: string | null

  @column()
  declare errorMessage: string | null

  // Delivery timestamps
  @column.dateTime()
  declare sentAt: DateTime | null

  @column.dateTime()
  declare deliveredAt: DateTime | null

  @column.dateTime()
  declare bouncedAt: DateTime | null

  @column.dateTime()
  declare complainedAt: DateTime | null

  // Relations
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Subscription)
  declare subscription: BelongsTo<typeof Subscription>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Helper methods
  public markAsSent(messageId?: string, providerResponse?: string): void {
    this.status = 'sent'
    this.sentAt = DateTime.now()
    if (messageId) this.messageId = messageId
    if (providerResponse) this.providerResponse = providerResponse
  }

  public markAsDelivered(): void {
    this.status = 'delivered'
    this.deliveredAt = DateTime.now()
  }

  public markAsBounced(errorMessage?: string): void {
    this.status = 'bounced'
    this.bouncedAt = DateTime.now()
    if (errorMessage) this.errorMessage = errorMessage
  }

  public markAsComplained(): void {
    this.status = 'complained'
    this.complainedAt = DateTime.now()
  }

  public markAsFailed(errorMessage: string): void {
    this.status = 'failed'
    this.errorMessage = errorMessage
  }

  public isDelivered(): boolean {
    return ['sent', 'delivered'].includes(this.status)
  }

  public hasFailed(): boolean {
    return ['bounced', 'complained', 'failed'].includes(this.status)
  }

  @beforeCreate()
  public static generateNid(emailLog: EmailLog) {
    emailLog.nid = nanoid(36)
  }
}

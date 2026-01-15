import SubscriptionResponse from '#models/subscription_response'
import User from '#models/user'
import {
  BaseModel,
  beforeCreate,
  beforeSave,
  belongsTo,
  column,
  computed,
  hasMany,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import parser from 'cron-parser'
import { DateTime } from 'luxon'
import { nanoid } from 'nanoid'
export default class Subscription extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nid: string

  @column()
  declare name: string

  @column()
  declare enabled: boolean

  @column()
  declare cronExpression: string

  @column()
  declare timezone: string

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => SubscriptionResponse)
  declare responses: HasMany<typeof SubscriptionResponse>

  @column()
  declare endpoint: string

  @column.dateTime()
  declare lastRunAt: DateTime | null

  @column.dateTime()
  declare nextRunAt: DateTime | null

  @column()
  declare failureCount: number

  @column.dateTime()
  declare lastFailureAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  get nextEmailNice() {
    const format = 'cccc, LLLL d, yyyy h:mm a'
    return this.nextRunAt ? this.nextRunAt.setZone(this.timezone).toFormat(format) : ''
  }

  @computed()
  get timeUntilNextEmail() {
    if (!this.nextRunAt) return ''
    const duration = this.nextRunAt.diffNow()
    if (duration.as('days') >= 1) {
      return `${Math.floor(duration.as('days'))}d`
    } else if (duration.as('hours') >= 1) {
      const hours = Math.floor(duration.as('hours'))
      const minutes = Math.floor(duration.minus({ hours }).as('minutes'))
      return `${hours}h${hours !== 1 ? 's' : ''}${minutes > 0 ? `${minutes}m` : ''}`
    } else if (duration.as('minutes') >= 1) {
      const minutes = Math.floor(duration.as('minutes'))
      return `${minutes}m`
    } else {
      return ``
    }
  }

  @beforeCreate()
  public static generateNid(subscription: Subscription) {
    subscription.nid = nanoid(10)
  }

  @beforeSave()
  public static async setNextRunAt(sub: Subscription) {
    // Update nextRunAt when cronExpression changes or on creation
    if (sub.cronExpression && (!sub.$isPersisted || sub.$dirty.cronExpression)) {
      try {
        const interval = parser.parseExpression(sub.cronExpression, { tz: sub.timezone })
        sub.nextRunAt = DateTime.fromJSDate(interval.next().toDate())
      } catch (e) {
        // Invalid cron expression, set to null
        sub.nextRunAt = null
      }
    }
  }
}

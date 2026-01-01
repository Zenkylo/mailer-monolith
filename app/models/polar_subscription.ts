import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class PolarSubscription extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare polarId: string

  @column()
  declare polarAmount: number

  @column()
  declare polarCurrency: string

  @column()
  declare polarRecurringInterval: string

  @column()
  declare polarStatus: string

  @column()
  declare polarCurrentPeriodStart: DateTime

  @column()
  declare polarCurrentPeriodEnd: DateTime | null

  @column()
  declare polarTrialStart: DateTime | null

  @column()
  declare polarTrialEnd: DateTime | null

  @column()
  declare polarCancelAtPeriodEnd: boolean

  @column()
  declare polarCanceledAt: DateTime | null

  @column()
  declare polarStartedAt: DateTime | null

  @column()
  declare polarEndsAt: DateTime | null

  @column()
  declare polarEndedAt: DateTime | null

  @column()
  declare polarCustomerId: string

  @column()
  declare polarProductId: string

  @column()
  declare polarDiscountId: string | null

  @column()
  declare polarCheckoutId: string | null

  @column()
  declare polarCustomerCancellationReason: string | null

  @column()
  declare polarCustomerCancellationComment: string | null

  @column()
  declare polarModifiedAt: DateTime | null

  @column()
  declare polarMetadata: Record<string, string | number | boolean>

  @column()
  declare polarCustomFieldData: Record<string, string | number | boolean | Date | null> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

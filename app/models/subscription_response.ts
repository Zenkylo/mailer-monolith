import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Subscription from '#models/subscription'
// import { SubscriptionResponseType } from '#types/subscription_response_type'

export default class SubscriptionResponse extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare subscriptionId: number

  @belongsTo(() => Subscription)
  declare subscription: BelongsTo<typeof Subscription>

  @column()
  declare endpoint: string

  @column()
  declare responseCode: number

  @column()
  // declare responseData: SubscriptionResponseType | string
  declare responseData: string

  @column()
  declare responseMessage: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // https://github.com/brianc/node-postgres/issues/1519
  @beforeSave()
  public static async saveResponseData(response: SubscriptionResponse) {
    if (typeof response.responseData === 'object') {
      response.responseData = JSON.stringify(response.responseData)
    }
  }
}

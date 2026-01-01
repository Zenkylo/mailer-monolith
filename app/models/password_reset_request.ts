import { DateTime } from 'luxon'
import { BaseModel, column, computed, beforeCreate } from '@adonisjs/lucid/orm'
import { nanoid } from 'nanoid'

export default class PasswordResetRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare token: string

  @column()
  declare ipAddress: string

  @column()
  declare status: string

  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async generateToken(request: PasswordResetRequest) {
    request.token = nanoid(32)
  }

  @beforeCreate()
  static async setExpiration(request: PasswordResetRequest) {
    request.expiresAt = DateTime.now().plus({ days: 1 })
  }

  @computed()
  get isExpired() {
    return this.expiresAt < DateTime.now()
  }
}

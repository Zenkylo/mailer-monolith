import { BaseModel, column, beforeCreate, computed } from '@adonisjs/lucid/orm'
import { nanoid } from 'nanoid'
import { DateTime } from 'luxon'

export default class EmailVerification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare token: string

  @column.dateTime()
  declare verifiedAt: DateTime | null

  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  public static async generateToken(emailVerification: EmailVerification) {
    emailVerification.token = nanoid(32)
  }

  @beforeCreate()
  public static async setExpiration(emailVerification: EmailVerification) {
    emailVerification.expiresAt = DateTime.now().plus({ days: 2 })
  }

  @beforeCreate()
  public static async normalizeEmail(emailVerification: EmailVerification) {
    emailVerification.email = emailVerification.email.toLowerCase().trim()
  }

  @computed()
  public get sentMinutesAgo() {
    return Math.round(Math.abs(this.createdAt.diffNow('minutes').minutes))
  }

  @computed()
  public get isExpired() {
    return this.expiresAt < DateTime.now()
  }

  @computed()
  public get isVerified() {
    return !!this.verifiedAt
  }
}

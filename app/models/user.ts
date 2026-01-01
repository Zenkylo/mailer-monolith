import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, beforeCreate, computed } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Subscription from '#models/subscription'
import { nanoid } from 'nanoid'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nid: string

  @column()
  declare stripeCustomerId: string | null

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare emailVerifiedAt: DateTime

  @column()
  declare timeZone: string

  @column()
  declare emailStatus: 'active' | 'bounced' | 'complained' | 'suppressed'

  @column.dateTime()
  declare emailStatusUpdatedAt: DateTime | null

  @column()
  declare emailBounceReason: string | null

  @column()
  declare bounceCount: number

  @column.dateTime()
  declare lastBounceAt: DateTime | null

  @hasMany(() => Subscription)
  declare subscriptions: HasMany<typeof Subscription>

  // @hasOne(() => PolarSubscription)
  // declare polarSubscription: HasOne<typeof PolarSubscription>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @beforeCreate()
  static generateNid(user: User) {
    user.nid = nanoid(10)
  }

  @beforeCreate()
  public static async normalizeEmail(user: User) {
    user.email = user.email.toLowerCase().trim()
  }

  @computed()
  get isVerified(): boolean {
    return !!this.emailVerifiedAt
  }

  /**
   * Check if user can receive emails
   */
  public canReceiveEmails(): boolean {
    return this.emailStatus === 'active'
  }

  /**
   * Mark user email as bounced
   */
  public async markEmailBounced(
    reason: string,
    bounceType: 'hard' | 'soft' = 'soft'
  ): Promise<void> {
    this.bounceCount += 1
    this.lastBounceAt = DateTime.now()
    this.emailBounceReason = reason
    this.emailStatusUpdatedAt = DateTime.now()

    // Hard bounce or multiple soft bounces = suppress
    if (bounceType === 'hard' || this.bounceCount >= 3) {
      this.emailStatus = 'bounced'
    }

    await this.save()
  }

  /**
   * Mark user email as complained (unsubscribed)
   */
  public async markEmailComplained(): Promise<void> {
    this.emailStatus = 'complained'
    this.emailStatusUpdatedAt = DateTime.now()
    await this.save()
  }

  /**
   * Reactivate user email (for manual intervention)
   */
  public async reactivateEmail(): Promise<void> {
    this.emailStatus = 'active'
    this.emailStatusUpdatedAt = DateTime.now()
    this.emailBounceReason = null
    this.bounceCount = 0
    await this.save()
  }
}

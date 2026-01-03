import User from '#models/user'
import PolarSubscription from '#models/polar_subscription'
import { DateTime } from 'luxon'
import subscriptionTiersConfig from '#config/subscription_tiers'

export interface SubscriptionTier {
  name: string
  polarProductIds: string[]
  privileges: {
    maxSubscriptions: number
    maxEmailsPerDay: number
    canViewEmailHistory: boolean
    maxHistoryDays: number
    canExportData: boolean
    prioritySupport: boolean
    customEndpoints: boolean
    advancedScheduling: boolean
  }
}

export interface UserPrivileges {
  tier: string
  maxSubscriptions: number
  maxEmailsPerDay: number
  canViewEmailHistory: boolean
  maxHistoryDays: number
  canExportData: boolean
  prioritySupport: boolean
  customEndpoints: boolean
  advancedScheduling: boolean
  isActive: boolean
}

export interface SubscriptionStatus {
  isActive: boolean
  isCancelled: boolean
  isTrialing: boolean
  endsAt: DateTime | null
  cancelledAt: DateTime | null
  trialEndsAt: DateTime | null
  status: string
}

export default class PrivilegeService {
  private static tiersCache: Record<string, SubscriptionTier> | null = null

  /**
   * Get tiers with caching and hot reload support
   */
  private static get TIERS(): Record<string, SubscriptionTier> {
    if (this.tiersCache === null) {
      this.tiersCache = subscriptionTiersConfig
    }
    return this.tiersCache
  }

  /**
   * Get user's current privileges based on their Polar subscription
   */
  static async getUserPrivileges(user: User): Promise<UserPrivileges> {
    const activeSubscription = await this.getActiveSubscription(user)

    if (!activeSubscription) {
      return this.buildUserPrivileges('free', true)
    }

    const tier = this.getTierByProductId(activeSubscription.polarProductId)
    const isActive = this.isSubscriptionActive(activeSubscription)

    return this.buildUserPrivileges(tier, isActive)
  }

  /**
   * Check if user can create a new subscription
   */
  static async canCreateSubscription(user: User): Promise<{ allowed: boolean; reason?: string }> {
    const privileges = await this.getUserPrivileges(user)

    if (!privileges.isActive) {
      return { allowed: false, reason: 'Your subscription is not active' }
    }

    if (privileges.maxSubscriptions === -1) {
      return { allowed: true } // Unlimited
    }

    const currentCount = await user.related('subscriptions').query().count('* as total')
    const count = Number(currentCount[0].$extras.total)

    if (count >= privileges.maxSubscriptions) {
      return {
        allowed: false,
        reason: `You've reached your limit of ${privileges.maxSubscriptions} subscriptions. Upgrade to create more.`,
      }
    }

    return { allowed: true }
  }

  /**
   * Check if user can receive more emails today
   */
  static async canReceiveEmail(user: User): Promise<{ allowed: boolean; reason?: string }> {
    const privileges = await this.getUserPrivileges(user)

    if (!privileges.isActive) {
      return { allowed: false, reason: 'Your subscription is not active' }
    }

    if (privileges.maxEmailsPerDay === -1) {
      return { allowed: true } // Unlimited
    }

    const today = DateTime.now().startOf('day')
    const { default: EmailLog } = await import('#models/email_log')

    const todayCount = await EmailLog.query()
      .where('userId', user.id)
      .where('sentAt', '>=', today.toSQL())
      .count('* as total')

    const count = Number(todayCount[0].$extras.total)

    if (count >= privileges.maxEmailsPerDay) {
      return {
        allowed: false,
        reason: `You've reached your daily email limit of ${privileges.maxEmailsPerDay}. Upgrade for more emails.`,
      }
    }

    return { allowed: true }
  }

  /**
   * Check if user can view email history
   */
  static async canViewEmailHistory(user: User): Promise<{ allowed: boolean; reason?: string }> {
    const privileges = await this.getUserPrivileges(user)

    if (!privileges.isActive) {
      return { allowed: false, reason: 'Your subscription is not active' }
    }

    if (!privileges.canViewEmailHistory) {
      return {
        allowed: false,
        reason:
          'Email history is not available in your current plan. Upgrade to access this feature.',
      }
    }

    return { allowed: true }
  }

  /**
   * Check if user can export data
   */
  static async canExportData(user: User): Promise<{ allowed: boolean; reason?: string }> {
    const privileges = await this.getUserPrivileges(user)

    if (!privileges.isActive) {
      return { allowed: false, reason: 'Your subscription is not active' }
    }

    if (!privileges.canExportData) {
      return {
        allowed: false,
        reason:
          'Data export is not available in your current plan. Upgrade to access this feature.',
      }
    }

    return { allowed: true }
  }

  /**
   * Get detailed subscription status for user
   */
  static async getSubscriptionStatus(user: User): Promise<SubscriptionStatus | null> {
    const activeSubscription = await this.getActiveSubscription(user)

    if (!activeSubscription) {
      return null
    }

    const isActive = this.isSubscriptionActive(activeSubscription)
    const isCancelled =
      activeSubscription.polarCancelAtPeriodEnd || !!activeSubscription.polarCanceledAt
    const isTrialing = activeSubscription.polarStatus === 'trialing'

    return {
      isActive,
      isCancelled,
      isTrialing,
      endsAt: activeSubscription.polarEndsAt,
      cancelledAt: activeSubscription.polarCanceledAt,
      trialEndsAt: activeSubscription.polarTrialEnd,
      status: activeSubscription.polarStatus,
    }
  }
  static async getUserUsage(user: User): Promise<{
    subscriptions: { current: number; limit: number }
    emailsToday: { current: number; limit: number }
    tier: string
    subscriptionStatus?: SubscriptionStatus | null
  }> {
    const privileges = await this.getUserPrivileges(user)
    const subscriptionStatus = await this.getSubscriptionStatus(user)

    // Get subscription count
    const subscriptionCount = await user.related('subscriptions').query().count('* as total')
    const currentSubscriptions = Number(subscriptionCount[0].$extras.total)

    // Get today's email count
    const today = DateTime.now().startOf('day')
    const { default: EmailLog } = await import('#models/email_log')

    const emailCount = await EmailLog.query()
      .where('userId', user.id)
      .where('sentAt', '>=', today.toSQL())
      .count('* as total')

    const currentEmails = Number(emailCount[0].$extras.total)

    return {
      subscriptions: {
        current: currentSubscriptions,
        limit: privileges.maxSubscriptions,
      },
      emailsToday: {
        current: currentEmails,
        limit: privileges.maxEmailsPerDay,
      },
      tier: privileges.tier,
      subscriptionStatus,
    }
  }

  /**
   * Get active Polar subscription for user
   */
  private static async getActiveSubscription(user: User): Promise<PolarSubscription | null> {
    return await PolarSubscription.query()
      .where('userId', user.id)
      .whereIn('polarStatus', ['active', 'trialing'])
      .orderBy('createdAt', 'desc')
      .first()
  }

  /**
   * Get tier name by Polar product ID
   */
  private static getTierByProductId(productId: string): string {
    for (const [tierName, tier] of Object.entries(this.TIERS)) {
      if (tier.polarProductIds.includes(productId)) {
        return tierName
      }
    }
    return 'free' // Default to free if product ID not found
  }

  /**
   * Check if subscription is currently active
   */
  private static isSubscriptionActive(subscription: PolarSubscription): boolean {
    const now = DateTime.now()

    // Check if subscription is in active status
    if (!['active', 'trialing'].includes(subscription.polarStatus)) {
      return false
    }

    // Check if subscription hasn't ended
    if (subscription.polarEndedAt && subscription.polarEndedAt <= now) {
      return false
    }

    // Check if trial hasn't expired
    if (
      subscription.polarTrialEnd &&
      subscription.polarTrialEnd <= now &&
      subscription.polarStatus === 'trialing'
    ) {
      return false
    }

    return true
  }

  /**
   * Build user privileges object
   */
  private static buildUserPrivileges(tierName: string, isActive: boolean): UserPrivileges {
    const tier = this.TIERS[tierName] || this.TIERS.free

    return {
      tier: tier.name,
      isActive,
      ...tier.privileges,
    }
  }

  /**
   * Get all available tiers (for pricing pages, etc.)
   */
  static async getAllTiers(): Promise<Record<string, SubscriptionTier>> {
    return this.TIERS
  }

  /**
   * Get tier hierarchy in order from lowest to highest
   */
  static getTierHierarchy(): string[] {
    // Define the order of tiers from lowest to highest
    return ['free', 'starter', 'pro'] // Add more tiers here as you expand
  }

  /**
   * Get tier with hierarchy position information
   */
  static getTiersWithHierarchy(): Record<string, SubscriptionTier & { hierarchyPosition: number }> {
    const hierarchy = this.getTierHierarchy()
    const result: Record<string, SubscriptionTier & { hierarchyPosition: number }> = {}

    hierarchy.forEach((tierKey, index) => {
      if (this.TIERS[tierKey]) {
        result[tierKey] = {
          ...this.TIERS[tierKey],
          hierarchyPosition: index,
        }
      }
    })

    return result
  }

  /**
   * Get tier details by name
   */
  static async getTier(tierName: string): Promise<SubscriptionTier | null> {
    return this.TIERS[tierName] || null
  }
}

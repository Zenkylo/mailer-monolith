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

const subscriptionTiers: Record<string, SubscriptionTier> = {
  free: {
    name: 'Free',
    polarProductIds: [], // No Polar subscription = free tier
    privileges: {
      maxSubscriptions: 2,
      maxEmailsPerDay: 10,
      canViewEmailHistory: false,
      maxHistoryDays: 7,
      canExportData: false,
      prioritySupport: false,
      customEndpoints: false,
      advancedScheduling: false,
    },
  },
  starter: {
    name: 'Starter',
    polarProductIds: ['bff1145b-1a39-4385-811b-71a24148b25f'],
    privileges: {
      maxSubscriptions: 10,
      maxEmailsPerDay: 100,
      canViewEmailHistory: true,
      maxHistoryDays: 30,
      canExportData: false,
      prioritySupport: false,
      customEndpoints: true,
      advancedScheduling: false,
    },
  },
  pro: {
    name: 'Pro',
    polarProductIds: ['30da02c2-e96f-4553-a339-284c6d46ab7a'],
    privileges: {
      maxSubscriptions: 50,
      maxEmailsPerDay: 1000,
      canViewEmailHistory: true,
      maxHistoryDays: 365,
      canExportData: true,
      prioritySupport: true,
      customEndpoints: true,
      advancedScheduling: true,
    },
  },
}

export default subscriptionTiers

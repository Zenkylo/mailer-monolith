<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Upgrade Your Plan</h1>
      <div
        v-if="reason"
        class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6"
      >
        <div class="flex items-center">
          <svg class="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-yellow-800 dark:text-yellow-200">{{ reason }}</p>
        </div>
      </div>
    </div>

    <!-- Current Usage -->
    <div v-if="usage" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Usage</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Subscriptions</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ usage.subscriptions.current }} /
              {{ usage.subscriptions.limit === -1 ? '∞' : usage.subscriptions.limit }}
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{
                width:
                  usage.subscriptions.limit === -1
                    ? '100%'
                    : `${Math.min((usage.subscriptions.current / usage.subscriptions.limit) * 100, 100)}%`,
              }"
            ></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Emails Today</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ usage.emailsToday.current }} /
              {{ usage.emailsToday.limit === -1 ? '∞' : usage.emailsToday.limit }}
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-green-600 h-2 rounded-full transition-all duration-300"
              :style="{
                width:
                  usage.emailsToday.limit === -1
                    ? '100%'
                    : `${Math.min((usage.emailsToday.current / usage.emailsToday.limit) * 100, 100)}%`,
              }"
            ></div>
          </div>
        </div>
      </div>

      <div class="mt-4 text-center">
        <span
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        >
          Current Plan: {{ usage.tier }}
        </span>
      </div>
    </div>

    <!-- Pricing Tiers -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="(tier, key) in tiers"
        :key="key"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 transition-all duration-300 hover:shadow-xl"
        :class="
          key === 'pro'
            ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
            : 'border-gray-200 dark:border-gray-700'
        "
      >
        <div class="p-6">
          <div class="text-center mb-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ tier.name }}</h3>
            <div v-if="key === 'pro'" class="mt-2">
              <span class="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                Most Popular
              </span>
            </div>
          </div>

          <ul class="space-y-3 mb-6">
            <li class="flex items-center text-sm">
              <svg class="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="text-gray-700 dark:text-gray-300">
                {{
                  tier.privileges.maxSubscriptions === -1
                    ? 'Unlimited'
                    : tier.privileges.maxSubscriptions
                }}
                subscriptions
              </span>
            </li>

            <li class="flex items-center text-sm">
              <svg class="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="text-gray-700 dark:text-gray-300">
                {{
                  tier.privileges.maxEmailsPerDay === -1
                    ? 'Unlimited'
                    : tier.privileges.maxEmailsPerDay
                }}
                emails/day
              </span>
            </li>

            <li class="flex items-center text-sm">
              <svg
                class="w-4 h-4 mr-3"
                :class="tier.privileges.canViewEmailHistory ? 'text-green-500' : 'text-gray-400'"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  v-if="tier.privileges.canViewEmailHistory"
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
                <path
                  v-else
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
              <span
                class="text-sm"
                :class="
                  tier.privileges.canViewEmailHistory
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-500'
                "
              >
                Email history
                {{
                  tier.privileges.canViewEmailHistory
                    ? `(${tier.privileges.maxHistoryDays === -1 ? 'unlimited' : tier.privileges.maxHistoryDays + ' days'})`
                    : ''
                }}
              </span>
            </li>

            <li class="flex items-center text-sm">
              <svg
                class="w-4 h-4 mr-3"
                :class="tier.privileges.canExportData ? 'text-green-500' : 'text-gray-400'"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  v-if="tier.privileges.canExportData"
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
                <path
                  v-else
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
              <span
                class="text-sm"
                :class="
                  tier.privileges.canExportData
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-500'
                "
              >
                Data export
              </span>
            </li>

            <li class="flex items-center text-sm">
              <svg
                class="w-4 h-4 mr-3"
                :class="tier.privileges.prioritySupport ? 'text-green-500' : 'text-gray-400'"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  v-if="tier.privileges.prioritySupport"
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
                <path
                  v-else
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
              <span
                class="text-sm"
                :class="
                  tier.privileges.prioritySupport
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-500'
                "
              >
                Priority support
              </span>
            </li>
          </ul>

          <div class="text-center">
            <button
              v-if="!isCurrentTier(key)"
              onclick="upgrade_modal.showModal()"
              class="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 text-center"
              :class="
                canUpgradeTo(key)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : isDowngradeTo(key)
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
              "
            >
              {{ getButtonText(key) }}
            </button>
            <button
              v-else
              class="w-full py-2 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed"
              disabled
            >
              {{ getButtonText(key) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Back to Dashboard -->
    <div class="text-center mt-8">
      <Link
        href="/dashboard"
        class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        ← Back to Dashboard
      </Link>
    </div>

    <!-- Upgrade Modal -->
    <dialog id="upgrade_modal" class="modal backdrop-blur-sm">
      <div class="modal-box max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-4 text-center">
          {{ getModalMessage.title }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
          {{ getModalMessage.message }}
          <span v-if="getModalMessage.highlight" class="block mt-2 font-medium text-blue-600 dark:text-blue-400">
            {{ getModalMessage.highlight }}
          </span>
        </p>
        <div class="flex justify-center">
          <a
            href="/dashboard/billing/portal"
            class="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Continue to Billing Portal
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button class="cursor-pointer">close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { computed } from 'vue'
import dashboardLayout from '~/layouts/dashboard.vue'

defineOptions({ layout: dashboardLayout })

interface Props {
  reason?: string
  feature?: string
  usage?: {
    subscriptions: { current: number; limit: number }
    emailsToday: { current: number; limit: number }
    tier: string
  }
  tiers?: Record<string, any>
  tierHierarchy?: string[]
}

const props = defineProps<Props>()


// Get current user's tier index based on actual tier key (not display name)
const currentTierIndex = computed(() => {
  if (!props.usage?.tier || !props.tierHierarchy) return -1
  // Find by the actual tier key, not the display name
  const currentTierKey = props.tierHierarchy.find(tierKey => {
    const tier = props.tiers?.[tierKey]
    return tier?.name?.toLowerCase() === props.usage?.tier?.toLowerCase()
  })
  return currentTierKey ? props.tierHierarchy.indexOf(currentTierKey) : -1
})

// Check if user can upgrade to a specific tier
const canUpgradeTo = (tierKey: string) => {
  if (!props.tierHierarchy) return false
  const tierIndex = props.tierHierarchy.indexOf(tierKey)
  return currentTierIndex.value !== -1 && tierIndex > currentTierIndex.value
}

// Check if user would be downgrading to a specific tier
const isDowngradeTo = (tierKey: string) => {
  if (!props.tierHierarchy) return false
  const tierIndex = props.tierHierarchy.indexOf(tierKey)
  return currentTierIndex.value !== -1 && tierIndex < currentTierIndex.value && tierIndex !== -1
}

// Check if this is the user's current tier
const isCurrentTier = (tierKey: string) => {
  if (!props.usage?.tier || !props.tierHierarchy) return false
  const currentTierKey = props.tierHierarchy.find(key => {
    const tier = props.tiers?.[key]
    return tier?.name?.toLowerCase() === props.usage?.tier?.toLowerCase()
  })
  return currentTierKey === tierKey
}

// Check if user is on the highest tier
const isOnHighestTier = computed(() => {
  if (currentTierIndex.value === -1 || !props.tierHierarchy) return false
  return currentTierIndex.value === props.tierHierarchy.length - 1
})

// Get button text based on tier relationship
const getButtonText = (tierKey: string) => {
  if (isCurrentTier(tierKey)) {
    return 'Current Plan'
  }
  if (canUpgradeTo(tierKey)) {
    return 'Upgrade'
  }
  if (isDowngradeTo(tierKey)) {
    return 'Downgrade'
  }
  // Fallback for edge cases
  return 'Select Plan'
}

// Get appropriate modal message based on action
const getModalMessage = computed(() => {
  if (isOnHighestTier.value) {
    return {
      title: 'Manage Your Subscription',
      message: 'You\'re currently on our highest tier plan. Use the billing portal to manage your subscription or cancel if needed.',
      highlight: 'You\'re on the highest tier'
    }
  }
  return {
    title: 'Manage Your Subscription', 
    message: 'Use the billing portal to upgrade, downgrade, or cancel your subscription.',
    highlight: null
  }
})
</script>

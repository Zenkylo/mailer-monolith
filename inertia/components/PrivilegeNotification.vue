<template>
  <div
    v-if="showNotification && notification"
    class="fixed top-4 right-4 bg-yellow-50 dark:bg-yellow-900/90 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 shadow-lg max-w-sm z-50"
  >
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          {{ notification.title }}
        </h4>
        <p class="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
          {{ notification.message }}
        </p>
        <div v-if="notification.action" class="mt-3">
          <Link
            :href="notification.action.href"
            class="text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 underline"
          >
            {{ notification.action.text }}
          </Link>
        </div>
      </div>

      <div class="flex-shrink-0">
        <button
          class="text-yellow-400 hover:text-yellow-500 dark:text-yellow-300 dark:hover:text-yellow-200"
          @click="dismissNotification"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Link } from '@inertiajs/vue3'

interface Props {
  usage?: {
    subscriptions: {
      current: number
      limit: number
    }
    emailsToday: {
      current: number
      limit: number
    }
  }
  privileges?: {
    tier: string
  }
}

const props = defineProps<Props>()

const dismissed = ref(false)

const notification = computed(() => {
  if (!props.usage) return null

  // Check subscription usage
  const subUsage = props.usage.subscriptions
  if (subUsage.limit !== -1) {
    const subPercentage = (subUsage.current / subUsage.limit) * 100

    if (subPercentage >= 100) {
      return {
        title: 'Subscription Limit Reached',
        message: `You've reached your ${subUsage.limit} subscription limit. Upgrade your plan to create more subscriptions.`,
        action: {
          text: 'Upgrade Plan',
          href: '/dashboard/account/upgrade',
        },
      }
    }

    if (subPercentage >= 80) {
      return {
        title: 'Approaching Subscription Limit',
        message: `You're using ${subUsage.current} of ${subUsage.limit} subscriptions. Consider upgrading your plan.`,
        action: {
          text: 'View Plans',
          href: '/dashboard/account/upgrade',
        },
      }
    }
  }

  // Check email usage
  const emailUsage = props.usage.emailsToday
  if (emailUsage.limit !== -1) {
    const emailPercentage = (emailUsage.current / emailUsage.limit) * 100

    if (emailPercentage >= 100) {
      return {
        title: 'Daily Email Limit Reached',
        message: `You've reached your daily limit of ${emailUsage.limit} emails. Upgrade for higher limits.`,
        action: {
          text: 'Upgrade Plan',
          href: '/dashboard/account/upgrade',
        },
      }
    }

    if (emailPercentage >= 90) {
      return {
        title: 'Daily Email Limit Almost Reached',
        message: `You've sent ${emailUsage.current} of ${emailUsage.limit} emails today. Consider upgrading for higher limits.`,
        action: {
          text: 'View Plans',
          href: '/dashboard/account/upgrade',
        },
      }
    }
  }

  return null
})

const showNotification = computed(() => {
  return notification.value && !dismissed.value
})

function dismissNotification() {
  dismissed.value = true
  // Store dismissal in localStorage to persist across page reloads for this session
  if (notification.value) {
    localStorage.setItem(`notification-dismissed-${notification.value.title}`, 'true')
  }
}

onMounted(() => {
  // Check if this notification was already dismissed
  if (notification.value) {
    const wasDismissed = localStorage.getItem(`notification-dismissed-${notification.value.title}`)
    if (wasDismissed) {
      dismissed.value = true
    }
  }
})
</script>

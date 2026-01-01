<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
      <button
        @click="showCreateForm = true"
        :disabled="!canCreateMore"
        class="btn btn-primary"
        :class="{ 'opacity-50 cursor-not-allowed': !canCreateMore }"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Create Subscription
      </button>
    </div>

    <!-- Usage Display -->
    <div v-if="usage" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Usage</h2>
        <Link href="/dashboard/account/upgrade" class="btn btn-sm btn-outline"> Upgrade Plan </Link>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Subscriptions</span>
            <span class="text-sm font-medium">
              {{ usage.subscriptions.current }} /
              {{ usage.subscriptions.limit === -1 ? '∞' : usage.subscriptions.limit }}
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all duration-300"
              :class="subscriptionProgressColor"
              :style="{ width: subscriptionProgressWidth + '%' }"
            ></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Emails Today</span>
            <span class="text-sm font-medium">
              {{ usage.emailsToday.current }} /
              {{ usage.emailsToday.limit === -1 ? '∞' : usage.emailsToday.limit }}
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all duration-300"
              :class="emailProgressColor"
              :style="{ width: emailProgressWidth + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <div
        v-if="!canCreateMore"
        class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
      >
        <p class="text-sm text-yellow-700 dark:text-yellow-300">
          You've reached your subscription limit.
          <Link href="/dashboard/account/upgrade" class="underline hover:no-underline">
            Upgrade your plan
          </Link>
          to create more subscriptions.
        </p>
      </div>
    </div>

    <!-- Create Subscription Form Modal -->
    <div
      v-if="showCreateForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Create New Subscription
          </h3>
          <button
            @click="showCreateForm = false"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form @submit.prevent="createSubscription">
          <div class="mb-4">
            <label
              for="name"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Subscription Name
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter subscription name"
            />
          </div>

          <div class="mb-4">
            <label
              for="endpoint"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Webhook Endpoint
            </label>
            <input
              id="endpoint"
              v-model="form.endpoint"
              type="url"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com/webhook"
            />
          </div>

          <div class="mb-6">
            <label
              for="cron"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Cron Expression
            </label>
            <input
              id="cron"
              v-model="form.cron"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0 9 * * 1 (Every Monday at 9 AM)"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use cron format: minute hour day month weekday
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showCreateForm = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting">Creating...</span>
              <span v-else>Create Subscription</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Subscriptions List -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Your Subscriptions</h2>
      </div>

      <div v-if="subscriptions.length === 0" class="p-8 text-center">
        <svg
          class="w-12 h-12 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m2 0h3m3 0h3m3 0h2"
          />
        </svg>
        <p class="text-gray-500 dark:text-gray-400 mb-4">No subscriptions yet</p>
        <button
          @click="showCreateForm = true"
          :disabled="!canCreateMore"
          class="btn btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': !canCreateMore }"
        >
          Create Your First Subscription
        </button>
      </div>

      <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
        <div
          v-for="subscription in subscriptions"
          :key="subscription.nid"
          class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <div
                    class="w-3 h-3 rounded-full"
                    :class="{
                      'bg-green-400': subscription.enabled,
                      'bg-red-400': !subscription.enabled,
                    }"
                  ></div>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {{ subscription.name }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {{ subscription.endpoint }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Next: {{ localDateTime(subscription.nextRunAt) }}
                    <span
                      v-if="subscription.timeUntilNextEmail"
                      class="ml-2 text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded"
                    >
                      {{ subscription.timeUntilNextEmail }}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <label class="flex items-center">
                <input
                  :checked="subscription.enabled"
                  type="checkbox"
                  class="sr-only"
                  @change="toggleSubEnabled(subscription.nid)"
                />
                <div
                  class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  :class="subscription.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'"
                >
                  <span
                    class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
                    :class="subscription.enabled ? 'translate-x-6' : 'translate-x-1'"
                  ></span>
                </div>
              </label>

              <Link
                :href="`/dashboard/subscriptions/${subscription.nid}`"
                class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Link, useForm } from '@inertiajs/vue3'
import dashboard from '~/layouts/dashboard.vue'
import { useDateFormat } from '~/composables/useDateFormat'
import { useHttp } from '~/plugins/NetworkClient'
import { useAppToast } from '~/composables/toast'

defineOptions({
  layout: dashboard,
})

const { localDateTime } = useDateFormat()
const http = useHttp()
const toast = useAppToast()

interface Props {
  subscriptions: Array<{
    nid: string
    name: string
    nextRunAt: string
    enabled: boolean
    cronExpression: string
    endpoint: string
    timeUntilNextEmail: string
  }>
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
}

const props = defineProps<Props>()

const showCreateForm = ref(false)
const isSubmitting = ref(false)

const form = useForm({
  name: '',
  endpoint: '',
  cron: '0 9 * * 1',
})

const canCreateMore = computed(() => {
  if (!props.usage) return true
  return (
    props.usage.subscriptions.limit === -1 ||
    props.usage.subscriptions.current < props.usage.subscriptions.limit
  )
})

const subscriptionProgressWidth = computed(() => {
  if (!props.usage) return 0
  if (props.usage.subscriptions.limit === -1) return 0
  return Math.min((props.usage.subscriptions.current / props.usage.subscriptions.limit) * 100, 100)
})

const subscriptionProgressColor = computed(() => {
  const width = subscriptionProgressWidth.value
  if (width >= 90) return 'bg-red-500'
  if (width >= 75) return 'bg-yellow-500'
  return 'bg-green-500'
})

const emailProgressWidth = computed(() => {
  if (!props.usage) return 0
  if (props.usage.emailsToday.limit === -1) return 0
  return Math.min((props.usage.emailsToday.current / props.usage.emailsToday.limit) * 100, 100)
})

const emailProgressColor = computed(() => {
  const width = emailProgressWidth.value
  if (width >= 90) return 'bg-red-500'
  if (width >= 75) return 'bg-yellow-500'
  return 'bg-blue-500'
})

function createSubscription() {
  if (!canCreateMore.value) return

  isSubmitting.value = true

  form.post('/dashboard/subscriptions', {
    onSuccess: () => {
      showCreateForm.value = false
      form.reset()
      toast.success('Subscription created successfully!')
    },
    onError: () => {
      toast.error('Failed to create subscription. Please try again.')
    },
    onFinish: () => {
      isSubmitting.value = false
    },
  })
}

async function toggleSubEnabled(subscriptionId: string) {
  const subscription = props.subscriptions.find((sub) => sub.nid === subscriptionId)

  if (!subscription) return

  try {
    await http.put(`/subscriptions/${subscription.nid}`, {
      name: subscription.name,
      cron: subscription.cronExpression,
      enabled: !subscription.enabled,
      endpoint: subscription.endpoint,
    })
    subscription.enabled = !subscription.enabled
    toast.success(`Subscription ${subscription.enabled ? 'enabled' : 'disabled'}.`)
  } catch (error) {
    console.error('Error toggling subscription:', error)
    toast.error('Failed to toggle subscription status.')
  }
}
</script>

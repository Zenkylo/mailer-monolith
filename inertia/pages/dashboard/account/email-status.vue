<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center mb-4">
        <Link href="/dashboard/account/settings" class="btn btn-sm"> ← Back to Settings </Link>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Email Status</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Detailed information about your email delivery status
      </p>
    </div>

    <!-- Current Status Card -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Status</h2>

      <div class="flex items-start space-x-4">
        <div
          :class="[
            'w-4 h-4 rounded-full mt-1',
            emailDetails.status === 'active'
              ? 'bg-green-500'
              : emailDetails.status === 'bounced'
                ? 'bg-yellow-500'
                : 'bg-red-500',
          ]"
        ></div>
        <div class="flex-1">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white capitalize">
            {{ emailDetails.status }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            {{ emailDetails.statusDescriptions[emailDetails.status] }}
          </p>
        </div>
      </div>
    </div>

    <!-- Statistics Card -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Email Statistics</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ emailDetails.bounceCount }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Total Bounces</div>
        </div>

        <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ emailDetails.lastBounceAt ? formatDate(emailDetails.lastBounceAt) : 'Never' }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Last Bounce</div>
        </div>

        <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div
            :class="[
              'text-2xl font-bold',
              emailDetails.canReceiveEmails ? 'text-green-600' : 'text-red-600',
            ]"
          >
            {{ emailDetails.canReceiveEmails ? 'Enabled' : 'Disabled' }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Email Delivery</div>
        </div>
      </div>
    </div>

    <!-- Recommendations Card -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recommendations</h2>

      <ul class="space-y-3">
        <li
          v-for="(recommendation, index) in emailDetails.recommendations"
          :key="index"
          class="flex items-start"
        >
          <div class="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
          <p class="text-gray-700 dark:text-gray-300">{{ recommendation }}</p>
        </li>
      </ul>
    </div>

    <!-- Actions Card -->
    <div
      v-if="!emailDetails.canReceiveEmails"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>

      <div
        class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Email delivery is currently disabled
            </h3>
            <p class="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              You will not receive subscription notifications and other important emails until this
              is resolved.
            </p>
          </div>
        </div>
      </div>

      <button
        @click="requestReactivation"
        :disabled="isRequestingReactivation"
        class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        <span v-if="isRequestingReactivation">Requesting...</span>
        <span v-else>Request Email Reactivation</span>
      </button>

      <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
        This will submit a request for an administrator to review and potentially reactivate your
        email delivery.
      </p>
    </div>

    <!-- Success Message -->
    <div
      v-if="emailDetails.canReceiveEmails"
      class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
            Email delivery is working properly
          </h3>
          <p class="mt-1 text-sm text-green-700 dark:text-green-300">
            You are receiving all subscription notifications and important emails.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Link } from '@inertiajs/vue3'
import dashboardLayout from '~/layouts/dashboard.vue'
import { useHttp } from '~/plugins/NetworkClient'
import { useAppToast } from '~/composables/toast'

defineOptions({ layout: dashboardLayout })

interface Props {
  user: {
    id: number
    email: string
    fullName: string | null
  }
  emailDetails: {
    status: string
    bounceCount: number
    lastBounceAt: string | null
    canReceiveEmails: boolean
    statusDescriptions: Record<string, string>
    recommendations: string[]
  }
}

defineProps<Props>()

const http = useHttp()
const toast = useAppToast()
const isRequestingReactivation = ref(false)

async function requestReactivation() {
  if (isRequestingReactivation.value) return

  isRequestingReactivation.value = true

  try {
    const response = await http.post('/dashboard/account/email-reactivation')
    toast.success(response.data.message)
  } catch (error: any) {
    const message = error.response?.data?.error || 'Failed to submit reactivation request'
    toast.error(message)
  } finally {
    isRequestingReactivation.value = false
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

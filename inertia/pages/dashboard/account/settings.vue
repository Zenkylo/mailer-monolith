<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Manage your account information and email preferences
      </p>
    </div>

    <!-- Email Status Card -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Email Status</h2>
        <div class="flex space-x-2">
          <Link href="/dashboard/account/email-history" class="btn btn-sm">History </Link>
          <Link href="/dashboard/account/email-status" class="btn btn-sm"> View Details → </Link>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Status Badge -->
        <div class="flex items-center">
          <div class="mr-3">
            <div
              :class="[
                'w-3 h-3 rounded-full',
                emailStats.status === 'active'
                  ? 'bg-green-500'
                  : emailStats.status === 'bounced'
                    ? 'bg-yellow-500'
                    : 'bg-red-500',
              ]"
            ></div>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Status</p>
            <p class="font-medium text-gray-900 dark:text-white capitalize">
              {{ emailStats.status }}
            </p>
          </div>
        </div>

        <!-- Bounce Count -->
        <div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Total Bounces</p>
          <p class="font-medium text-gray-900 dark:text-white">
            {{ emailStats.bounceCount }}
          </p>
        </div>

        <!-- Can Receive Emails -->
        <div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Email Delivery</p>
          <p
            :class="[
              'font-medium',
              emailStats.canReceiveEmails
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
            ]"
          >
            {{ emailStats.canReceiveEmails ? 'Enabled' : 'Disabled' }}
          </p>
        </div>
      </div>

      <!-- Warning if emails disabled -->
      <div
        v-if="!emailStats.canReceiveEmails"
        class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg"
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
              You may not receive subscription notifications and other important emails.
              <Link
                href="/dashboard/account/email-status"
                class="font-medium underline hover:no-underline"
              >
                View details and request reactivation
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Subscription & Usage Information -->
    <div v-if="privileges" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Plan & Usage</h2>
        <Link href="/dashboard/account/upgrade" class="btn btn-sm btn-primary"> Upgrade Plan </Link>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ privileges.tier }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Current Plan</div>
        </div>

        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ usage?.subscriptions.current || 0 }} /
            {{ usage?.subscriptions.limit === -1 ? '∞' : usage?.subscriptions.limit }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Subscriptions</div>
        </div>

        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ usage?.emailsToday.current || 0 }} /
            {{ usage?.emailsToday.limit === -1 ? '∞' : usage?.emailsToday.limit }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Emails Today</div>
        </div>
      </div>

      <!-- Feature List -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div class="flex items-center">
          <svg
            class="w-4 h-4 mr-2"
            :class="privileges.canViewEmailHistory ? 'text-green-500' : 'text-gray-400'"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              v-if="privileges.canViewEmailHistory"
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
            :class="
              privileges.canViewEmailHistory ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'
            "
          >
            Email History
          </span>
        </div>

        <div class="flex items-center">
          <svg
            class="w-4 h-4 mr-2"
            :class="privileges.canExportData ? 'text-green-500' : 'text-gray-400'"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              v-if="privileges.canExportData"
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
            :class="privileges.canExportData ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'"
          >
            Data Export
          </span>
        </div>

        <div class="flex items-center">
          <svg
            class="w-4 h-4 mr-2"
            :class="privileges.prioritySupport ? 'text-green-500' : 'text-gray-400'"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              v-if="privileges.prioritySupport"
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
            :class="
              privileges.prioritySupport ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'
            "
          >
            Priority Support
          </span>
        </div>

        <div class="flex items-center">
          <svg
            class="w-4 h-4 mr-2"
            :class="privileges.customEndpoints ? 'text-green-500' : 'text-gray-400'"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              v-if="privileges.customEndpoints"
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
            :class="
              privileges.customEndpoints ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'
            "
          >
            Custom Endpoints
          </span>
        </div>
      </div>
    </div>

    <!-- Account Information Card -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <p class="text-gray-900 dark:text-white">{{ user.fullName || 'Not provided' }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <p class="text-gray-900 dark:text-white">{{ user.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Member Since
          </label>
          <p class="text-gray-900 dark:text-white">{{ formatDate(user.createdAt) }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Last Updated
          </label>
          <p class="text-gray-900 dark:text-white">{{ formatDate(user.updatedAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import dashboardLayout from '~/layouts/dashboard.vue'

defineOptions({ layout: dashboardLayout })

interface Props {
  user: {
    id: number
    email: string
    fullName: string | null
    createdAt: string
    updatedAt: string
  }
  emailStats: {
    status: string
    bounceCount: number
    lastBounceAt: string | null
    canReceiveEmails: boolean
  }
  privileges?: {
    tier: string
    canViewEmailHistory: boolean
    canExportData: boolean
    prioritySupport: boolean
    customEndpoints: boolean
  }
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

defineProps<Props>()

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

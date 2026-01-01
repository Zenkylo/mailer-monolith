<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center mb-4">
        <Link href="/dashboard/account/settings" class="btn btn-sm"> ← Back to Settings </Link>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Email History</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Complete history of all emails sent to your account
      </p>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Total Emails</div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
        <div class="text-2xl font-bold text-green-600">{{ stats.sent + stats.delivered }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Successfully Sent</div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
        <div class="text-2xl font-bold text-yellow-600">{{ stats.bounced }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Bounced</div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
        <div class="text-2xl font-bold text-red-600">{{ stats.failed + stats.complained }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Failed/Complained</div>
      </div>
    </div>

    <!-- Email Logs Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Email Log</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Subject
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Subscription
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Delivery
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="email in emailLogs"
              :key="email.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <!-- Date -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDate(email.createdAt) }}
              </td>

              <!-- Subject -->
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                <div class="max-w-xs truncate">{{ email.subject }}</div>
              </td>

              <!-- Type -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full font-medium',
                    getTypeColor(email.emailType),
                  ]"
                >
                  {{ email.emailType }}
                </span>
              </td>

              <!-- Subscription -->
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                <Link
                  v-if="email.subscription"
                  :href="`/dashboard/subscriptions/${email.subscription.nid}`"
                  class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {{ email.subscription.name }}
                </Link>
                <span v-else class="text-gray-400">—</span>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full font-medium',
                    getStatusColor(email.status),
                  ]"
                >
                  {{ email.status }}
                </span>
              </td>

              <!-- Delivery Timeline -->
              <td class="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                <div v-if="email.sentAt" class="mb-1">
                  ✓ Sent: {{ formatDateTime(email.sentAt) }}
                </div>
                <div v-if="email.deliveredAt" class="mb-1 text-green-600">
                  ✓ Delivered: {{ formatDateTime(email.deliveredAt) }}
                </div>
                <div v-if="email.bouncedAt" class="mb-1 text-yellow-600">
                  ⚠ Bounced: {{ formatDateTime(email.bouncedAt) }}
                </div>
                <div v-if="email.complainedAt" class="mb-1 text-red-600">
                  ✗ Complained: {{ formatDateTime(email.complainedAt) }}
                </div>
                <div
                  v-if="email.errorMessage"
                  class="text-red-600 truncate max-w-xs"
                  :title="email.errorMessage"
                >
                  Error: {{ email.errorMessage }}
                </div>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <a
                  :href="`/dashboard/account/email-preview/${email.nid}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors"
                  title="View email content in new tab"
                >
                  📧 View Email
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.lastPage > 1"
        class="px-6 py-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Showing {{ (pagination.currentPage - 1) * pagination.perPage + 1 }} to
            {{ Math.min(pagination.currentPage * pagination.perPage, pagination.total) }} of
            {{ pagination.total }} results
          </div>

          <div class="flex space-x-2">
            <Link
              v-if="pagination.currentPage > 1"
              :href="`/dashboard/account/email-history?page=${pagination.currentPage - 1}`"
              class="btn btn-sm"
            >
              Previous
            </Link>

            <span class="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">
              Page {{ pagination.currentPage }} of {{ pagination.lastPage }}
            </span>

            <Link
              v-if="pagination.currentPage < pagination.lastPage"
              :href="`/dashboard/account/email-history?page=${pagination.currentPage + 1}`"
              class="btn btn-sm"
            >
              Next
            </Link>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="emailLogs.length === 0" class="p-8 text-center">
        <div class="text-gray-400 text-lg mb-2">📧</div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No email history</h3>
        <p class="text-gray-500 dark:text-gray-400">
          No emails have been sent to your account yet.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import dashboardLayout from '~/layouts/dashboard.vue'

defineOptions({ layout: dashboardLayout })

interface EmailLog {
  id: number
  subject: string
  status: string
  emailType: string
  sentAt: string | null
  deliveredAt: string | null
  bouncedAt: string | null
  complainedAt: string | null
  createdAt: string
  subscription: {
    id: number
    name: string
    nid: string
  } | null
  errorMessage: string | null
}

interface Props {
  user: {
    id: number
    email: string
    fullName: string | null
  }
  emailLogs: EmailLog[]
  pagination: {
    currentPage: number
    perPage: number
    total: number
    lastPage: number
  }
  stats: {
    total: number
    sent: number
    delivered: number
    bounced: number
    complained: number
    failed: number
    pending: number
  }
}

defineProps<Props>()

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusColor(status: string): string {
  const colors = {
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    bounced: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    complained: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  }
  return colors[status as keyof typeof colors] || colors.pending
}

function getTypeColor(type: string): string {
  const colors = {
    subscription: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    failure: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    notification: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    welcome: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }
  return colors[type as keyof typeof colors] || colors.other
}
</script>

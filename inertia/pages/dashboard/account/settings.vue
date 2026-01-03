<template>
  <div class="container mx-auto max-w-4xl f fc gap-5">
    <!-- Header -->
    <div class="">
      <h1 class="text-3xl font-bold text-base-content">Account Settings</h1>
      <p class="text-base-content/70">
        Manage your account information and email preferences
      </p>
    </div>

    <!-- Email Status Card -->
    <div class="card  mb-6 card-border">
      <div class="card-body  fr ic jb">
        <div class="flex items-center justify-between">
          <h2 class="card-title text-base-content">Email Status</h2>
        </div>
        <div class="flex space-x-2">
          <Link href="/dashboard/account/email-history" class="btn btn-sm">History </Link>
          <Link href="/dashboard/account/email-status" class="btn btn-sm"> View Details → </Link>
        </div>
          </div>
        
        <div class="card-body">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Status Badge -->
        <div class="flex items-center">
          <div class="mr-3">
            <div
              :class="[
                'w-3 h-3 rounded-full',
                emailStats.status === 'active'
                  ? 'bg-success'
                  : emailStats.status === 'bounced'
                    ? 'bg-warning'
                    : 'bg-error',
              ]"
            ></div>
          </div>
          <div>
            <p class="text-sm text-base-content/70">Status</p>
            <p class="font-medium text-base-content capitalize">
              {{ emailStats.status }}
            </p>
          </div>
      </div>

        <!-- Bounce Count -->
        <div>
          <p class="text-sm text-base-content/70">Total Bounces</p>
          <p class="font-medium text-base-content">
            {{ emailStats.bounceCount }}
          </p>
        </div>

        <!-- Can Receive Emails -->
        <div>
          <p class="text-sm text-base-content/70">Email Delivery</p>
          <p
            :class="[
              'font-medium',
              emailStats.canReceiveEmails
                ? 'text-success'
                : 'text-error',
            ]"
          >
            {{ emailStats.canReceiveEmails ? 'Enabled' : 'Disabled' }}
          </p>
        </div>
      </div>

        <!-- Warning if emails disabled -->
        <div v-if="!emailStats.canReceiveEmails" class="alert alert-warning mt-4">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <div>
            <h3 class="font-medium">Email delivery is currently disabled</h3>
            <p class="text-sm mt-1">
              You may not receive subscription notifications and other important emails.
              <Link href="/dashboard/account/email-status" class="link link-hover">
                View details and request reactivation
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Subscription & Usage Information -->
    <div v-if="privileges" class="card bg-base-100  mb-6">
      <div class="card-body">
        <div class="flex items-center justify-between mb-4">
          <h2 class="card-title text-base-content">Plan & Usage</h2>
        <Link href="/dashboard/account/upgrade" class="btn btn-sm btn-primary"> Manage Plan </Link>
      </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary">
              {{ privileges.tier }}
            </div>
            <div class="text-sm text-base-content/70">Current Plan</div>
          
            <!-- Subscription Status Badges -->
            <div v-if="usage?.subscriptionStatus" class="flex flex-wrap justify-center gap-2 mt-2">
              <div v-if="usage.subscriptionStatus.isTrialing" class="badge badge-info badge-sm">
                Trial
              </div>
              <div v-if="usage.subscriptionStatus.isCancelled" class="badge badge-warning badge-sm">
                Cancelled
              </div>
              <div v-if="usage.subscriptionStatus.isActive" class="badge badge-success badge-sm">
                Active
              </div>
            </div>
          
            <!-- End dates -->
            <div v-if="usage?.subscriptionStatus && (usage.subscriptionStatus.trialEndsAt || usage.subscriptionStatus.endsAt)" class="text-xs text-base-content/70 mt-1">
            <div v-if="usage.subscriptionStatus.isTrialing && usage.subscriptionStatus.trialEndsAt">
              Trial ends {{ formatDate(usage.subscriptionStatus.trialEndsAt) }}
            </div>
            <div v-else-if="usage.subscriptionStatus.isCancelled && usage.subscriptionStatus.endsAt">
              Ends {{ formatDate(usage.subscriptionStatus.endsAt) }}
            </div>
          </div>
        </div>

          <div class="text-center">
            <div class="text-2xl font-bold text-base-content">
              {{ usage?.subscriptions.current || 0 }} /
              {{ usage?.subscriptions.limit === -1 ? '∞' : usage?.subscriptions.limit }}
            </div>
            <div class="text-sm text-base-content/70">Subscriptions</div>
          </div>

          <div class="text-center">
            <div class="text-2xl font-bold text-base-content">
              {{ usage?.emailsToday.current || 0 }} /
              {{ usage?.emailsToday.limit === -1 ? '∞' : usage?.emailsToday.limit }}
            </div>
            <div class="text-sm text-base-content/70">Emails Today</div>
          </div>
      </div>

        <!-- Feature List -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="flex items-center">
            <svg
              class="w-4 h-4 mr-2"
              :class="privileges.canViewEmailHistory ? 'text-success' : 'text-base-content/40'"
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
                privileges.canViewEmailHistory ? 'text-base-content' : 'text-base-content/40'
              "
            >
              Email History
            </span>
        </div>

          <div class="flex items-center">
            <svg
              class="w-4 h-4 mr-2"
              :class="privileges.canExportData ? 'text-success' : 'text-base-content/40'"
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
              :class="privileges.canExportData ? 'text-base-content' : 'text-base-content/40'"
            >
              Data Export
            </span>
        </div>

          <div class="flex items-center">
            <svg
              class="w-4 h-4 mr-2"
              :class="privileges.prioritySupport ? 'text-success' : 'text-base-content/40'"
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
                privileges.prioritySupport ? 'text-base-content' : 'text-base-content/40'
              "
            >
              Priority Support
            </span>
        </div>

          <div class="flex items-center">
            <svg
              class="w-4 h-4 mr-2"
              :class="privileges.customEndpoints ? 'text-success' : 'text-base-content/40'"
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
                privileges.customEndpoints ? 'text-base-content' : 'text-base-content/40'
              "
            >
              Custom Endpoints
            </span>
          </div>
      </div>
    </div>

    </div>

    <!-- Account Information Card -->
    <div class="card bg-base-100 ">
      <div class="card-body">
        <h2 class="card-title text-base-content mb-4">Account Information</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-base-content/70 mb-1">
              Full Name
            </label>
            <p class="text-base-content">{{ user.fullName || 'Not provided' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-base-content/70 mb-1">
              Email Address
            </label>
            <p class="text-base-content">{{ user.email }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-base-content/70 mb-1">
              Member Since
            </label>
            <p class="text-base-content">{{ formatDate(user.createdAt) }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-base-content/70 mb-1">
              Last Updated
            </label>
            <p class="text-base-content">{{ formatDate(user.updatedAt) }}</p>
          </div>
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
    subscriptionStatus?: {
      isActive: boolean
      isCancelled: boolean
      isTrialing: boolean
      endsAt: string | null
      cancelledAt: string | null
      trialEndsAt: string | null
      status: string
    } | null
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

<template>
  <div class="f fc gap-5 py-5">
    <div class="card w-full border border-base-300">
      <div class="card-body px-3 py-2">
        <div class="breadcrumbs w-full text-sm p-0">
          <ul>
            <li>Subscriptions</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card card-border card-sm max-w-4xl">
      <div class="card-body fr jb ic gap-3">
        <h1 class="font-semibold text-lg">Subscriptions</h1>

        <div class="btn btn-sm btn-primary" @click="createModal?.showModal()">
          <i class="pi pi-plus"></i>
          Create Subscription
        </div>
      </div>
      <div class="">
        <div>
          <!-- TODO: Usage Display -->

          <ul class="divide-y divide-base-300">
            <li v-for="subscription in subscriptions" :key="subscription.nid" class="p-3">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3">
                    <div class="min-w-0 flex-1">
                      <Link
                        :href="`/dashboard/subscriptions/${subscription.nid}`"
                        class="text-sm font-medium link link-secondary"
                      >
                        {{ subscription.name }}
                      </Link>
                      <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {{ subscription.endpoint }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
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
                  <input
                    :checked="subscription.enabled"
                    type="checkbox"
                    class="toggle toggle-success"
                    @change="toggleSubEnabled(subscription.nid)"
                  />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!-- Create Subscription Form Modal -->
    <dialog ref="createModal" class="modal">
      <form class="modal-box card card-border shadow-none p-0" @submit.prevent="createSubscription">
        <div class="card-body gap-0">
          <h3 class="text-lg font-semibold">New Subscription</h3>
          <p class="text-sm opacity-70">Additional details can be configured after creation.</p>
        </div>

        <div class="card-body gap-5">
          <div class="f fc gap-2">
            <label for="name" class="label">
              <span class="label-text">Subscription Name</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="input input-bordered w-full"
              placeholder="Enter subscription name"
            />
          </div>

          <div class="f fc gap-2">
            <label for="endpoint" class="label">
              <span class="label-text">Webhook Endpoint</span>
            </label>
            <input
              id="endpoint"
              v-model="form.endpoint"
              type="url"
              required
              class="input input-bordered w-full"
              placeholder="https://example.com/webhook"
            />
          </div>

          <!-- <div class="f fc gap-2">
                  <label for="cron" class="label">
                    <span class="label-text">Cron Expression</span>
                  </label>
                  <input
                    id="cron"
                    v-model="form.cron"
                    type="text"
                    required
                    class="input input-bordered w-full"
                    placeholder="0 9 * * 1 (Every Monday at 9 AM)"
                  />
                  <div class="label">
                    <span class="label-text-alt"
                      >Use cron format: minute hour day month weekday</span
                    >
                  </div>
                </div> -->
        </div>
        <div class="card-body fr jb ic gap-3 border-t border-base-300">
          <button type="button" class="btn" @click="createModal?.close()">Cancel</button>
          <button type="submit" :disabled="isSubmitting" class="btn btn-primary">
            <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
            <span v-if="isSubmitting">Creating...</span>
            <span v-else>Save</span>
          </button>
        </div>
      </form>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'
import { computed, ref } from 'vue'
import { useAppToast } from '~/composables/toast'
import { useDateFormat } from '~/composables/use_date_format'
import dashboard from '~/layouts/dashboard.vue'
import { useHttp } from '~/plugins/network_client'

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

const createModal = ref<HTMLDialogElement>()
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
      createModal.value?.close()
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

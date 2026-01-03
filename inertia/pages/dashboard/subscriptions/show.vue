<template>
  <div class="f fc gap-5 py-5">
    <div class="card w-full border border-base-300">
      <div class="card-body px-3 py-2">
        <div class="breadcrumbs w-full text-sm p-0">
          <ul>
            <li>
              <Link href="/dashboard/subscriptions" class="link link-secondary">Subscriptions</Link>
            </li>
            <li>{{ subscription.name }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card w-full border border-base-300 max-w-4xl">
      <div class="card-body px-3 py-2">
        <!-- <h2 class="text-lg font-semibold">{{ subscription.name }}</h2>
        <p class="text-sm opacity-70">
          Next email at: {{ localDateTime(subscription.nextRunAt) }}
        </p>

        <div class="f fr js ic gap-2">
          <input
            name="enabled"
            type="checkbox"
            v-model="subscription.enabled"
            class="toggle"
            :class="{
              'toggle-success': subscription.enabled,
            }"
          />
          <label
            for="enabled"
            :class="{
              'opacity-70': !subscription.enabled,
            }"
          >
            {{ subscription.enabled ? 'Enabled' : 'Disabled' }}</label
          >
        </div> -->

        <div class="card-body gap-4">
          <div class="form-control">
            <label for="name" class="label"> Name </label>
            <input
              id="name"
              type="text"
              class="input input-bordered input-sm"
              v-model="subscription.name"
              placeholder="Name"
            />
          </div>

          <!-- Endpoint -->
          <div class="form-control">
            <label for="endpoint" class="label">Endpoint</label>
            <input
              id="endpoint"
              type="text"
              class="input input-bordered input-sm"
              v-model="subscription.endpoint"
              placeholder="Endpoint"
            />
          </div>
          <div
            class="btn btn-sm btn-ghost"
            @click="triggerGetTestResponse"
            :class="{
              'btn-disabled': loadingTestResponse,
            }"
          >
            <span class="loading loading-spinner loading-xs" v-if="loadingTestResponse"></span>
            Test Endpoint
          </div>
        </div>
        <div class="card-body">
          <div class="ff fc">
            <h3 class="text-base font-semibold">Delivery</h3>
            <p class="text-lite !leading-snug">
              Configure when or how often you'd like this subscription to be triggered. You can
              provide your own cron expression, or use the form below to generate one.
            </p>
          </div>
          <div class="">
            <div class="">
              <div class="">
                <Cron
                  :cronExpression="subscription.cronExpression"
                  @update="subscription.cronExpression = $event"
                />
              </div>
            </div>
            <div class="form-control">
              <!-- cron expression -->
              <input
                id="cron"
                type="text"
                class="input input-bordered input-sm font-mono"
                v-model="subscription.cronExpression"
                placeholder="Cron"
              />
            </div>
          </div>
          <div class="card-body gap-3 f fr jb is">
            <div class="f fc gap-0">
              <h3 class="text-base font-semibold">Next Deliveries</h3>
              <p class="text-lite !leading-snug">
                The next scheduled deliveries for this subscription.
              </p>
            </div>
            <div
              class="btn btn-ghost btn-sm"
              @click="triggerGetCronDeliveries"
              :class="{
                'btn-disabled': loadingDeliveries,
              }"
            >
              <span class="loading loading-spinner loading-xs" v-if="loadingDeliveries"></span>
              Next Deliveries
            </div>
          </div>
          <div class="card-body">
            <ul v-if="nextDeliveries.length" class="text-sm text-lite italic">
              <li v-for="delivery in nextDeliveries" :key="delivery">
                {{ delivery }}
              </li>
            </ul>
          </div>
        </div>
        <div class="card-body">
          <label
            for="enabled"
            class="card card-sm text-base cursor-pointer"
            :class="{
              'bg-gradient-to-tr from-success/10 to-success/20 border border-success':
                subscription.enabled,
              'border border-base-300': !subscription.enabled,
            }"
          >
            <div class="card-body f fr js ic gap-2 w-full">
              <span
                class="label py-0 pr-0 text-sm"
                :class="{
                  'text-success': subscription.enabled,
                  'opacity-70': !subscription.enabled,
                }"
                >Enabled</span
              >
              <input
                id="enabled"
                type="checkbox"
                class="toggle toggle-success toggle-sm"
                v-model="subscription.enabled"
              />
            </div>
          </label>

          <pre>
            <code>
              {{ JSON.stringify(subscription, null, 2) }}
            </code>
          </pre>
        </div>
        <div class="card-body">
          <div></div>
          <div class="btn btn-primary btn-sm" @click="saveSubscription">Save</div>
        </div>
      </div>
    </div>

    <!-- Test Endpoint Modal (sidebar) -->

    <!-- Open the modal using ID.showModal() method -->
    <dialog id="test-endpoint-modal" class="modal">
      <div class="modal-box">
        <p>
          <span class="loading loading-spinner loading-xs"></span>
          Testing endpoint: <strong>{{ subscription.endpoint }}...</strong>
        </p>

        <pre class="font-mono text-sm">
          <code>{{ JSON.stringify(testResponseData, null, 2) }}</code>
        </pre>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import dashboard from '~/layouts/dashboard.vue'
import Cron from '~/components/Cron.vue'
import { Link, router } from '@inertiajs/vue3'
import { useHttp } from '~/plugins/network_client'
import { debounce, throttle } from 'underscore'
import { useAppToast } from '~/composables/toast'
const toast = useAppToast()

const http = useHttp()

defineOptions({
  layout: dashboard,
})

const props = defineProps<{
  subscription: {
    nid: string
    name: string
    nextRunAt: string
    enabled: boolean
    cronExpression: string
    endpoint: string
    timezone: string
  }
}>()

async function saveSubscription() {
  try {
    await http.put(`/subscriptions/${props.subscription.nid}`, {
      name: props.subscription.name,
      cron: props.subscription.cronExpression,
      enabled: props.subscription.enabled,
      endpoint: props.subscription.endpoint,
      cronExpression: props.subscription.cronExpression,
    })
    console.log('Subscription updated successfully')
    toast.success('Subscription updated.')
    router.reload()
  } catch (error) {
    console.log(error)
    const message = error.response?.data?.error || 'Failed to update subscription'
    toast.error(message)
  }
}

const nextDeliveries = ref([])
const loadingDeliveries = ref(false)
async function getCronDeliveries() {
  try {
    loadingDeliveries.value = true
    let response = await http.post(`/cron/deliveries`, {
      cron: props.subscription.cronExpression,
      timezone: props.subscription.timezone,
    })
    nextDeliveries.value = response.data
  } catch (error) {
    console.log(error)
  }
  loadingDeliveries.value = false
}

const getDeliveriesDebounce = debounce(getCronDeliveries, 1000)

function triggerGetCronDeliveries() {
  loadingDeliveries.value = true
  getDeliveriesDebounce()
}

function toggleModal(id: string) {
  const dialog = document.getElementById(id) as HTMLDialogElement
  if (dialog.open) {
    dialog.close()
  } else {
    dialog.showModal()
  }
}

function toggleTestEndpointModal() {
  toggleModal('test-endpoint-modal')
}

const testResponseData = ref({
  status: '',
  data: '',
})
const loadingTestResponse = ref(false)
async function testResponse() {
  loadingTestResponse.value = true
  toggleTestEndpointModal()
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const saveEndpoint = encodeURIComponent(props.subscription.endpoint)
    let response = await http.get(
      `/subscriptions/${props.subscription.nid}/test?endpoint=${saveEndpoint}`
    )
    testResponseData.value.status = response.data.status
    testResponseData.value.data = response.data.response
    toast.success('Endpoint tested successfully.')
  } catch (error) {
    console.log(error)
    const message = error.response?.data?.error || 'Failed to test endpoint.'
    toast.error(message)
  }
  loadingTestResponse.value = false
}

const getTestResponseDebounce = throttle(testResponse, 1000)

function triggerGetTestResponse() {
  loadingTestResponse.value = true
  getTestResponseDebounce()
}
</script>

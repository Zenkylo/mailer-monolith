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

    <div class="card w-full border border-base-300 max-w-4xl card-sm">
      <div class="card-body fr jb ic gap-3 border-b border-base-300">
        <div class="f fc">
          <h1 class="font-semibold text-lg">{{ subscription.name }}</h1>
          <p class="text-sm opacity-70">
            {{ subscription.endpoint }}
          </p>
        </div>
        <div></div>
      </div>
      <div class="card-body">
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

        <div class="card card-border bg-base-100!">
          <div class="card-body gap-3">
            <div class="f fc gap-1">
              <label for="name" class="label"> Name </label>
              <input
                id="name"
                v-model="subscription.name"
                type="text"
                class="input input-bordered input-sm w-full"
                placeholder="Name"
              />
            </div>

            <!-- Endpoint -->
            <div class="f fc gap-1">
              <label for="endpoint" class="label">Endpoint</label>
              <div class="f fr js ic gap-2">
                <input
                  id="endpoint"
                  v-model="subscription.endpoint"
                  type="text"
                  class="input input-bordered input-sm w-full"
                  placeholder="Endpoint"
                />
                <div
                  class="btn btn-sm"
                  :class="{
                    'btn-disabled': loadingTestResponse,
                  }"
                  @click="triggerGetTestResponse"
                >
                  <span
                    v-if="loadingTestResponse"
                    class="loading loading-spinner loading-xs"
                  ></span>
                  Test
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card-body">
          <div class="card card-border bg-base-100!">
            <div class="card-body border-b-0!">
              <div class="ff fc">
                <h3 class="text-base font-semibold">Delivery</h3>
                <p class="text-lite leading-4">
                  Configure when or how often you'd like this subscription to be triggered. You can
                  provide your own cron expression, or use the form below to generate one.
                </p>
              </div>

              <CronTabs
                :cron-expression="subscription.cronExpression"
                @update="subscription.cronExpression = $event"
              >
                <template #cron-builder>
                  <Cron
                    :cron-expression="subscription.cronExpression"
                    @update="subscription.cronExpression = $event"
                  />
                </template>
              </CronTabs>
              <div class="gap-3 f fr jb is">
                <div class="f fc gap-0">
                  <h3 class="text-base font-semibold">Next Deliveries</h3>
                  <p class="text-lite leading-snugX">
                    The next scheduled deliveries for this subscription.
                  </p>
                </div>
                <div
                  class="btn btn-sm"
                  :class="{
                    'btn-disabled': loadingDeliveries,
                  }"
                  @click="triggerGetCronDeliveries"
                >
                  <span v-if="loadingDeliveries" class="loading loading-spinner loading-xs"></span>
                  Next Deliveries
                </div>
              </div>
              <div class="pt-0">
                <ul v-if="nextDeliveries.length" class="text-sm text-lite italic">
                  <li v-for="delivery in nextDeliveries" :key="delivery">
                    {{ delivery }}
                  </li>
                </ul>
              </div>
            </div>
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
                v-model="subscription.enabled"
                type="checkbox"
                class="toggle toggle-success toggle-sm"
              />
            </div>
          </label>

          <!-- <pre>
            <code>
              {{ JSON.stringify(subscription, null, 2) }}
            </code>
          </pre> -->
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
import { reactive, ref } from 'vue'

import { Link, router } from '@inertiajs/vue3'
import { debounce, throttle } from 'underscore'
import Cron from '~/components/Cron.vue'
import CronTabs from '~/components/CronTabs.vue'
import { useAppToast } from '~/composables/toast'
import dashboard from '~/layouts/dashboard.vue'
import { useHttp } from '~/plugins/network_client'
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

const subscription = reactive({ ...props.subscription })

async function saveSubscription() {
  try {
    await http.put(`/subscriptions/${subscription.nid}`, {
      name: subscription.name,
      cron: subscription.cronExpression,
      enabled: subscription.enabled,
      endpoint: subscription.endpoint,
      cronExpression: subscription.cronExpression,
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
      cron: subscription.cronExpression,
      timezone: subscription.timezone,
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
    const saveEndpoint = encodeURIComponent(subscription.endpoint)
    let response = await http.get(
      `/subscriptions/${subscription.nid}/test?endpoint=${saveEndpoint}`
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

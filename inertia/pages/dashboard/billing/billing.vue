<template>
  <div class="max-w-2xl p-4 f fc gap-5">
    <div class="alert alert-success alert-soft w-full" v-if="success">
      <i class="pi pi-check-circle"></i>
      <div class="">
        <p class="text-base font-semibold">Thank you for subscribing.</p>
        <p class="text-sm leading-tight">
          You can manage your subscription in the Polar billing portal using the links below.
        </p>
        <p class="text-sm leading-tight">
          If you have any questions, issues, or suggestions, please reach out for assistance.
        </p>
      </div>
    </div>

    <div class="f fr js is gap-5">
      <div
        v-for="product in productSortedByPrice"
        :key="product.id"
        class="card border border-base-300 card-sm w-1/2"
      >
        <div class="card-body gap-0">
          <h2 class="text-lg font-semibold">{{ product.name }}</h2>
          <p class="text-sm opacity-70">
            {{ product.description }}
          </p>
        </div>
        <!-- <p v-if="props.subscription.includes(product.id)">
          You are subscribed to this product
        </p> -->
        <div class="card-body">
          <h3 class="f fr jc ie gap-1">
            <span class="text-lg font-bold"> ${{ getPrice(product.prices) }} </span>
            <span class="text-xs opacity-70">/</span>
            <span class="text-xs opacity-70">month</span>
          </h3>
        </div>

        <!-- 
        
          TODO: page needs to accommodate active vs active with end date/cancelled
        
        -->

        <div class="card-body">
          <ul class="f fc gap-1 text-sm opacity-70">
            <li class="f fr js ic gap-2">
              <i class="pi pi-check"></i>
              Feature 1 of {{ product.name }}
            </li>
            <li class="f fr js ic gap-2">
              <i class="pi pi-check"></i>
              Feature 2 of {{ product.name }}
            </li>
            <li class="f fr js ic gap-2">
              <i class="pi pi-check"></i>
              Feature 3 of {{ product.name }}
            </li>
          </ul>
        </div>

        <div class="card-body">
          <a
            v-if="isAlreadySubscribed && subscription?.polarProductId === product.id"
            href="/dashboard/billing/portal"
            class="btn btn-sm gap-1 btn-soft"
          >
            {{
              isUpgrade(product.id) ? 'Upgrade' : isDowngrade(product.id) ? 'Downgrade' : 'Manage'
            }}
          </a>

          <button
            onclick="my_modal_2.showModal()"
            v-else-if="isAlreadySubscribed && subscription?.polarProductId !== product.id"
            class="btn btn-sm gap-1 btn-soft"
            :class="{
              'btn-success': isUpgrade(product.id),
              '': isDowngrade(product.id),
            }"
          >
            {{
              isUpgrade(product.id) ? 'Upgrade' : isDowngrade(product.id) ? 'Downgrade' : 'Manage'
            }}
          </button>

          <a
            v-else
            :href="`/dashboard/billing/checkout/product/${product.id}`"
            class="btn btn-sm btn-soft"
          >
            Continue
          </a>
        </div>

        <div
          class="card-body border-t border-base-300"
          v-if="currentSubscription?.polarProductId === product.id"
        >
          <div class="f fr js ic gap-1 flex-wrap">
            <div class="badge badge-sm badge-success badge-soft">Active</div>
            <div class="badge badge-sm badge-info badge-soft" v-if="isTrialing">Trialing</div>
            <!-- trialEndsAd -->
            <div
              class="badge badge-sm badge-info badge-soft"
              v-if="isTrialing && currentSubscription.polarTrialEnd"
            >
              Trial ends
              {{
                new Date(currentSubscription.polarTrialEnd).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              }}
            </div>
            <!-- polarCanceledAt -->
            <div
              class="badge badge-sm badge-warning badge-soft"
              v-if="currentSubscription.polarCanceledAt"
            >
              Canceled
              {{
                new Date(currentSubscription.polarCanceledAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              }}
            </div>
            <!-- endsAt -->
            <div
              class="badge badge-sm badge-warning badge-soft"
              v-if="currentSubscription.polarCancelAtPeriodEnd"
            >
              Ends
              {{
                new Date(currentSubscription.polarEndsAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Open the modal using ID.showModal() method -->
    <dialog id="my_modal_2" class="modal" v-if="isAlreadySubscribed">
      <div class="modal-box w-96">
        <p class="pb-4 text-sm text-center">
          Use the
          <span class="font-semibold"> "Change Plan" </span>
          button in the billing portal to change your subscription.
        </p>
        <a href="/dashboard/billing/portal" class="btn btn-sm gap-1 btn-soft f self-center">
          Continue to Billing Portal
          <i class="pi pi-arrow-right"></i>
        </a>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
  <pre class="p-4">
    <code>
      {{ JSON.stringify(currentSubscription, null, 2) }}
    </code>
  </pre>
</template>
<script lang="ts" setup>
import { InferPageProps } from '@adonisjs/inertia/types'
import type PolarController from '../../../../app/controllers/polar_controller.ts'
import { computed } from 'vue'
import dashboard from '~/layouts/dashboard.vue'

defineOptions({
  layout: dashboard,
})

const props = defineProps<{
  products: InferPageProps<PolarController, 'renderBillingPage'>['products']
  subscription: InferPageProps<PolarController, 'renderBillingPage'>['subscription']
  success: InferPageProps<PolarController, 'renderBillingPage'>['success']
}>()

const productSortedByPrice = [...props.products].sort((a, b) => {
  const priceA = getPrice(a.prices)
  const priceB = getPrice(b.prices)
  return parseFloat(priceA) - parseFloat(priceB)
})

function isUpgrade(polarProductId: string) {
  if (!props.subscription) return false
  const currentProductId = props.subscription.polarProductId
  const currentProductIndex = productSortedByPrice.findIndex((p) => p.id === currentProductId)
  const newProductIndex = productSortedByPrice.findIndex((p) => p.id === polarProductId)
  return newProductIndex > currentProductIndex
}

function isDowngrade(polarProductId: string) {
  if (!props.subscription) return false
  const currentProductId = props.subscription.polarProductId
  const currentProductIndex = productSortedByPrice.findIndex((p) => p.id === currentProductId)
  const newProductIndex = productSortedByPrice.findIndex((p) => p.id === polarProductId)
  return newProductIndex < currentProductIndex
}

const currentSubscription = computed(() => props.subscription || null)
const isAlreadySubscribed = computed(() => !!currentSubscription.value)
const isTrialing = computed(() => currentSubscription.value?.polarStatus === 'trialing')

function getPrice(productPrices: any[]) {
  const monthlyPrice = productPrices.find((price) => price.recurringInterval === 'month')
  return monthlyPrice ? (monthlyPrice.priceAmount / 100).toFixed(2) : 'N/A'
}
</script>

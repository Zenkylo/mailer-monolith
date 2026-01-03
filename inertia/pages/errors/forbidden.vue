<template>
  <div class="w-full h-screen f fr jc ic bg-base-100">
    <div class="card card-border card-sm max-w-sm w-full outline-2 outline-base-200">
      <div class="card-body gap-0">
        <h1 class="text-lg font-semibold">Access Forbidden</h1>
        {{ error }}
        <p class="text-sm opacity-70">
          {{ message || 'You do not have permission to access this resource.' }}
        </p>
      </div>
      <div class="card-body border-y border-base-300 pb-3 pt-1">
        <div class="text-error font-semibold text-4xl text-center">403</div>
      </div>
      <div class="card-body f fr jc ic gap-2">
        <a v-if="user && showUpgrade" href="/dashboard/account/upgrade" class="btn btn-primary">
          Upgrade Plan
        </a>
        <a v-if="user" href="/dashboard" class="btn">Dashboard</a>
        <a v-else href="/" class="btn">Home</a>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import layout from '~/layouts/public.vue'

defineOptions({ layout })

defineProps<{
  user?: {
    email: string
  }
  message?: string
  showUpgrade?: boolean
  error: any
}>()
</script>

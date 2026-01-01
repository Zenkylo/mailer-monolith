<template>
  <div class="w-full h-screen f fr jc ic bg-base-100">
    <div class="card card-border card-sm max-w-sm w-full outline-2 outline-base-200">
      <div class="card-body gap-0">
        <h1 class="text-lg font-semibold">Not Found</h1>
        <p class="text-sm opacity-70">The page you are looking for could not be found.</p>
      </div>
      <div class="card-body border-y border-base-300 pb-3 pt-1">
        <div class="text-warning font-semibold text-4xl text-center">404</div>
      </div>
      <div class="card-body f fr jc ic gap-2">
        <a href="/dashboard" class="btn" v-if="user">Dashboard</a>
        <a href="/" class="btn" v-else>Home</a>
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
}>()
</script>

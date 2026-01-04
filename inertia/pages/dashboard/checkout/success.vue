<template>
  <div class="h-screen flex flex-col items-center justify-center bg-base-100">
    <h1 class="text-2xl font-bold">Checkout Successful</h1>
    <p class="mt-4">Thank you for your purchase!</p>
    <Link class="btn btn-primary mt-4" href="/dashboard"> Go to Dashboard </Link>
  </div>
</template>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
})
</script>

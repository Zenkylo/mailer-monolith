<template>
  <Head title="Reset Password" />

  <div class="h-screen f fr jc ic bg-base-100">
    <div class="card card-border card-sm max-w-sm w-full outline-2 outline-base-200">
      <div class="card-body border-b border-base-300">
        <p class="text-sm font-semibold text-center">
          This password reset link is no longer valid.
        </p>
      </div>
      <div class="card-body">
        <Link class="btn self-center" href="/auth/login">Login Page</Link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import layout from '~/layouts/public.vue'

defineOptions({ layout })
</script>

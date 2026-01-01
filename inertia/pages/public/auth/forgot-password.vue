<template>
  <Head title="Forgot Password" />

  <div class="h-screen flex flex-col items-center justify-center bg-base-100">
    <Link class="absolute top-3 left-3 btn-circle btn" href="/auth/login">
      <i class="pi pi-times"></i>
    </Link>
    <form
      @submit.prevent="submit"
      class="card card-border card-sm max-w-sm w-full outline-2 outline-base-200"
    >
      <div class="card-body">
        <h1 class="font-semibold text-md">Forgot Password</h1>
      </div>
      <div class="card-body gap-2 border-y border-base-300">
        <label for="email" class="label pt-0">Email</label>
        <input
          type="email"
          class="input w-full"
          v-model="email"
          name="email"
          autocomplete="email"
          autofocus
          required
        />
      </div>

      <div class="card-body f fr jb ic">
        <a href="/" class="btn">Cancel</a>
        <button
          class="btn btn-primary"
          type="submit"
          :disabled="!(email && email.length > 5 && email.includes('@') && email.includes('.'))"
        >
          <span class="loading loading-spinner" v-if="saving"></span>
          <span v-else> Submit </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import layout from '~/layouts/public.vue'
import { ref } from 'vue'
import { useHttp } from '~/plugins/NetworkClient'
import { useAppToast } from '~/composables/toast'
const http = useHttp()
const toast = useAppToast()

defineOptions({ layout })

const email = ref<string>('')

const saving = ref(false)

async function submit() {
  try {
    saving.value = true
    const res = await http.post('/auth/forgot-password', { email: email.value?.trim() })
    toast.success(res.data?.message || 'Password reset email sent')
  } catch (error) {
    toast.error('Failed to send password reset email')
  } finally {
    saving.value = false
  }
}
</script>

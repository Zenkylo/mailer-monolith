<template>
  <Head pubtitle="Register" />

  <div class="f fr h-screen jc ic bg-base-100">
    <form class="card card-border w-full card-sm max-w-sm" @submit.prevent="submit">
      <input type="hidden" name="_csrf" :value="csrfToken" />
      <div class="card-body">
        <h2 class="text-lg font-semibold">Register</h2>
      </div>
      <div class="card-body border-y border-base-300">
        <div class="f fc gap-2">
          <label for="email" class="label pt-0">Email</label>
          <input
            v-model="email"
            type="email"
            class="input w-full"
            required
            autofocus
            autocomplete="email"
          />
        </div>
        <p class="text-xs leading-tight px-2 mt-2">
          <span class="opacity-70">
            We'll send a link to this email on submission. Email verification is required given
            we'll be sending emails to you.
          </span>
          😊
        </p>
      </div>
      <div class="card-body f fr jb ic gap-2">
        <a class="btn" href="/">Cancel</a>
        <button class="btn btn-primary" type="submit">
          <span v-if="loading" class="loading loading-spinner"></span>
          <span v-else> Submit </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { ref } from 'vue'
import layout from '~/layouts/public.vue'
import { useHttp } from '~/plugins/network_client'
import { useAppToast } from '~/composables/toast'
const http = useHttp()
const toast = useAppToast()

defineProps<{ csrfToken: string }>()
defineOptions({ layout })

const email = ref('')
const loading = ref(false)

async function submit() {
  try {
    const response = await http.post('/auth/register', {
      email: email.value,
    })
    toast.success(response.data?.message || 'Registration successful')
  } catch (error) {
    toast.error(error.response?.data?.message || 'Registration failed.')
  }
}
</script>

<template>
  <div class="h-screen flex flex-col items-center justify-center bg-base-100">
    <!-- <LocaleChanger /> -->
    <ThemeChanger />

    <form
      class="card card-border card-sm max-w-sm w-full outline-2 outline-base-200"
      @submit.prevent="submit"
    >
      <!-- <div class="card-body fr jb ic gap-2">
        <h1 class="text-lg font-semibold">Hello, do the login...</h1>
        <i class="pi pi-envelope text-lg"></i>
      </div> -->
      <div class="card-body border-y border-base-300 gap-5">
        <div class="f fc gap-2">
          <label for="email" class="label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="input w-full"
            required
            autofocus
            autocomplete="email"
          />
        </div>
        <div class="f fc gap-2">
          <label for="password" class="label">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="input w-full"
            required
            autocomplete="current-password"
          />
        </div>
      </div>
      <div class="card-body f fr jb ic gap-2">
        <div class="f fr js ic gap-0">
          <a href="/" class="btn btn-ghost btn-sm">Cancel</a>
          <Link class="btn btn-ghost btn-sm" href="/auth/forgot-password"> Forgot Password? </Link>
          <Link class="btn btn-ghost btn-sm" href="/auth/register"> Register </Link>
        </div>
        <button type="submit" class="btn btn-sm btn-primary">Login</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import layout from '~/layouts/public.vue'
import { useHttp } from '~/plugins/network_client'

import { useAppToast } from '~/composables/toast'
const toast = useAppToast()

const value = ref(null)
const items = ref([])

const search = (event) => {
  items.value = [...Array(10).keys()].map((item) => event.query + '-' + item)
}

import { Link, router } from '@inertiajs/vue3'
import { useLocalStorage } from '~/composables/use_local_storage'
const http = useHttp()
const { setItem, getItem } = useLocalStorage()

defineOptions({ layout })

const props = defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
  flashMessages: {
    type: Object,
    default: () => ({}),
  },
})

const form = reactive({
  email: 'user@user.com',
  password: 'asdasd',
})

async function submit() {
  try {
    const response = await http.post('/auth/login', form)
    router.visit('/dashboard', {
      method: 'get',
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: error.response?.data?.error || 'Login failed',
      life: 3000,
    })
  }
}
</script>

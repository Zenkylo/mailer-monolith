<template>
  <Head title="Reset Password" />

  <div class="h-screen f fr jc ic bg-base-100">
    <Link class="absolute top-3 left-3 btn-circle btn" href="/auth/login">
      <i class="pi pi-times"></i>
    </Link>
    <form
      class="card card-border card-sm max-w-sm w-full outline-2 outline-base-200"
      @submit.prevent="submit"
    >
      <div class="card-body">
        <h1 class="font-semibold text-md">New Password</h1>
      </div>
      <div class="card-body gap-4 border-y border-base-300">
        <div class="f fc gap-2">
          <label for="email" class="label pt-0">Email</label>
          <input
            type="email"
            class="input w-full !bg-base-300"
            readonly
            :value="form.email"
            name="email"
          />
        </div>

        <div class="f fc gap-2">
          <label for="password" class="label pt-0">Password</label>
          <input
            v-model="form.password"
            :type="showPasswords ? 'text' : 'password'"
            class="input w-full"
            autofocus
            autocomplete="new-password"
            required
          />
        </div>

        <div class="f fc gap-2">
          <label for="passwordConfirm" class="label pt-0">Confirm Password</label>
          <input
            v-model="form.passwordConfirm"
            :type="showPasswords ? 'text' : 'password'"
            class="input w-full"
            autocomplete="new-password"
            required
          />
        </div>
      </div>

      <div class="card-body f fr jb ic">
        <div class="btn btn-neutral" @click="showPasswords = !showPasswords">
          <i class="pi" :class="showPasswords ? 'pi-eye' : 'pi-eye-slash'"></i>
        </div>
        <button class="btn btn-success" type="submit" :disabled="!passwordsMatch">
          <span v-if="saving" class="loading loading-spinner"></span>
          <span v-else> Submit </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import { reactive, ref, computed } from 'vue'
import layout from '~/layouts/public.vue'
import { useHttp } from '~/plugins/network_client'
import { useAppToast } from '~/composables/toast'
const http = useHttp()
const toast = useAppToast()

const props = defineProps<{ valid: boolean; email: string; token: string }>()
defineOptions({ layout })

const form = reactive({
  email: props.email,
  password: '',
  passwordConfirm: '',
  token: props.token,
})

const showPasswords = ref(false)
const saving = ref(false)

const passwordsMatch = computed(
  () => form.password?.length > 5 && form.password === form.passwordConfirm
)

async function submit() {
  try {
    saving.value = true
    const res = await http.post('/auth/reset-password', { ...form })
    toast.success(res.data?.message || 'Password has been reset. Logging in...')

    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 1500)
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to reset password.')
  } finally {
    saving.value = false
  }
}
</script>

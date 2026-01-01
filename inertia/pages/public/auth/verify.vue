<template>
  <Head title="Register" />

  <div class="h-screen flex flex-col items-center justify-center bg-base-100">
    <form
      @submit.prevent="submit"
      class="card card-border card-sm max-w-sm w-full outline-2 outline-base-200"
    >
      <div class="card-body">
        <h1 class="font-semibold text-md">Create Account</h1>
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
            :type="showPasswords ? 'text' : 'password'"
            class="input w-full"
            v-model="form.password"
            autofocus
            autocomplete="new-password"
            required
          />
        </div>

        <div class="f fc gap-2">
          <label for="passwordConfirm" class="label pt-0">Confirm Password</label>
          <input
            :type="showPasswords ? 'text' : 'password'"
            class="input w-full"
            v-model="form.passwordConfirm"
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
          <span class="loading loading-spinner" v-if="saving"></span>
          <span v-else> Submit </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import layout from '~/layouts/public.vue'
import { reactive, ref, computed } from 'vue'
import { useHttp } from '~/plugins/NetworkClient'
import { useAppToast } from '~/composables/toast'
const http = useHttp()
const toast = useAppToast()

const props = defineProps<{ valid: boolean; email: string; token: string; csrfToken: string }>()
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
  saving.value = true
  try {
    const response = await http.post('/auth/verify', form)
    toast.success(response.data?.message || 'Verification successful!')
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 3000)
  } catch (error) {
    toast.error(error.response?.data?.message || 'Verification failed.')
  } finally {
    saving.value = false
  }
}
</script>

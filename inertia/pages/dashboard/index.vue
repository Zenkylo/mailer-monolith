<template>
  <div class="f fr js ic gap-2">
    <input type="text" class="input input-sm" v-model="message" placeholder="Message" autofocus />
    <div class="btn btn-primary btn-sm" @click="sendEmail">Send Email</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import dashboardLayout from '~/layouts/dashboard.vue'
import { useHttp } from '~/plugins/NetworkClient'
import { useAppToast } from '~/composables/toast'
const toast = useAppToast()
const http = useHttp()

defineOptions({ layout: dashboardLayout })

const message = ref('')

async function sendEmail() {
  try {
    await http.post('/send-email', {
      // email data
      message: message.value,
    })
    toast.success('Email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
    toast.error('Error sending email')
  }
}
</script>

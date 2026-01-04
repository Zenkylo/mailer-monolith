<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAppToast } from '~/composables/toast'

interface FlashMessages {
  [key: string]: string
}

const props = defineProps<{
  messages?: FlashMessages
}>()

const toast = useAppToast()

const processFlashMessages = (messages: FlashMessages | undefined) => {
  if (!messages) return

  Object.entries(messages).forEach(([type, message]) => {
    const severity = mapFlashTypeToToastSeverity(type)

    toast.add({
      severity,
      summary: message,
      life: getToastLifetime(type),
    })
  })
}

const mapFlashTypeToToastSeverity = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'error':
    case 'danger':
      return 'error'
    case 'success':
      return 'success'
    case 'warning':
    case 'warn':
      return 'warn'
    case 'info':
    case 'notice':
      return 'info'
    default:
      return 'info'
  }
}

const getToastLifetime = (type: string): number => {
  switch (type.toLowerCase()) {
    case 'error':
    case 'danger':
      return 5000 // Errors stay longer
    case 'success':
      return 3000 // Success messages are shorter
    case 'warning':
    case 'warn':
      return 4000 // Warnings stay a bit longer
    case 'info':
    case 'notice':
      return 3000 // Info messages are shorter
    default:
      return 3000
  }
}

// Process flash messages when component mounts
onMounted(() => {
  processFlashMessages(props.messages)
})

// Process flash messages when they change (shouldn't happen often in Inertia)
watch(
  () => props.messages,
  (newMessages) => {
    processFlashMessages(newMessages)
  },
  { deep: true }
)
</script>

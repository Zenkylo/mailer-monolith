<template>
  <div v-if="hasMessages" class="mb-4 space-y-2">
    <transition-group name="flash" tag="div" class="space-y-2">
      <div
        v-for="(message, type) in localMessages"
        :key="type"
        :class="getAlertClass(String(type))"
        class="alert alert-soft"
      >
        <i :class="getIconClass(String(type))" class="mr-2 text-lg"></i>
        <span class="flex-1">{{ message }}</span>
        <button
          @click="dismissMessage(String(type))"
          class="btn btn-ghost btn-xs btn-square ml-2 opacity-70 hover:opacity-100"
          type="button"
          :aria-label="`Dismiss ${type} message`"
        >
          <i class="pi pi-times"></i>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface FlashMessages {
  [key: string]: string
}

const props = defineProps<{
  messages?: FlashMessages
}>()

const localMessages = ref<FlashMessages>({})

// Update local messages when props change
watch(
  () => props.messages,
  (newMessages) => {
    if (newMessages) {
      localMessages.value = { ...newMessages }
    } else {
      localMessages.value = {}
    }
  },
  { immediate: true }
)

const hasMessages = computed(() => {
  return localMessages.value && Object.keys(localMessages.value).length > 0
})

const getAlertClass = (type: string): string => {
  const baseClass = 'alert'

  switch (type.toLowerCase()) {
    case 'error':
    case 'danger':
      return `${baseClass} alert-error`
    case 'success':
      return `${baseClass} alert-success`
    case 'warning':
    case 'warn':
      return `${baseClass} alert-warning`
    case 'info':
    case 'notice':
      return `${baseClass} alert-info`
    default:
      return `${baseClass} alert-info`
  }
}

const getIconClass = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'error':
    case 'danger':
      return 'pi pi-times-circle'
    case 'success':
      return 'pi pi-check-circle'
    case 'warning':
    case 'warn':
      return 'pi pi-exclamation-triangle'
    case 'info':
    case 'notice':
      return 'pi pi-info-circle'
    default:
      return 'pi pi-info-circle'
  }
}

const dismissMessage = (type: string) => {
  delete localMessages.value[type]
}
</script>

<style scoped>
.flash-enter-active,
.flash-leave-active {
  transition: all 0.3s ease;
}

.flash-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.flash-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.flash-move {
  transition: transform 0.3s ease;
}
</style>

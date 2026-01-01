<template>
  <main>
    <div>
      <FlashToast :messages="flashMessages" />
      <slot />
    </div>
    <ToastProvider />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useLocalStorage } from '~/composables/useLocalStorage'
import { LOCAL_STORAGE_KEYS } from '~/constants'
import ToastProvider from '~/components/ToastProvider.vue'
import FlashToast from '~/components/FlashToast.vue'

defineProps<{
  flashMessages?: {
    [key: string]: string
  }
}>()

const { getItem } = useLocalStorage()

function getPreferredTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'mydark'
  }
  return 'mylight'
}

const theme = ref(getItem(LOCAL_STORAGE_KEYS.THEME) || getPreferredTheme())

onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
})
</script>

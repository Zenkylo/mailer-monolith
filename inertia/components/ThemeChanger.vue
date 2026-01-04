<template>
  <div
    v-if="theme === 'mydark'"
    class="w-full"
    variant="outlined"
    @click="toggleDarkMode('mylight')"
  >
    <i class="pi pi-sun"></i>
  </div>
  <div v-else class="w-full" variant="outlined" @click="toggleDarkMode('mydark')">
    <i class="pi pi-moon"></i>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLocalStorage } from '~/composables/use_local_storage'
const { getItem, setItem } = useLocalStorage()
import { LOCAL_STORAGE_KEYS, AVAILABLE_THEMES } from '~/constants'

const theme = ref(getItem(LOCAL_STORAGE_KEYS.THEME) || 'mylight')

function toggleDarkMode(themeToggle) {
  theme.value = themeToggle
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.setAttribute('data-theme', themeToggle)
  setItem(LOCAL_STORAGE_KEYS.THEME, themeToggle)
}
</script>

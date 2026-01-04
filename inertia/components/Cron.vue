<template>
  <div v-if="show">
    <cron-light v-model="cronEx" @error="error = $event"></cron-light>
    <!-- <div class="text-lightest pt-2">cron expression: {{ cronEx }}</div> -->
  </div>
</template>

<script setup lang="ts">
// import '@vue-js-cron/light/dist/light.css'
// import { CronLight } from '@vue-js-cron/light'

import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  cronExpression: string
}>()

const emit = defineEmits<{
  update: [value: string]
}>()

const cronEx = ref('0 0 * * *')
watch(cronEx, (val) => {
  emit('update', val)
})

const error = ref('')

const show = ref(false)
onMounted(() => {
  show.value = true
  cronEx.value = props.cronExpression
})
</script>

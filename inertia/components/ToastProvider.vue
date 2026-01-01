<template>
  <Toast class="alert-toast">
    <template #container="{ message }">
      <div
        :class="`alert alert-soft alert-${message.severity}  px-3 py-2 border !border-${message.severity}`"
      >
        {{ message.summary }}
      </div>
    </template>
  </Toast>
</template>

<script setup lang="ts">
import Toast from 'primevue/toast'
</script>

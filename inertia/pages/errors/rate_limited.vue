<template>
  <div>
    <h1>Rate Limit Exceeded</h1>
    <!-- <p>{{ error.message }}</p> -->
  </div>
</template>

<script setup>
import { usePage } from '@inertiajs/vue3'

const { props } = usePage()
const error = props.error
</script>

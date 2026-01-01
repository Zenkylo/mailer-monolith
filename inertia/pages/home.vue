<template>
  <Head title="Homepage" />
  <Login />
</template>

<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import layout from '~/layouts/public.vue'

defineOptions({ layout })
</script>

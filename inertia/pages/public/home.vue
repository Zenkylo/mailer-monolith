<template>
  <Head title="Homepage" />

  <div class="container">
    <div class="title">AdonisJS x Inertia x Vue.js</div>

    <div class="size-5">Meow</div>

    <!--    <Button label="Click me" />-->
    <div class="text-3xl card">
      <div class="card-body bg-rose-400">
        {{ meow }}
      </div>
    </div>
    <span>
      Learn more about AdonisJS and Inertia.js by visiting the!
      <a href="https://docs.adonisjs.com/guides/inertia">AdonisJS documentation</a>.
    </span>
  </div>
</template>

<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import layout from '~/layouts/public.vue'

defineOptions({ layout })
defineProps<{ meow: string }>()
</script>

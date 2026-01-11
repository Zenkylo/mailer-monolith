<template>
  <div class="tabs tabs-box tabs-sm border-base-300 border shadow-none rounded-sm">
    <input type="radio" name="cron" class="tab" aria-label="Builder" checked="checked" />
    <div class="tab-content border-base-300 bg-base-100 p-4 rounded-sm">
      <slot name="cron-builder"></slot>
    </div>

    <input type="radio" name="cron" class="tab" aria-label="Cron" />
    <div class="tab-content border-base-300 bg-base-100 p-4 rounded-sm">
      <div class="f fc gap-2">
        <label for="cron" class="label">
          <span class="label-text">Cron Expression</span>
        </label>
        <input
          id="cron"
          :value="cronExpression"
          type="text"
          required
          class="input input-bordered w-full"
          placeholder="0 9 * * 1 (Every Monday at 9 AM)"
          @input="$emit('update', $event.target.value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  cronExpression: string
}>()

defineEmits<{
  (e: 'update', value: string): void
}>()
</script>

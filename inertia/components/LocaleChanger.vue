<template>
  <div class="form-control">
    <select v-model="i18nLocale" id="language" class="select uppercase">
      <option v-for="lang in availableLocales" :key="lang" :value="lang">{{ lang }}</option>
    </select>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useLocale } from '~/composables/useLocale'
import { useI18n } from 'vue-i18n'
const { locale: i18nLocale, availableLocales, t } = useI18n()
const { locale } = useLocale()

/**
 * To add a language to the application, you need to:
 * 1. Create a new folder in `resources/lang` for the language (e.g., `zh` for Chinese).
 * 2. Add a `messages.json` file in the new folder with the translations.
 * 3. Update the `supportedLocales` in `config/i18n.ts` to include the new language.
 * 4. Update the barrel file export in `resources/lang/index.ts` to include the new language.
 */

watch(i18nLocale, (newLocale) => {
  locale.value = newLocale
})
</script>

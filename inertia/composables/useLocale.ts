import { ref, watch } from 'vue'
import { useLocalStorage } from '~/composables/useLocalStorage'
import { LOCAL_STORAGE_KEYS } from '~/constants'

const { getItem, setItem } = useLocalStorage()
const locale = ref(getItem(LOCAL_STORAGE_KEYS.LOCALE) || 'en')

watch(locale, (newLang) => {
  setItem(LOCAL_STORAGE_KEYS.LOCALE, newLang)
})

export function useLocale() {
  function getLocale() {
    return locale.value
  }

  return {
    locale,
    getLocale,
  }
}

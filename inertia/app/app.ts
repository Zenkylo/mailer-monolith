/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/daisy.css'
import 'primeicons/primeicons.css'

import { createApp, h } from 'vue'
import type { DefineComponent } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { createI18n } from 'vue-i18n'
import messages from '../../resources/lang/index.js'
import { useLocalStorage } from '~/composables/useLocalStorage'
import { LOCAL_STORAGE_KEYS } from '~/constants'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import ToastService from 'primevue/toastservice'
import CronLightPlugin from '@vue-js-cron/light'
import '@vue-js-cron/light/dist/light.css'

const { getItem } = useLocalStorage()
const i18n = createI18n({
  locale: getItem(LOCAL_STORAGE_KEYS.LOCALE) || 'en',
  messages,
})

const appName = import.meta.env.VITE_APP_NAME || 'AdonisJS'

createInertiaApp({
  progress: { color: '#5468FF' },

  title: (title) => `${title} - ${appName}`,

  resolve: (name) => {
    return resolvePageComponent(
      `../pages/${name}.vue`,
      import.meta.glob<DefineComponent>('../pages/**/*.vue')
    )
  },

  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .use(i18n)
      .use(PrimeVue, {
        unstyled: true,
        // theme: {
        // preset: Aura,
        // preset: MyPreset,
        // options: {
        //   darkModeSelector: '.dark',
        // },
        // },
      })
      .use(ToastService)
      .use(CronLightPlugin)
      // .use(Vue3Toasity, {
      //   icon: false,
      //   closeButton: false,
      //   hideProgressBar: true,

      //   // toastClassName: 'alert alert-success',
      //   // bodyClassName: 'text-success',
      // })
      .mount(el)
  },
})

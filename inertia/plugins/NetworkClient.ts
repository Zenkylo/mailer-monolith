import axios from 'axios'
import { useLocale } from '~/composables/useLocale'

const locale = useLocale()
// import type { App } from 'vue'

const axiosInstance = axios.create({
  baseURL: '/client',
  headers: {
    'X-Requested-Lib': 'NetworkClient',
  },
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  const selectedLocale = locale.getLocale()
  console.log(`Setting locale for request: ${selectedLocale}`)
  config.headers['X-Accept-Language'] = selectedLocale
  config.headers['Accept-Language'] = selectedLocale
  return config
})

export const useHttp = () => axiosInstance

// const Client = {
//   install(app: App) {
//     // app.config.globalProperties.$http = axiosInstance
//     app.provide('http', axiosInstance)
//   },
// }

// export default Client

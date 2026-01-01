import { useToast } from 'primevue/usetoast'

const DEFAULT_OPTIONS = {
  life: 3000,
}

export function useAppToast() {
  const toast = useToast()

  function success(summary: string, options = DEFAULT_OPTIONS) {
    toast.add({
      severity: 'success',
      summary,
      ...options,
    })
  }

  function error(summary: string, options = DEFAULT_OPTIONS) {
    toast.add({
      severity: 'error',
      summary,
      ...options,
    })
  }

  function info(summary: string, options = DEFAULT_OPTIONS) {
    toast.add({
      severity: 'info',
      summary,
      ...options,
    })
  }

  function warn(summary: string, options = DEFAULT_OPTIONS) {
    toast.add({
      severity: 'warn',
      summary,
      ...options,
    })
  }

  return {
    add: toast.add,
    success,
    error,
    info,
    warn,
  }
}

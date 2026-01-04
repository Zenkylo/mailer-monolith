<template>
  <div class="drawer lg:drawer-open">
    <input id="drawer-left" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
      <!-- Start page content -->

      <div class="navbar bg-base-200 w-full flex lg:hidden border-b border-base-300">
        <div class="flex-none lg:hidden">
          <label
            for="drawer-left"
            aria-label="open sidebar"
            class="btn btn-square btn-ghost btn-sm"
          >
            <i class="pi pi-bars"></i>
          </label>
        </div>
        <div class="flex-1 px-2"></div>
        <div class="f">
          <button class="btn btn-ghost btn-sm btn-square cursor-pointer">
            <ThemeChanger />
          </button>
        </div>
      </div>

      <main class="p-4">
        <FlashToast :messages="flashMessages" />
        <slot />
      </main>
      <!-- End page content -->
    </div>
    <div class="drawer-side">
      <label for="drawer-left" aria-label="close sidebar" class="drawer-overlay"></label>
      <div class="f fc jb bg-base-200 min-h-screen">
        <ul class="menu bg-base-200 min-h-full w-56 p-4 gap-2">
          <!-- Sidebar content here -->
          <li v-for="item in items" :key="item.label">
            <a v-if="item.el === 'a'" :href="item.route" class="btn js btn-ghost">
              <i :class="item.icon" class="mr-2"></i>
              {{ item.label }}</a
            >
            <Link
              v-else
              :href="item.route"
              class="btn js"
              :class="
                $page.url === item.route
                  ? 'btn-primary btn-soft'
                  : 'btn-ghost hover:btn-primary hover:btn-soft'
              "
            >
              <i :class="item.icon" class="mr-2"></i>
              {{ item.label }}
            </Link>
          </li>
        </ul>

        <!-- <div class="divider"></div> -->

        <ul class="menu bg-base-200 min-h-full w-56 p-4">
          <button class="btn btn-sm btn-square cursor-pointer">
            <ThemeChanger />
          </button>
          <li class="text-sm">
            {{ user?.email }}
          </li>
        </ul>
      </div>
    </div>

    <ToastProvider />

    <div
      class="hidden alert-error alert-success alert-info !border-error !border-success !border-info"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'
import FlashToast from '~/components/FlashToast.vue'
import ThemeChanger from '~/components/ThemeChanger.vue'
import ToastProvider from '~/components/ToastProvider.vue'
import { useLocalStorage } from '~/composables/use_local_storage'
import { LOCAL_STORAGE_KEYS } from '~/constants'

const props = defineProps<{
  user?: {
    email: string
  }
  flashMessages?: {
    [key: string]: string
  }
}>()

const { getItem } = useLocalStorage()
function getPreferredTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'mydark'
  }
  return 'mylight'
}

const theme = ref(getItem(LOCAL_STORAGE_KEYS.THEME) || getPreferredTheme())

onMounted(() => {
  // document.documentElement.classList.add(theme.value)
  document.documentElement.setAttribute('data-theme', theme.value)
})

const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-home',
    route: '/dashboard',
  },
  {
    label: 'Subscriptions',
    icon: 'pi pi-fw pi-envelope',
    route: '/dashboard/subscriptions',
  },
  {
    label: 'Account',
    icon: 'pi pi-fw pi-user',
    route: '/dashboard/account/settings',
  },
  {
    label: 'Logout',
    icon: 'pi pi-fw pi-sign-out',
    route: '/auth/logout',
    el: 'a',
  },
])
</script>

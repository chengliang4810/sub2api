<template>
  <!-- Custom Home Content: Full Page Mode -->
  <div v-if="homeContent" class="min-h-screen">
    <!-- iframe mode -->
    <iframe
      v-if="isHomeContentUrl"
      :src="homeContent.trim()"
      class="h-screen w-full border-0"
      allowfullscreen
    ></iframe>
    <!-- HTML mode - SECURITY: homeContent is admin-only setting, XSS risk is acceptable -->
    <div v-else v-html="homeContent"></div>
  </div>

  <!-- Default Home Page -->
  <div
    v-else
    class="min-h-screen bg-[#f7f8f5] text-slate-900 transition-colors dark:bg-dark-950 dark:text-white"
  >
    <!-- Header -->
    <header class="border-b border-slate-200/80 bg-white/90 px-5 py-4 backdrop-blur dark:border-dark-800 dark:bg-dark-950/90">
      <nav class="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <router-link to="/home" class="flex min-w-0 items-center gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-teal-700 text-white shadow-sm">
            <img
              v-if="siteLogo"
              :src="siteLogo"
              alt="Logo"
              class="h-full w-full object-contain"
            />
            <Icon v-else name="book" size="md" :stroke-width="2" />
          </span>
          <span class="truncate text-sm font-semibold tracking-normal text-slate-900 dark:text-white">
            {{ siteName }}
          </span>
        </router-link>

        <div class="flex shrink-0 items-center gap-2">
          <LocaleSwitcher />

          <a
            v-if="docUrl"
            :href="docUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-dark-300 dark:hover:bg-dark-800 dark:hover:text-white"
            :title="t('home.viewDocs')"
          >
            <Icon name="book" size="md" />
          </a>

          <button
            type="button"
            @click="toggleTheme"
            class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-dark-300 dark:hover:bg-dark-800 dark:hover:text-white"
            :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
          >
            <Icon v-if="isDark" name="sun" size="md" />
            <Icon v-else name="moon" size="md" />
          </button>

          <router-link
            :to="isAuthenticated ? dashboardPath : '/login'"
            class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-dark-700 dark:bg-dark-900 dark:text-white dark:hover:border-dark-600 dark:hover:bg-dark-800"
          >
            <Icon name="login" size="sm" :stroke-width="2" />
            <span>{{ isAuthenticated ? t('home.goToDashboard') : t('home.login') }}</span>
          </router-link>
        </div>
      </nav>
    </header>

    <main>
      <!-- Hero -->
      <section class="border-b border-slate-200/70 bg-[#fbfbf8] px-5 py-16 dark:border-dark-800 dark:bg-dark-950">
        <div class="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p class="mb-4 text-sm font-semibold text-teal-700 dark:text-teal-300">
              {{ t('home.tags.archive') }}
            </p>
            <h1 class="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-slate-950 dark:text-white md:text-5xl">
              {{ t('home.heroSubtitle') }}
            </h1>
            <p class="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-dark-300 md:text-lg">
              {{ siteSubtitle }}
            </p>
            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#resources"
                class="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-dark-100"
              >
                {{ t('home.getStarted') }}
                <Icon name="arrowDown" size="sm" class="ml-2" :stroke-width="2" />
              </a>
              <router-link
                :to="isAuthenticated ? dashboardPath : '/login'"
                class="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-dark-700 dark:bg-dark-900 dark:text-white dark:hover:bg-dark-800"
              >
                {{ isAuthenticated ? t('home.goToDashboard') : t('home.login') }}
              </router-link>
            </div>
          </div>

          <section
            class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-dark-800 dark:bg-dark-900"
            aria-labelledby="recent-updates-title"
          >
            <div class="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 id="recent-updates-title" class="text-lg font-semibold text-slate-950 dark:text-white">
                  {{ t('home.providers.title') }}
                </h2>
                <p class="mt-1 text-sm text-slate-500 dark:text-dark-400">
                  {{ t('home.providers.description') }}
                </p>
              </div>
              <span class="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-200">
                {{ t('home.tags.updates') }}
              </span>
            </div>

            <div class="space-y-3">
              <article
                v-for="item in recentUpdates"
                :key="item.titleKey"
                class="rounded-lg border border-slate-200 bg-[#fbfbf8] p-4 dark:border-dark-800 dark:bg-dark-950"
              >
                <div class="flex items-start gap-3">
                  <span :class="item.iconClass">
                    <Icon :name="item.icon" size="sm" :stroke-width="2" />
                  </span>
                  <div>
                    <h3 class="text-sm font-semibold text-slate-900 dark:text-white">
                      {{ t(item.titleKey) }}
                    </h3>
                    <p class="mt-1 text-sm leading-6 text-slate-500 dark:text-dark-400">
                      {{ t(item.descriptionKey) }}
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>

      <!-- Resource Cards -->
      <section id="resources" class="px-5 py-14">
        <div class="mx-auto max-w-6xl">
          <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p class="text-sm font-semibold text-teal-700 dark:text-teal-300">
                {{ t('home.tags.processIndex') }}
              </p>
              <h2 class="mt-2 text-3xl font-bold tracking-normal text-slate-950 dark:text-white">
                {{ t('home.solutions.title') }}
              </h2>
            </div>
            <p class="max-w-xl text-sm leading-6 text-slate-500 dark:text-dark-400">
              {{ t('home.solutions.subtitle') }}
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <article
              v-for="item in resourceCards"
              :key="item.titleKey"
              class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-slate-300 dark:border-dark-800 dark:bg-dark-900 dark:hover:border-dark-700"
            >
              <span :class="item.iconClass">
                <Icon :name="item.icon" size="md" :stroke-width="2" />
              </span>
              <h3 class="mt-5 text-lg font-semibold text-slate-950 dark:text-white">
                {{ t(item.titleKey) }}
              </h3>
              <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-dark-300">
                {{ t(item.descriptionKey) }}
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-200 bg-white px-5 py-8 dark:border-dark-800 dark:bg-dark-950">
      <div
        class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left"
      >
        <p class="text-sm text-slate-500 dark:text-dark-400">
          &copy; {{ currentYear }} {{ siteName }}. {{ t('home.footer.allRightsReserved') }}
        </p>
        <a
          v-if="docUrl"
          :href="docUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-dark-400 dark:hover:text-white"
        >
          {{ t('home.docs') }}
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore, useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'

const { t } = useI18n()

const authStore = useAuthStore()
const appStore = useAppStore()

const siteName = computed(() => 'Qinglan Knowledge Base')
const siteLogo = computed(() => '')
const siteSubtitle = computed(() => t('home.heroDescription'))
const docUrl = computed(() => '')
const homeContent = computed(() => appStore.cachedPublicSettings?.home_content || '')

const isHomeContentUrl = computed(() => {
  const content = homeContent.value.trim()
  return content.startsWith('http://') || content.startsWith('https://')
})

const isDark = ref(document.documentElement.classList.contains('dark'))

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const dashboardPath = computed(() => isAdmin.value ? '/admin/dashboard' : '/dashboard')

const resourceCards = [
  {
    icon: 'book' as const,
    iconClass: 'inline-flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-200',
    titleKey: 'home.features.processGuides',
    descriptionKey: 'home.features.processGuidesDesc',
  },
  {
    icon: 'document' as const,
    iconClass: 'inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',
    titleKey: 'home.features.projectNotes',
    descriptionKey: 'home.features.projectNotesDesc',
  },
  {
    icon: 'link' as const,
    iconClass: 'inline-flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
    titleKey: 'home.features.commonLinks',
    descriptionKey: 'home.features.commonLinksDesc',
  },
]

const recentUpdates = [
  {
    icon: 'clipboard' as const,
    iconClass: 'mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-200',
    titleKey: 'home.providers.resourceIndex',
    descriptionKey: 'home.resourceScope.items.process.desc',
  },
  {
    icon: 'calendar' as const,
    iconClass: 'mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',
    titleKey: 'home.providers.processNotes',
    descriptionKey: 'home.resourceScope.items.policy.desc',
  },
  {
    icon: 'userCircle' as const,
    iconClass: 'mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
    titleKey: 'home.providers.contactDetails',
    descriptionKey: 'home.resourceScope.items.common.desc',
  },
]

const currentYear = computed(() => new Date().getFullYear())

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme')
  if (
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
}

onMounted(() => {
  initTheme()

  authStore.checkAuth()
})
</script>

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
    class="relative flex min-h-screen flex-col overflow-hidden bg-[#f8fbff] text-slate-950 dark:bg-dark-950 dark:text-white"
  >
    <!-- Background Decorations -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(124,58,237,0.16),transparent_36%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f4fbff_54%,#f8fbff_100%)] dark:bg-[radial-gradient(circle_at_50%_35%,rgba(124,58,237,0.28),transparent_36%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_58%,#020617_100%)]"
      ></div>
    </div>

    <!-- Header -->
    <header class="absolute inset-x-0 top-0 z-30 px-6 py-4">
      <nav class="mx-auto flex max-w-[1440px] items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center">
          <div class="h-10 w-10 overflow-hidden rounded-xl shadow-md">
            <img :src="siteLogo || '/logo.png'" alt="Logo" class="h-full w-full object-contain" />
          </div>
        </div>

        <!-- Nav Actions -->
        <div class="flex items-center gap-3">
          <!-- Language Switcher -->
          <LocaleSwitcher />

          <!-- Doc Link -->
          <a
            v-if="docUrl"
            :href="docUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-dark-400 dark:hover:bg-dark-800 dark:hover:text-white"
            :title="t('home.viewDocs')"
          >
            <Icon name="book" size="md" />
          </a>

          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-dark-400 dark:hover:bg-dark-800 dark:hover:text-white"
            :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
          >
            <Icon v-if="isDark" name="sun" size="md" />
            <Icon v-else name="moon" size="md" />
          </button>

          <!-- Login / Dashboard Button -->
          <router-link
            v-if="isAuthenticated"
            :to="dashboardPath"
            class="inline-flex items-center gap-1.5 rounded-full bg-gray-900 py-1 pl-1 pr-2.5 transition-colors hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <span
              class="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-[10px] font-semibold text-white"
            >
              {{ userInitial }}
            </span>
            <span class="text-xs font-medium text-white">{{ t('home.dashboard') }}</span>
            <svg
              class="h-3 w-3 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
              />
            </svg>
          </router-link>
          <router-link
            v-else
            to="/login"
            class="inline-flex items-center rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            {{ t('home.login') }}
          </router-link>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 flex-1 pb-14">
      <div class="mx-auto max-w-[1440px]">
        <section
          data-test="home-hero-section"
          class="relative left-1/2 mb-12 min-h-screen w-screen -translate-x-1/2 overflow-visible"
        >
          <div
            data-test="home-ai-orbit-visual"
            class="home-connection-globe pointer-events-none absolute right-[2%] top-[10%] h-[800px] w-[800px] opacity-90"
          >
            <div class="home-globe-spin-layer">
              <div class="home-globe-ring"></div>
              <div class="home-globe-ring home-globe-ring-inner"></div>
              <div class="home-globe-ring home-globe-ring-core"></div>
              <div class="home-globe-latitude home-globe-latitude-mid"></div>
              <div class="home-globe-latitude home-globe-latitude-top"></div>
              <div class="home-globe-latitude home-globe-latitude-bottom"></div>
              <svg viewBox="0 0 800 800" class="absolute inset-0 h-full w-full opacity-60">
                <ellipse cx="400" cy="400" rx="200" ry="400" fill="none" stroke="#6844ED" stroke-width="3" />
                <ellipse cx="400" cy="400" rx="100" ry="400" fill="none" stroke="#6844ED" stroke-width="3" />
                <ellipse cx="400" cy="400" rx="300" ry="400" fill="none" stroke="#6844ED" stroke-width="3" />
              </svg>
              <div class="home-globe-node home-globe-node-one"></div>
              <div class="home-globe-node home-globe-node-two"></div>
              <div class="home-globe-node home-globe-node-three"></div>
              <div class="home-globe-node home-globe-node-four"></div>
              <div class="home-globe-core"></div>
            </div>
          </div>

          <div class="pointer-events-none absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-[#6844ED]/10 blur-[120px]"></div>
          <div class="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-[#6844ED]/10 blur-[120px]"></div>

          <div
            data-test="home-hero-copy"
            class="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-12 pt-40"
          >
            <div data-test="home-hero-text" class="max-w-3xl space-y-8 text-center lg:-translate-x-10 lg:text-left xl:-translate-x-16">
              <div>
                <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-[#6844ED]/10 bg-[#6844ED]/5 px-3 py-1.5 text-sm font-bold text-[#6844ED]">
                  <span class="text-base leading-none">*</span>
                  自建号池 · 稳定如初
                </div>

                <h1 class="text-5xl font-black leading-[1.16] tracking-normal text-slate-900 dark:text-white lg:text-7xl">
                  聚合全球顶尖模型
                  <span class="mt-2 block bg-gradient-to-r from-[#6844ED] to-[#9b7dfa] bg-clip-text text-transparent">
                    一个 API 连接未来
                  </span>
                </h1>

                <p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-dark-300 lg:mx-0 lg:text-xl">
                  专为开发者打造企业级 AI 接口平台。无缝接入 OpenAI、Anthropic、Google 等前沿大模型，稳定调度、价格透明、按量计费。
                </p>
              </div>

              <div class="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <router-link
                  :to="isAuthenticated ? dashboardPath : '/login'"
                  class="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#6844ED] px-8 text-base font-bold text-white shadow-lg shadow-[#6844ED]/20 transition hover:-translate-y-0.5 hover:bg-[#5736d6] sm:w-auto"
                >
                  {{ isAuthenticated ? t('home.goToDashboard') : '开始免费体验' }}
                  <Icon name="arrowRight" size="md" :stroke-width="2" />
                </router-link>
                <a
                  v-if="docUrl"
                  :href="docUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 text-base font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-100 dark:hover:bg-dark-800 sm:w-auto"
                >
                  <Icon name="book" size="md" />
                  查看开发者文档
                </a>
                <router-link
                  v-else
                  to="/models"
                  class="inline-flex h-14 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-base font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-100 dark:hover:bg-dark-800 sm:w-auto"
                >
                  查看模型价格
                </router-link>
              </div>
            </div>
          </div>
        </section>

        <div data-test="home-model-square-section" class="mt-20 px-6">
          <HomeModelSquarePreview v-if="showModelSquareHome" />
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 border-t border-gray-200/50 px-6 py-8 dark:border-dark-800/50">
        <div
          class="mx-auto flex max-w-[1440px] flex-col items-center justify-center gap-4 text-center sm:flex-row sm:text-left"
        >
        <p class="text-sm text-gray-500 dark:text-dark-400">
          &copy; {{ currentYear }} {{ siteName }}. {{ t('home.footer.allRightsReserved') }}
        </p>
        <div class="flex items-center gap-4">
          <a
            v-if="docUrl"
            :href="docUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-dark-400 dark:hover:text-white"
          >
            {{ t('home.docs') }}
          </a>
          <a
            :href="githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-dark-400 dark:hover:text-white"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore, useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import HomeModelSquarePreview from '@/components/home/HomeModelSquarePreview.vue'
import Icon from '@/components/icons/Icon.vue'

const { t } = useI18n()

const authStore = useAuthStore()
const appStore = useAppStore()

// Site settings - directly from appStore (already initialized from injected config)
const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Sub2API')
const siteLogo = computed(() => appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '')
const docUrl = computed(() => appStore.cachedPublicSettings?.doc_url || appStore.docUrl || '')
const homeContent = computed(() => appStore.cachedPublicSettings?.home_content || '')
const showModelSquareHome = computed(() => appStore.cachedPublicSettings?.model_square_home_enabled === true)

// Check if homeContent is a URL (for iframe display)
const isHomeContentUrl = computed(() => {
  const content = homeContent.value.trim()
  return content.startsWith('http://') || content.startsWith('https://')
})

// Theme
const isDark = ref(document.documentElement.classList.contains('dark'))

// GitHub URL
const githubUrl = 'https://github.com/Wei-Shaw/sub2api'

// Auth state
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const dashboardPath = computed(() => isAdmin.value ? '/admin/dashboard' : '/dashboard')
const userInitial = computed(() => {
  const user = authStore.user
  if (!user || !user.email) return ''
  return user.email.charAt(0).toUpperCase()
})

// Current year for footer
const currentYear = computed(() => new Date().getFullYear())

// Toggle theme
function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// Initialize theme
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

  // Check auth state
  authStore.checkAuth()

  // Ensure public settings are loaded (will use cache if already loaded from injected config)
  if (!appStore.publicSettingsLoaded) {
    appStore.fetchPublicSettings()
  }
})
</script>

<style scoped>
.home-connection-globe {
  mask-image: linear-gradient(to bottom, black 0%, black 72%, transparent 92%);
  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 72%, transparent 92%);
}

.home-globe-spin-layer {
  position: absolute;
  inset: 0;
  animation: home-globe-spin 100s linear infinite;
}

.home-globe-ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 3px solid rgba(104, 68, 237, 0.4);
}

.home-globe-ring-inner {
  inset: 32px;
  border-color: rgba(104, 68, 237, 0.3);
  border-style: dashed;
}

.home-globe-ring-core {
  inset: 64px;
  border-width: 2px;
  border-color: rgba(104, 68, 237, 0.2);
}

.home-globe-latitude {
  position: absolute;
  height: 2px;
  background: rgba(104, 68, 237, 0.24);
}

.home-globe-latitude-mid {
  left: 0;
  top: 50%;
  width: 100%;
  background: rgba(104, 68, 237, 0.3);
}

.home-globe-latitude-top {
  left: 6%;
  top: 25%;
  width: 88%;
}

.home-globe-latitude-bottom {
  bottom: 25%;
  left: 6%;
  width: 88%;
}

.home-globe-node {
  position: absolute;
  height: 12px;
  width: 12px;
  border-radius: 9999px;
  background: #6844ed;
  box-shadow: 0 0 20px rgba(104, 68, 237, 0.9);
  animation: home-node-pulse 3s ease-in-out infinite;
}

.home-globe-node::after {
  position: absolute;
  left: 50%;
  top: 50%;
  height: 2px;
  width: 210px;
  content: '';
  transform-origin: left center;
  background: linear-gradient(90deg, rgba(104, 68, 237, 0.45), transparent);
}

.home-globe-node-one {
  left: 72%;
  top: 26%;
}

.home-globe-node-one::after {
  transform: rotate(148deg);
}

.home-globe-node-two {
  left: 20%;
  top: 42%;
  animation-delay: 0.5s;
}

.home-globe-node-two::after {
  transform: rotate(8deg);
}

.home-globe-node-three {
  left: 58%;
  top: 73%;
  animation-delay: 1s;
}

.home-globe-node-three::after {
  transform: rotate(-112deg);
}

.home-globe-node-four {
  left: 38%;
  top: 18%;
  animation-delay: 1.4s;
}

.home-globe-node-four::after {
  transform: rotate(62deg);
}

.home-globe-core {
  position: absolute;
  left: 50%;
  top: 50%;
  display: flex;
  height: 48px;
  width: 48px;
  transform: translate(-50%, -50%);
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #6844ed;
  box-shadow: 0 0 60px 15px rgba(104, 68, 237, 0.5);
}

.home-globe-core::after {
  height: 24px;
  width: 24px;
  border-radius: 9999px;
  background: white;
  content: '';
  animation: home-node-pulse 2s ease-in-out infinite;
}

@keyframes home-globe-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes home-node-pulse {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.35);
  }
}
</style>

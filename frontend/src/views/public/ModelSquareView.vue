<template>
  <AppLayout>
    <div class="mx-auto flex w-full max-w-[1460px] flex-col gap-7 text-slate-950 dark:text-white">
      <section class="text-center">
        <h1 class="text-5xl font-black leading-tight tracking-normal text-slate-950 dark:text-white md:text-6xl">
          模型 <span class="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">定价</span>
        </h1>
        <p class="mx-auto mt-5 max-w-4xl text-lg font-medium leading-8 text-slate-500 dark:text-dark-300">
          官方原价以美元（USD）标注，折合价与本站价格以人民币（CNY）计价，单位：百万 tokens
        </p>
        <div class="mt-7 flex flex-wrap items-center justify-center gap-4">
          <span class="rounded-full border border-cyan-300 bg-cyan-50 px-5 py-2.5 text-base font-bold text-cyan-800 shadow-sm dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-200">
            充值规则：¥1 人民币 = $1 美元额度
          </span>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-dark-700 dark:bg-dark-900">
        <div class="grid gap-4 lg:grid-cols-[minmax(280px,1fr)_auto] lg:items-center">
          <label class="relative block">
            <span class="sr-only">搜索模型</span>
            <input
              v-model="searchText"
              class="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-5 text-sm font-medium text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 dark:border-dark-600 dark:bg-dark-800 dark:text-white dark:focus:border-amber-500 dark:focus:ring-amber-950/50"
              placeholder="搜索模型、分组"
              type="search"
            />
          </label>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="group in groups"
              :key="group.id"
              type="button"
              class="h-10 rounded-full border px-4 text-sm font-bold transition"
              :class="activeGroup === group.id
                ? 'border-amber-600 bg-amber-600 text-white shadow-sm shadow-amber-200 dark:shadow-none'
                : 'border-stone-200 bg-white text-stone-600 hover:border-amber-300 hover:text-amber-700 dark:border-dark-600 dark:bg-dark-800 dark:text-dark-200 dark:hover:border-amber-500 dark:hover:text-amber-200'"
              @click="activeGroup = group.id"
            >
              {{ group.name }}
            </button>
          </div>
        </div>
      </section>

      <section
        v-if="loadError"
        class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300"
      >
        {{ loadError }}
      </section>

      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-dark-700 dark:bg-dark-900">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[1260px] border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-slate-950 dark:border-dark-700 dark:bg-dark-800 dark:text-white">
                <th class="w-[26rem] px-7 py-6 text-base font-black">模型</th>
                <th class="w-64 px-6 py-6 text-base font-black">分组</th>
                <th class="px-5 py-6 text-center text-base font-black">
                  官方输入
                  <span class="mx-auto mt-2 block w-fit rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">美元 USD</span>
                </th>
                <th class="px-5 py-6 text-center text-base font-black">
                  官方输出
                  <span class="mx-auto mt-2 block w-fit rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">美元 USD</span>
                </th>
                <th class="px-5 py-6 text-center text-base font-black">
                  人民币折合
                  <span class="mx-auto mt-2 block w-fit rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">人民币 CNY</span>
                </th>
                <th class="px-5 py-6 text-center text-base font-black">
                  人民币折合
                  <span class="mx-auto mt-2 block w-fit rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">人民币 CNY</span>
                </th>
                <th class="px-5 py-6 text-center text-base font-black text-teal-700 dark:text-teal-300">
                  本站输入价
                  <span class="mx-auto mt-2 block w-fit rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-200">人民币 CNY</span>
                </th>
                <th class="px-5 py-6 text-center text-base font-black text-teal-700 dark:text-teal-300">
                  本站输出价
                  <span class="mx-auto mt-2 block w-fit rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-200">人民币 CNY</span>
                </th>
                <th class="w-36 px-5 py-6 text-center text-base font-black">最终折扣</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-dark-800">
              <tr v-if="loading">
                <td colspan="9" class="px-6 py-14 text-center text-slate-500 dark:text-dark-400">
                  正在加载模型定价
                </td>
              </tr>
              <tr v-else-if="filteredModels.length === 0">
                <td colspan="9" class="px-6 py-14 text-center text-slate-500 dark:text-dark-400">
                  暂无匹配模型
                </td>
              </tr>
              <template v-else>
                <tr
                  v-for="item in filteredModels"
                  :key="`${item.name}-${item.group.id}-${item.channel_name}-${item.tier_label || ''}`"
                  class="bg-white transition hover:bg-slate-50 dark:bg-dark-900 dark:hover:bg-dark-800/70"
                >
                  <td class="px-7 py-6 align-middle">
                    <div class="truncate whitespace-nowrap text-lg font-black leading-7 text-slate-950 dark:text-white">
                      {{ item.name }}
                    </div>
                    <div v-if="item.tier_label" class="mt-2 inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-dark-700 dark:text-dark-200">
                      {{ item.tier_label }}
                    </div>
                  </td>
                  <td class="px-6 py-6 align-middle">
                    <div class="truncate whitespace-nowrap text-lg font-semibold leading-7 text-slate-500 dark:text-dark-200">{{ item.group.name }}</div>
                    <div class="mt-1 text-xs font-bold uppercase text-slate-400 dark:text-dark-400">{{ item.platform }}</div>
                  </td>
                  <td class="px-5 py-6 text-center align-middle">
                    <span class="inline-flex min-w-28 justify-center rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-lg font-black text-amber-700 shadow-sm dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                      {{ formatUsd(item.official.input_per_million_usd) }}
                    </span>
                  </td>
                  <td class="px-5 py-6 text-center align-middle">
                    <span class="inline-flex min-w-28 justify-center rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-lg font-black text-amber-700 shadow-sm dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                      {{ formatUsd(item.official.output_per_million_usd) }}
                    </span>
                  </td>
                  <td class="px-5 py-6 text-center align-middle">
                    <span class="inline-flex min-w-28 justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-lg font-bold text-emerald-700 line-through decoration-2 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
                      {{ formatCny(item.official.input_per_million_cny) }}
                    </span>
                  </td>
                  <td class="px-5 py-6 text-center align-middle">
                    <span class="inline-flex min-w-28 justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-lg font-bold text-emerald-700 line-through decoration-2 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
                      {{ formatCny(item.official.output_per_million_cny) }}
                    </span>
                  </td>
                  <td class="px-5 py-6 text-center align-middle">
                    <span class="inline-flex min-w-36 items-baseline justify-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-5 py-3 font-black text-teal-700 shadow-sm shadow-teal-100 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-200 dark:shadow-none">
                      <span class="text-xs uppercase opacity-70">CNY</span>
                      <span class="text-2xl">{{ formatNumber(item.site.input_per_million_cny) }}</span>
                    </span>
                  </td>
                  <td class="px-5 py-6 text-center align-middle">
                    <span class="inline-flex min-w-36 items-baseline justify-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-5 py-3 font-black text-teal-700 shadow-sm shadow-teal-100 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-200 dark:shadow-none">
                      <span class="text-xs uppercase opacity-70">CNY</span>
                      <span class="text-2xl">{{ formatNumber(item.site.output_per_million_cny) }}</span>
                    </span>
                  </td>
                  <td class="px-5 py-6 text-center align-middle">
                    <span
                      class="inline-flex min-w-[7.5rem] flex-col items-center justify-center rounded-full px-4 py-2.5 text-white shadow-lg"
                      :class="discountPillClass(item.platform)"
                    >
                      <span class="text-xs font-bold opacity-80">最终折扣</span>
                      <span class="text-2xl font-black leading-7">{{ formatDiscountRatio(item) }}</span>
                      <span class="mt-1 text-xs font-bold opacity-80">{{ formatDiscountLabel(item) }}</span>
                    </span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getModelSquareCatalog, type ModelSquareGroup, type ModelSquareModel } from '@/api/modelSquare'
import AppLayout from '@/components/layout/AppLayout.vue'

const searchText = ref('')
const activeGroup = ref(0)
const loading = ref(false)
const loadError = ref('')
const models = ref<ModelSquareModel[]>([])
const catalogGroups = ref<ModelSquareGroup[]>([])

const groups = computed(() => [
  { id: 0, name: '全部' },
  ...catalogGroups.value.map((group) => ({ id: group.id, name: group.name })),
])

const filteredModels = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  return models.value.filter((item) => {
    const matchesGroup = activeGroup.value === 0 || item.group.id === activeGroup.value
    const matchesKeyword =
      !keyword ||
      item.name.toLowerCase().includes(keyword) ||
      (item.tier_label ?? '').toLowerCase().includes(keyword) ||
      item.group.name.toLowerCase().includes(keyword) ||
      item.platform.toLowerCase().includes(keyword)
    return matchesGroup && matchesKeyword
  })
})

function formatNumber(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, '')
}

function formatUsd(value: number): string {
  return `$${formatNumber(value)}`
}

function formatCny(value: number): string {
  return `¥${formatNumber(value)}`
}

function getDiscountRatio(item: ModelSquareModel): number {
  const official = item.official.input_per_million_cny
  const site = item.site.input_per_million_cny
  if (official > 0 && site >= 0) {
    return site / official
  }
  const fallback = item.discount / 10
  return Number.isFinite(fallback) && fallback >= 0 ? fallback : 0
}

function formatDiscountRatio(item: ModelSquareModel): string {
  return `${formatNumber(getDiscountRatio(item))}x`
}

function formatDiscountLabel(item: ModelSquareModel): string {
  return `${formatNumber(getDiscountRatio(item) * 10)}折`
}

function discountPillClass(platform: string): string {
  if (platform === 'openai') {
    return 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-200 dark:shadow-none'
  }
  return 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-200 dark:shadow-none'
}

async function loadModelSquare() {
  loading.value = true
  loadError.value = ''
  try {
    const catalog = await getModelSquareCatalog()
    models.value = catalog.models
    catalogGroups.value = catalog.groups
  } catch (err) {
    console.error('Failed to load model square:', err)
    loadError.value = '模型定价加载失败，请稍后刷新重试'
    models.value = []
    catalogGroups.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadModelSquare)
</script>

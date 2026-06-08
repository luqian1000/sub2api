<template>
  <div class="min-h-screen bg-slate-50 text-slate-950">
    <main class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section class="text-center">
        <p class="mb-3 text-sm font-semibold text-violet-600">MODEL MARKET</p>
        <h1 class="text-4xl font-bold sm:text-5xl">
          模型 <span class="text-violet-600">定价</span>
        </h1>
        <p class="mt-4 text-base text-slate-600 sm:text-lg">
          官方原价以美元（USD）标注，折合价与本站价格以人民币（CNY）计价，单位：百万 tokens
        </p>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span class="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            充值规则：¥1 人民币 = $1 美元额度
          </span>
          <span class="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
            先享 1.43 折，再叠加渠道倍率算最终折扣
          </span>
        </div>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <label class="relative block">
            <span class="sr-only">搜索模型</span>
            <input
              v-model="searchText"
              class="h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              placeholder="搜索模型、分组或渠道"
              type="search"
            />
          </label>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="group in groups"
              :key="group.id"
              type="button"
              class="h-10 rounded-md border px-4 text-sm font-semibold transition"
              :class="activeGroup === group.id
                ? 'border-violet-500 bg-violet-600 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'"
              @click="activeGroup = group.id"
            >
              {{ group.name }}
            </button>
          </div>
        </div>
      </section>

      <section
        v-if="loadError"
        class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
      >
        {{ loadError }}
      </section>

      <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[1080px] border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-slate-950">
                <th class="w-44 px-6 py-5 font-bold">模型</th>
                <th class="w-44 px-6 py-5 font-bold">分组</th>
                <th class="px-6 py-5 text-center font-bold">
                  官方输入
                  <span class="mx-auto mt-2 block w-fit rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-amber-700">美元 USD</span>
                </th>
                <th class="px-6 py-5 text-center font-bold">
                  官方输出
                  <span class="mx-auto mt-2 block w-fit rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-amber-700">美元 USD</span>
                </th>
                <th class="px-6 py-5 text-center font-bold">
                  人民币折合
                  <span class="mx-auto mt-2 block w-fit rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">人民币 CNY</span>
                </th>
                <th class="px-6 py-5 text-center font-bold">
                  人民币折合
                  <span class="mx-auto mt-2 block w-fit rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">人民币 CNY</span>
                </th>
                <th class="px-6 py-5 text-center font-bold text-blue-700">
                  本站输入价
                  <span class="mx-auto mt-2 block w-fit rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">人民币 CNY</span>
                </th>
                <th class="px-6 py-5 text-center font-bold text-blue-700">
                  本站输出价
                  <span class="mx-auto mt-2 block w-fit rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">人民币 CNY</span>
                </th>
                <th class="w-40 px-6 py-5 text-center font-bold">最终折扣</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredModels"
                :key="`${item.name}-${item.group.id}-${item.channel_name}`"
                class="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/70"
              >
                <td class="px-6 py-5 align-middle text-base font-bold text-slate-950">
                  {{ item.name }}
                  <span v-if="item.tier_label" class="mt-1 block text-sm font-semibold text-slate-600">
                    ({{ item.tier_label }})
                  </span>
                  <span class="mt-1 block text-sm font-medium text-slate-500">{{ item.channel_name }}</span>
                </td>
                <td class="px-6 py-5 align-middle text-base text-slate-600">
                  {{ item.group.name }}
                </td>
                <td class="px-6 py-5 text-center align-middle">
                  <span class="inline-flex min-w-24 justify-center rounded-md border border-amber-200 bg-amber-50 px-4 py-2 font-bold text-amber-700 shadow-sm">
                    {{ formatUsd(item.official.input_per_million_usd) }}
                  </span>
                </td>
                <td class="px-6 py-5 text-center align-middle">
                  <span class="inline-flex min-w-24 justify-center rounded-md border border-amber-200 bg-amber-50 px-4 py-2 font-bold text-amber-700 shadow-sm">
                    {{ formatUsd(item.official.output_per_million_usd) }}
                  </span>
                </td>
                <td class="px-6 py-5 text-center align-middle">
                  <span class="inline-flex min-w-24 justify-center rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 font-semibold text-emerald-700 line-through decoration-2">
                    {{ formatCny(item.official.input_per_million_cny) }}
                  </span>
                </td>
                <td class="px-6 py-5 text-center align-middle">
                  <span class="inline-flex min-w-24 justify-center rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 font-semibold text-emerald-700 line-through decoration-2">
                    {{ formatCny(item.official.output_per_million_cny) }}
                  </span>
                </td>
                <td class="px-6 py-5 text-center align-middle">
                  <span
                    class="inline-flex min-w-28 items-baseline justify-center gap-1 rounded-md border px-4 py-2 font-bold shadow-sm"
                    :class="priceClass(item.platform)"
                  >
                    <span class="text-xs">CNY</span>
                    <span class="text-xl">{{ formatNumber(item.site.input_per_million_cny) }}</span>
                  </span>
                </td>
                <td class="px-6 py-5 text-center align-middle">
                  <span
                    class="inline-flex min-w-28 items-baseline justify-center gap-1 rounded-md border px-4 py-2 font-bold shadow-sm"
                    :class="priceClass(item.platform)"
                  >
                    <span class="text-xs">CNY</span>
                    <span class="text-xl">{{ formatNumber(item.site.output_per_million_cny) }}</span>
                  </span>
                </td>
                <td class="px-6 py-5 text-center align-middle">
                  <span
                    class="inline-flex min-w-32 flex-col items-center justify-center rounded-full px-5 py-3 text-white shadow-lg"
                    :class="discountClass(item.platform)"
                  >
                    <span class="text-xs font-semibold">最终折扣</span>
                    <span class="text-2xl font-bold leading-6">{{ formatDiscount(item.discount) }}</span>
                  </span>
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="9" class="px-6 py-12 text-center text-slate-500">
                  正在加载模型定价
                </td>
              </tr>
              <tr v-else-if="filteredModels.length === 0">
                <td colspan="9" class="px-6 py-12 text-center text-slate-500">
                  暂无匹配模型
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getModelSquareCatalog, type ModelSquareGroup, type ModelSquareModel } from '@/api/modelSquare'

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
      item.channel_name.toLowerCase().includes(keyword) ||
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

function formatDiscount(value: number): string {
  return `${formatNumber(value)}折`
}

function priceClass(platform: string): string {
  if (platform === 'anthropic' || platform === 'antigravity') {
    return 'border-violet-200 bg-violet-50 text-violet-700'
  }
  return 'border-blue-200 bg-blue-50 text-blue-700'
}

function discountClass(platform: string): string {
  if (platform === 'anthropic' || platform === 'antigravity') {
    return 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-violet-200'
  }
  return 'bg-gradient-to-r from-blue-500 to-sky-500 shadow-blue-200'
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

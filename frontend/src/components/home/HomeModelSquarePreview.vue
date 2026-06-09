<template>
  <section class="mb-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-dark-700 dark:bg-dark-900 dark:shadow-none">
    <div class="grid gap-6 border-b border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eff6ff_48%,#faf5ff_100%)] px-7 py-8 dark:border-dark-700 dark:bg-none dark:bg-dark-900 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <p class="text-xs font-black uppercase tracking-wide text-blue-600 dark:text-blue-300">
          Price Advantage
        </p>
        <h2 class="mt-2 text-3xl font-black text-slate-950 dark:text-white md:text-4xl">
          模型价格对比
        </h2>
        <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-dark-300">
          官方价、人民币折合价和本站优惠价同屏对比，优惠差距一眼看清。
        </p>
        <div class="mt-4 flex flex-wrap gap-3">
          <span class="rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
            充值规则：¥1 人民币 = $1 美元额度
          </span>
        </div>
      </div>
      <router-link
        to="/models"
        class="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-blue-700 dark:bg-white dark:text-slate-950 dark:shadow-none dark:hover:bg-blue-100"
      >
        查看全部
      </router-link>
    </div>

    <div v-if="loadError" class="px-6 py-6 text-sm font-medium text-rose-600 dark:text-rose-400">
      {{ loadError }}
    </div>

    <div v-else class="px-7 py-7">
      <div v-if="loading" class="rounded-lg border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500 dark:border-dark-600 dark:text-dark-400">
        正在加载模型价格
      </div>
      <div v-else-if="previewModels.length === 0" class="rounded-lg border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500 dark:border-dark-600 dark:text-dark-400">
        暂无模型价格
      </div>
      <div v-else data-test="model-square-preview-grid" class="grid grid-cols-2 gap-5">
        <article
          v-for="item in previewModels"
          :key="`${item.name}-${item.group.id}-${item.channel_name}-${item.tier_label || ''}`"
          class="grid min-w-0 grid-cols-[minmax(84px,0.4fr)_minmax(0,2fr)_minmax(64px,auto)] items-center gap-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-dark-700 dark:bg-dark-800 dark:hover:border-blue-800"
        >
          <div class="min-w-0">
            <h3 data-test="model-square-preview-name" class="truncate whitespace-nowrap text-xl font-black leading-7 text-slate-950 dark:text-white">{{ item.name }}</h3>
            <p data-test="model-square-preview-group" class="mt-2 truncate whitespace-nowrap text-base font-bold text-slate-500 dark:text-dark-300">{{ item.group.name }}</p>
            <p v-if="item.tier_label" class="mt-2 truncate whitespace-nowrap text-xs font-bold text-slate-400 dark:text-dark-400">{{ item.tier_label }}</p>
          </div>
          <div class="grid min-w-0 grid-cols-2 justify-items-center gap-1">
            <div data-test="model-square-preview-input-card" class="min-w-0 w-full max-w-[220px] rounded-lg border border-emerald-200 bg-emerald-50 px-1 py-3 text-center dark:border-emerald-900 dark:bg-emerald-950/20">
              <div data-test="model-square-preview-official-input-labels" class="grid grid-cols-2 gap-2 text-[11px] font-black text-[#1E4ED8]">
                <span class="whitespace-nowrap">官方美元价</span>
                <span class="whitespace-nowrap">官方折合输入</span>
              </div>
              <div data-test="model-square-preview-official-input-values" class="mt-1 grid grid-cols-2 gap-2 text-lg font-bold text-[#1E4ED8]">
                <span class="whitespace-nowrap">{{ formatUsd(item.official.input_per_million_usd) }}</span>
                <span class="whitespace-nowrap">{{ formatCny(item.official.input_per_million_cny) }}</span>
              </div>
              <div data-test="model-square-preview-site-input-label" class="mt-3 text-sm font-bold text-[#6843ED]">本站输入价</div>
              <div data-test="model-square-preview-site-input-price" class="mx-auto mt-1 w-2/3 rounded-md border border-blue-200 bg-blue-50 px-2 py-2 text-2xl font-black text-[#6843ED] dark:border-blue-900 dark:bg-blue-950/30">
                {{ formatCny(item.site.input_per_million_cny) }}
              </div>
            </div>
            <div data-test="model-square-preview-output-card" class="min-w-0 w-full max-w-[220px] rounded-lg border border-emerald-200 bg-emerald-50 px-1 py-3 text-center dark:border-emerald-900 dark:bg-emerald-950/20">
              <div data-test="model-square-preview-official-output-labels" class="grid grid-cols-2 gap-2 text-[11px] font-black text-[#1E4ED8]">
                <span class="whitespace-nowrap">官方美元价</span>
                <span class="whitespace-nowrap">官方折合输出</span>
              </div>
              <div data-test="model-square-preview-official-output-values" class="mt-1 grid grid-cols-2 gap-2 text-lg font-bold text-[#1E4ED8]">
                <span class="whitespace-nowrap">{{ formatUsd(item.official.output_per_million_usd) }}</span>
                <span class="whitespace-nowrap">{{ formatCny(item.official.output_per_million_cny) }}</span>
              </div>
              <div data-test="model-square-preview-site-output-label" class="mt-3 text-sm font-bold text-[#6843ED]">本站输出价</div>
              <div data-test="model-square-preview-site-output-price" class="mx-auto mt-1 w-2/3 rounded-md border border-blue-200 bg-blue-50 px-2 py-2 text-2xl font-black text-[#6843ED] dark:border-blue-900 dark:bg-blue-950/30">
                {{ formatCny(item.site.output_per_million_cny) }}
              </div>
            </div>
          </div>
          <span
            data-test="model-square-preview-discount"
            class="inline-flex min-w-16 flex-col items-center justify-center rounded-full px-2 py-3 text-white shadow-lg"
            :class="discountPillClass(item.platform)"
          >
            <span class="text-xs font-bold opacity-80">最终折扣</span>
            <span class="text-xl font-black leading-6">{{ formatDiscountRatio(item) }}</span>
            <span class="mt-1 text-xs font-bold opacity-80">{{ formatDiscountLabel(item) }}</span>
          </span>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { getModelSquareCatalog, type ModelSquareModel } from '@/api/modelSquare'

const loading = ref(false)
const loadError = ref('')
const models = ref<ModelSquareModel[]>([])
const abortController = new AbortController()

const previewModels = computed(() => models.value.slice(0, 6))

function formatNumber(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, '')
}

function formatCny(value: number): string {
  return `¥${formatNumber(value)}`
}

function formatUsd(value: number): string {
  return `$${formatNumber(value)}`
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
    return 'bg-gradient-to-r from-blue-500 to-blue-700 shadow-blue-200 dark:shadow-none'
  }
  return 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-violet-200 dark:shadow-none'
}

async function loadPreview() {
  loading.value = true
  loadError.value = ''
  try {
    const catalog = await getModelSquareCatalog({ signal: abortController.signal })
    models.value = catalog.models
  } catch (err) {
    if (abortController.signal.aborted) return
    console.error('Failed to load model square preview:', err)
    loadError.value = '模型价格加载失败，请稍后刷新重试'
    models.value = []
  } finally {
    if (!abortController.signal.aborted) {
      loading.value = false
    }
  }
}

onMounted(loadPreview)
onBeforeUnmount(() => abortController.abort())
</script>

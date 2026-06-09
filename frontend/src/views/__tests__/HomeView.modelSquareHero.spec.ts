import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const appStore = vi.hoisted(() => ({
  cachedPublicSettings: {
    site_name: 'Sub2API',
    site_logo: '',
    site_subtitle: 'Subscription to API Conversion Platform',
    doc_url: '',
    home_content: '',
    model_square_home_enabled: true,
  },
  siteName: 'Sub2API',
  siteLogo: '',
  docUrl: '',
  publicSettingsLoaded: true,
  fetchPublicSettings: vi.fn(),
}))

const authStore = vi.hoisted(() => ({
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  checkAuth: vi.fn(),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => ({
      'home.login': '登录',
      'home.getStarted': '开始使用',
      'home.goToDashboard': '进入控制台',
      'home.dashboard': '控制台',
      'home.viewDocs': '查看文档',
      'home.switchToLight': '切换浅色',
      'home.switchToDark': '切换深色',
      'home.tags.subscriptionToApi': '订阅转 API',
      'home.tags.stickySession': '会话保持',
      'home.tags.realtimeBilling': '按量计费',
      'home.features.unifiedGateway': '统一网关',
      'home.features.unifiedGatewayDesc': '统一管理 AI 订阅 API。',
      'home.features.multiAccount': '账号池',
      'home.features.multiAccountDesc': '多账号统一调度。',
      'home.features.balanceQuota': '额度计费',
      'home.features.balanceQuotaDesc': '清晰统计消耗。',
      'home.providers.title': '已支持的 AI 模型',
      'home.providers.description': '支持多个主流提供商。',
      'home.providers.claude': 'Claude',
      'home.providers.gemini': 'Gemini',
      'home.providers.antigravity': 'Antigravity',
      'home.providers.more': '更多',
      'home.providers.supported': '已支持',
      'home.providers.soon': '即将支持',
      'home.footer.allRightsReserved': 'All rights reserved.',
      'home.docs': '文档',
    }[key] ?? key),
  }),
}))

vi.mock('@/stores', () => ({
  useAuthStore: () => authStore,
  useAppStore: () => appStore,
}))

vi.mock('@/components/common/LocaleSwitcher.vue', () => ({
  default: { name: 'LocaleSwitcher', template: '<div />' },
}))

vi.mock('@/components/home/HomeModelSquarePreview.vue', () => ({
  default: { name: 'HomeModelSquarePreview', template: '<section data-test="home-model-square-preview" />' },
}))

vi.mock('@/components/icons/Icon.vue', () => ({
  default: { name: 'Icon', template: '<span />' },
}))

describe('HomeView model square placement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('uses the designed globe hero and keeps the model pricing preview below the hero', async () => {
    const { default: HomeView } = await import('../HomeView.vue')
    const wrapper = mount(HomeView, {
      global: {
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        },
      },
    })

    expect(wrapper.find('[data-test="home-discount-comparison"]').exists()).toBe(false)
    expect(wrapper.get('[data-test="home-hero-section"]').classes()).toEqual(
      expect.arrayContaining(['w-screen', 'left-1/2', '-translate-x-1/2', 'min-h-screen']),
    )
    expect(wrapper.get('[data-test="home-ai-orbit-visual"]').classes()).toContain('top-[10%]')
    expect(wrapper.get('[data-test="home-hero-copy"]').classes()).toEqual(
      expect.arrayContaining(['min-h-screen', 'pb-12', 'pt-40']),
    )
    expect(wrapper.get('[data-test="home-hero-text"]').classes()).toEqual(
      expect.arrayContaining(['lg:-translate-x-10', 'xl:-translate-x-16']),
    )
    expect(wrapper.get('[data-test="home-model-square-section"]').classes()).toEqual(
      expect.arrayContaining(['mt-20', 'px-6']),
    )
    expect(wrapper.find('[data-test="home-model-square-preview"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="home-feature-tags"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="home-feature-cards"]').exists()).toBe(false)
    expect(wrapper.get('[data-test="home-hero-section"]').element.compareDocumentPosition(
      wrapper.find('[data-test="home-model-square-preview"]').element,
    )).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(wrapper.text()).toContain('聚合全球顶尖模型')
    expect(wrapper.text()).toContain('一个 API 连接未来')
    expect(wrapper.text()).toContain('专为开发者打造企业级 AI 接口平台。无缝接入 OpenAI、Anthropic、Google 等前沿大模型，稳定调度、价格透明、按量计费。')
    expect(wrapper.text()).not.toContain('Sub2API 专为开发者打造企业级 AI 接口中转站')
    expect(wrapper.text()).not.toContain('已支持超过 100+ 主流大语言模型')
    expect(wrapper.text()).not.toContain('GPT-4o')
    expect(wrapper.text()).not.toContain('已支持的 AI 模型')
    expect(wrapper.text()).not.toContain('integration.ts')
  })
})

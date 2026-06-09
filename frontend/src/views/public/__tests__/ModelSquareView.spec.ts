import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const catalog = vi.hoisted(() => ({
  currency_rate: 7,
  unit: 'million_tokens',
  groups: [
    {
      id: 10,
      name: 'Codex Plus',
      platform: 'openai',
      subscription_type: 'standard',
      rate_multiplier: 0.3,
      is_exclusive: false,
    },
  ],
  models: [
    {
      name: 'gpt-5.1-codex',
      platform: 'openai',
      channel_name: 'OpenAI Official',
      group: {
        id: 10,
        name: 'Codex Plus',
        platform: 'openai',
        subscription_type: 'standard',
        rate_multiplier: 0.3,
        is_exclusive: false,
      },
      billing_mode: 'token',
      official: {
        input_per_million_usd: 1,
        output_per_million_usd: 8,
        input_per_million_cny: 7,
        output_per_million_cny: 56,
      },
      site: {
        input_per_million_cny: 2.1,
        output_per_million_cny: 16.8,
      },
      discount: 3,
      pricing: null,
    },
  ],
}))

vi.mock('@/api/modelSquare', () => ({
  getModelSquareCatalog: vi.fn(() => Promise.resolve(catalog)),
}))

vi.mock('@/components/layout/AppLayout.vue', () => ({
  default: {
    name: 'AppLayout',
    template: '<div data-test="app-layout"><slot /></div>',
  },
}))

describe('ModelSquareView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses app layout without showing discount copy or channel names', async () => {
    const { default: ModelSquareView } = await import('../ModelSquareView.vue')
    const wrapper = mount(ModelSquareView)

    await flushPromises()

    expect(wrapper.find('[data-test="app-layout"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('先享 1.43 折，再叠加渠道倍率算最终折扣')
    expect(wrapper.find('input[type="search"]').attributes('placeholder')).toBe('搜索模型、分组')
    expect(wrapper.text()).toContain('gpt-5.1-codex')
    expect(wrapper.text()).toContain('Codex Plus')
    expect(wrapper.text()).toContain('0.3x')
    expect(wrapper.text()).toContain('3折')
    expect(wrapper.text()).not.toContain('OpenAI Official')
  })

  it('filters by model and group only, not by channel name', async () => {
    const { default: ModelSquareView } = await import('../ModelSquareView.vue')
    const wrapper = mount(ModelSquareView)

    await flushPromises()

    await wrapper.find('input[type="search"]').setValue('OpenAI Official')
    expect(wrapper.text()).toContain('暂无匹配模型')
    expect(wrapper.text()).not.toContain('gpt-5.1-codex')

    await wrapper.find('input[type="search"]').setValue('Codex Plus')
    expect(wrapper.text()).toContain('gpt-5.1-codex')

    await wrapper.find('input[type="search"]').setValue('gpt-5.1')
    expect(wrapper.text()).toContain('Codex Plus')
  })
})

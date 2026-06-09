import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const catalog = vi.hoisted(() => ({
  currency_rate: 7,
  unit: 'million_tokens',
  groups: [],
  models: [
    {
      name: 'gpt-5.2',
      platform: 'openai',
      channel_name: 'OpenAI Official',
      group: {
        id: 10,
        name: 'codex plus',
        platform: 'openai',
        subscription_type: 'standard',
        rate_multiplier: 0.3,
        is_exclusive: false,
      },
      billing_mode: 'token',
      official: {
        input_per_million_usd: 1.75,
        output_per_million_usd: 14,
        input_per_million_cny: 12.25,
        output_per_million_cny: 98,
      },
      site: {
        input_per_million_cny: 3.67,
        output_per_million_cny: 29.4,
      },
      discount: 3,
      pricing: null,
    },
  ],
}))

vi.mock('@/api/modelSquare', () => ({
  getModelSquareCatalog: vi.fn(() => Promise.resolve(catalog)),
}))

describe('HomeModelSquarePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses a fixed two-column preview grid and keeps model identity on one line', async () => {
    const { default: HomeModelSquarePreview } = await import('../HomeModelSquarePreview.vue')
    const wrapper = mount(HomeModelSquarePreview, {
      global: {
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        },
      },
    })

    await flushPromises()

    expect(wrapper.get('[data-test="model-square-preview-grid"]').classes()).toContain('grid-cols-2')
    expect(wrapper.get('[data-test="model-square-preview-name"]').classes()).toEqual(
      expect.arrayContaining(['truncate', 'whitespace-nowrap']),
    )
    expect(wrapper.get('[data-test="model-square-preview-group"]').classes()).toEqual(
      expect.arrayContaining(['truncate', 'whitespace-nowrap']),
    )
    expect(wrapper.text()).toContain('官方折合输入')
    expect(wrapper.text()).toContain('官方折合输出')
    expect(wrapper.text()).toContain('本站输入价')
    expect(wrapper.text()).toContain('本站输出价')
    expect(wrapper.text()).toContain('¥12.25')
    expect(wrapper.text()).toContain('¥98')
    expect(wrapper.findAll('.line-through')).toHaveLength(0)
    expect(
      wrapper
        .get('[data-test="model-square-preview-official-input-labels"]')
        .findAll('span')
        .map((span) => span.text()),
    ).toEqual(['官方美元价', '官方折合输入'])
    expect(wrapper.get('[data-test="model-square-preview-input-card"]').classes()).toEqual(
      expect.arrayContaining(['w-full', 'max-w-[220px]']),
    )
    expect(wrapper.get('[data-test="model-square-preview-output-card"]').classes()).toEqual(
      expect.arrayContaining(['w-full', 'max-w-[220px]']),
    )
    expect(wrapper.get('[data-test="model-square-preview-official-input-labels"]').classes()).toEqual(
      expect.arrayContaining(['text-[#1E4ED8]', 'text-[11px]']),
    )
    expect(
      wrapper
        .get('[data-test="model-square-preview-official-input-values"]')
        .findAll('span')
        .map((span) => span.text()),
    ).toEqual(['$1.75', '¥12.25'])
    expect(wrapper.get('[data-test="model-square-preview-official-input-values"]').classes()).toContain(
      'text-[#1E4ED8]',
    )
    expect(
      wrapper
        .get('[data-test="model-square-preview-official-output-labels"]')
        .findAll('span')
        .map((span) => span.text()),
    ).toEqual(['官方美元价', '官方折合输出'])
    expect(wrapper.get('[data-test="model-square-preview-official-output-labels"]').classes()).toEqual(
      expect.arrayContaining(['text-[#1E4ED8]', 'text-[11px]']),
    )
    expect(
      wrapper
        .get('[data-test="model-square-preview-official-output-values"]')
        .findAll('span')
        .map((span) => span.text()),
    ).toEqual(['$14', '¥98'])
    expect(wrapper.get('[data-test="model-square-preview-official-output-values"]').classes()).toContain(
      'text-[#1E4ED8]',
    )
    expect(wrapper.get('[data-test="model-square-preview-site-input-label"]').classes()).toContain(
      'text-[#6843ED]',
    )
    expect(wrapper.get('[data-test="model-square-preview-site-input-price"]').classes()).toContain(
      'text-[#6843ED]',
    )
    expect(wrapper.get('[data-test="model-square-preview-site-input-price"]').classes()).toEqual(
      expect.arrayContaining(['mx-auto', 'w-2/3']),
    )
    expect(wrapper.get('[data-test="model-square-preview-site-output-label"]').classes()).toContain(
      'text-[#6843ED]',
    )
    expect(wrapper.get('[data-test="model-square-preview-site-output-price"]').classes()).toContain(
      'text-[#6843ED]',
    )
    expect(wrapper.get('[data-test="model-square-preview-site-output-price"]').classes()).toEqual(
      expect.arrayContaining(['mx-auto', 'w-2/3']),
    )
    expect(wrapper.get('[data-test="model-square-preview-discount"]').text()).toContain('0.3x')
    expect(wrapper.get('[data-test="model-square-preview-discount"]').text()).toContain('3折')
  })
})

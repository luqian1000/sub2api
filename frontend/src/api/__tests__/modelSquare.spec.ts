import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/i18n', () => ({
  getLocale: () => 'zh-CN',
}))

describe('model square api', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads the public model square catalog from /model-square', async () => {
    const { apiClient } = await import('@/api/client')
    const adapter = vi.fn().mockResolvedValue({
      status: 200,
      data: { code: 0, data: { groups: [], models: [], currency_rate: 7, unit: 'million_tokens' } },
      headers: {},
      config: {},
      statusText: 'OK',
    })
    apiClient.defaults.adapter = adapter

    const { getModelSquareCatalog } = await import('@/api/modelSquare')
    const catalog = await getModelSquareCatalog()

    expect(adapter).toHaveBeenCalledTimes(1)
    expect(adapter.mock.calls[0][0].url).toBe('/model-square')
    expect(catalog.currency_rate).toBe(7)
    expect(catalog.models).toEqual([])
  })
})

import { apiClient } from './client'

export interface ModelSquareGroup {
  id: number
  name: string
  platform: string
  subscription_type: string
  rate_multiplier: number
  is_exclusive: boolean
}

export interface ModelSquareOfficialPrice {
  input_per_million_usd: number
  output_per_million_usd: number
  input_per_million_cny: number
  output_per_million_cny: number
}

export interface ModelSquareSitePrice {
  input_per_million_cny: number
  output_per_million_cny: number
}

export interface ModelSquarePricingInterval {
  min_tokens: number
  max_tokens: number | null
  tier_label?: string
  input_price: number | null
  output_price: number | null
  cache_write_price: number | null
  cache_read_price: number | null
  per_request_price: number | null
}

export interface ModelSquarePricing {
  billing_mode: string
  input_price: number | null
  output_price: number | null
  cache_write_price: number | null
  cache_read_price: number | null
  image_output_price: number | null
  per_request_price: number | null
  intervals: ModelSquarePricingInterval[]
}

export interface ModelSquareModel {
  name: string
  tier_label?: string
  platform: string
  channel_name: string
  group: ModelSquareGroup
  billing_mode: string
  official: ModelSquareOfficialPrice
  site: ModelSquareSitePrice
  discount: number
  pricing: ModelSquarePricing | null
}

export interface ModelSquareCatalog {
  currency_rate: number
  unit: string
  groups: ModelSquareGroup[]
  models: ModelSquareModel[]
}

export async function getModelSquareCatalog(options?: { signal?: AbortSignal }): Promise<ModelSquareCatalog> {
  const { data } = await apiClient.get<ModelSquareCatalog>('/model-square', {
    signal: options?.signal,
  })
  return data
}

export default { getModelSquareCatalog }

package service

import (
	"context"
	"fmt"
	"sort"
	"strings"
)

// AvailableGroupRef 渠道视图中关联分组的简要信息。
//
// 用户侧「可用渠道」页面据此展示：专属分组 vs 公开分组（IsExclusive）、
// 订阅 vs 标准（SubscriptionType）、默认倍率（RateMultiplier）。用户专属倍率
// 不在这里暴露，前端自己通过 /groups/rates 拉取，和 API 密钥页面保持一致。
type AvailableGroupRef struct {
	ID               int64
	Name             string
	Platform         string
	SubscriptionType string
	RateMultiplier   float64
	IsExclusive      bool
}

// AvailableChannel 可用渠道视图：用于「可用渠道」页面展示渠道基础信息 +
// 关联的分组 + 推导出的支持模型列表（无通配符）。
type AvailableChannel struct {
	ID                 int64
	Name               string
	Description        string
	Status             string
	BillingModelSource string
	RestrictModels     bool
	Groups             []AvailableGroupRef
	SupportedModels    []SupportedModel
}

const (
	modelSquareUSDToCNY         = 7
	modelSquareTokensPerMillion = 1_000_000
)

// ModelSquareGroup 模型广场公开展示的分组信息。
type ModelSquareGroup struct {
	ID               int64   `json:"id"`
	Name             string  `json:"name"`
	Platform         string  `json:"platform"`
	SubscriptionType string  `json:"subscription_type"`
	RateMultiplier   float64 `json:"rate_multiplier"`
	IsExclusive      bool    `json:"is_exclusive"`
}

// ModelSquarePriceSummary 模型广场展示用价格摘要。
type ModelSquarePriceSummary struct {
	InputPerMillionUSD  float64 `json:"input_per_million_usd"`
	OutputPerMillionUSD float64 `json:"output_per_million_usd"`
	InputPerMillionCNY  float64 `json:"input_per_million_cny"`
	OutputPerMillionCNY float64 `json:"output_per_million_cny"`
}

// ModelSquareSitePriceSummary 模型广场展示用本站价格摘要。
type ModelSquareSitePriceSummary struct {
	InputPerMillionCNY  float64 `json:"input_per_million_cny"`
	OutputPerMillionCNY float64 `json:"output_per_million_cny"`
}

// ModelSquareModel 模型广场公开展示的一行模型定价。
type ModelSquareModel struct {
	Name        string                      `json:"name"`
	TierLabel   string                      `json:"tier_label,omitempty"`
	Platform    string                      `json:"platform"`
	ChannelID   int64                       `json:"channel_id"`
	ChannelName string                      `json:"channel_name"`
	Group       ModelSquareGroup            `json:"group"`
	BillingMode string                      `json:"billing_mode"`
	Official    ModelSquarePriceSummary     `json:"official"`
	Site        ModelSquareSitePriceSummary `json:"site"`
	Discount    float64                     `json:"discount"`
	Pricing     *ChannelModelPricing        `json:"pricing"`
}

// ModelSquareCatalog 模型广场公开响应。
type ModelSquareCatalog struct {
	CurrencyRate float64            `json:"currency_rate"`
	Unit         string             `json:"unit"`
	Groups       []ModelSquareGroup `json:"groups"`
	Models       []ModelSquareModel `json:"models"`
}

// ListAvailable 返回所有渠道的可用视图：每个渠道附带关联分组信息与支持模型列表。
//
// 支持模型通过 (*Channel).SupportedModels() 计算（mapping ∪ pricing 并联）。
// 对于渠道未配置定价的模型，进一步用 PricingService 的全局 LiteLLM 数据合成
// 一份展示用定价，让用户看到默认价格而非"未配置"。
//
// 关联分组信息通过 groupRepo.ListActive 查询后按 ID 映射；渠道 GroupIDs 中未在活跃列表中
// 的分组（已停用或删除）会被忽略。
//
// 前置条件：s.groupRepo 必须非 nil（由 wire DI 保证）。直接 nil-deref 用于 fail-fast，
// 避免静默掩盖注入缺失。
func (s *ChannelService) ListAvailable(ctx context.Context) ([]AvailableChannel, error) {
	channels, err := s.repo.ListAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("list channels: %w", err)
	}

	groups, err := s.groupRepo.ListActive(ctx)
	if err != nil {
		return nil, fmt.Errorf("list active groups: %w", err)
	}
	groupByID := make(map[int64]AvailableGroupRef, len(groups))
	for i := range groups {
		g := groups[i]
		groupByID[g.ID] = AvailableGroupRef{
			ID:               g.ID,
			Name:             g.Name,
			Platform:         g.Platform,
			SubscriptionType: g.SubscriptionType,
			RateMultiplier:   g.RateMultiplier,
			IsExclusive:      g.IsExclusive,
		}
	}

	out := make([]AvailableChannel, 0, len(channels))
	for i := range channels {
		ch := &channels[i]
		groups := make([]AvailableGroupRef, 0, len(ch.GroupIDs))
		for _, gid := range ch.GroupIDs {
			if ref, ok := groupByID[gid]; ok {
				groups = append(groups, ref)
			}
		}
		sort.SliceStable(groups, func(i, j int) bool { return groups[i].Name < groups[j].Name })

		ch.normalizeBillingModelSource()

		supported := ch.SupportedModels()
		s.fillGlobalPricingFallback(supported)

		out = append(out, AvailableChannel{
			ID:                 ch.ID,
			Name:               ch.Name,
			Description:        ch.Description,
			Status:             ch.Status,
			BillingModelSource: ch.BillingModelSource,
			RestrictModels:     ch.RestrictModels,
			Groups:             groups,
			SupportedModels:    supported,
		})
	}

	sort.SliceStable(out, func(i, j int) bool {
		return strings.ToLower(out[i].Name) < strings.ToLower(out[j].Name)
	})
	return out, nil
}

// ListModelSquare 返回未登录用户可见的模型广场数据。
//
// 数据来源与用户侧可用渠道一致，但不按具体用户权限过滤：
//   - 仅展示启用渠道；
//   - 仅展示启用分组；
//   - 模型按「分组 + 模型」展开，分组倍率用于计算本站价和折扣；
//   - 定价缺失时仍保留模型行，但价格摘要为 0，前端可显示为「待配置」。
func (s *ChannelService) ListModelSquare(ctx context.Context) (*ModelSquareCatalog, error) {
	channels, err := s.ListAvailable(ctx)
	if err != nil {
		return nil, err
	}

	groupsByID := make(map[int64]ModelSquareGroup)
	models := make([]ModelSquareModel, 0)

	for _, ch := range channels {
		if ch.Status != StatusActive {
			continue
		}
		for _, g := range ch.Groups {
			if g.Platform == "" {
				continue
			}
			group := ModelSquareGroup{
				ID:               g.ID,
				Name:             g.Name,
				Platform:         g.Platform,
				SubscriptionType: g.SubscriptionType,
				RateMultiplier:   g.RateMultiplier,
				IsExclusive:      g.IsExclusive,
			}
			for _, model := range ch.SupportedModels {
				if model.Platform != g.Platform {
					continue
				}
				groupsByID[group.ID] = group
				models = append(models, buildModelSquareRows(ch, group, model)...)
			}
		}
	}

	groups := make([]ModelSquareGroup, 0, len(groupsByID))
	for _, g := range groupsByID {
		groups = append(groups, g)
	}
	sort.SliceStable(groups, func(i, j int) bool {
		if groups[i].Platform != groups[j].Platform {
			return groups[i].Platform < groups[j].Platform
		}
		return strings.ToLower(groups[i].Name) < strings.ToLower(groups[j].Name)
	})

	sort.SliceStable(models, func(i, j int) bool {
		if models[i].Group.Name != models[j].Group.Name {
			return strings.ToLower(models[i].Group.Name) < strings.ToLower(models[j].Group.Name)
		}
		if models[i].Platform != models[j].Platform {
			return models[i].Platform < models[j].Platform
		}
		return strings.ToLower(models[i].Name) < strings.ToLower(models[j].Name)
	})

	return &ModelSquareCatalog{
		CurrencyRate: modelSquareUSDToCNY,
		Unit:         "million_tokens",
		Groups:       groups,
		Models:       models,
	}, nil
}

func buildModelSquareRows(ch AvailableChannel, group ModelSquareGroup, model SupportedModel) []ModelSquareModel {
	if model.Pricing != nil && len(model.Pricing.Intervals) > 0 {
		rows := make([]ModelSquareModel, 0, len(model.Pricing.Intervals))
		for _, interval := range model.Pricing.Intervals {
			official := buildModelSquareIntervalOfficialPrice(model.Pricing, interval)
			rows = append(rows, buildModelSquareRow(ch, group, model, interval.TierLabel, official))
		}
		return rows
	}
	return []ModelSquareModel{buildModelSquareRow(ch, group, model, "", buildModelSquareOfficialPrice(model.Pricing))}
}

func buildModelSquareRow(
	ch AvailableChannel,
	group ModelSquareGroup,
	model SupportedModel,
	tierLabel string,
	official ModelSquarePriceSummary,
) ModelSquareModel {
	return ModelSquareModel{
		Name:        model.Name,
		TierLabel:   tierLabel,
		Platform:    model.Platform,
		ChannelID:   ch.ID,
		ChannelName: ch.Name,
		Group:       group,
		BillingMode: modelSquareBillingMode(model.Pricing),
		Official:    official,
		Site: ModelSquareSitePriceSummary{
			InputPerMillionCNY:  official.InputPerMillionCNY * group.RateMultiplier,
			OutputPerMillionCNY: official.OutputPerMillionCNY * group.RateMultiplier,
		},
		Discount: group.RateMultiplier * 10,
		Pricing:  model.Pricing,
	}
}

func buildModelSquareOfficialPrice(pricing *ChannelModelPricing) ModelSquarePriceSummary {
	if pricing == nil {
		return ModelSquarePriceSummary{}
	}
	inputUSD := pricePerMillion(pricing.InputPrice)
	outputUSD := pricePerMillion(pricing.OutputPrice)
	return ModelSquarePriceSummary{
		InputPerMillionUSD:  inputUSD,
		OutputPerMillionUSD: outputUSD,
		InputPerMillionCNY:  inputUSD * modelSquareUSDToCNY,
		OutputPerMillionCNY: outputUSD * modelSquareUSDToCNY,
	}
}

func buildModelSquareIntervalOfficialPrice(pricing *ChannelModelPricing, interval PricingInterval) ModelSquarePriceSummary {
	if pricing == nil {
		return ModelSquarePriceSummary{}
	}
	if pricing.BillingMode == BillingModeImage || pricing.BillingMode == BillingModePerRequest {
		requestUSD := priceValue(interval.PerRequestPrice)
		return ModelSquarePriceSummary{
			InputPerMillionUSD:  requestUSD,
			OutputPerMillionUSD: requestUSD,
			InputPerMillionCNY:  requestUSD * modelSquareUSDToCNY,
			OutputPerMillionCNY: requestUSD * modelSquareUSDToCNY,
		}
	}
	inputUSD := pricePerMillion(interval.InputPrice)
	outputUSD := pricePerMillion(interval.OutputPrice)
	return ModelSquarePriceSummary{
		InputPerMillionUSD:  inputUSD,
		OutputPerMillionUSD: outputUSD,
		InputPerMillionCNY:  inputUSD * modelSquareUSDToCNY,
		OutputPerMillionCNY: outputUSD * modelSquareUSDToCNY,
	}
}

func priceValue(price *float64) float64 {
	if price == nil {
		return 0
	}
	return *price
}

func pricePerMillion(price *float64) float64 {
	if price == nil {
		return 0
	}
	return *price * modelSquareTokensPerMillion
}

func modelSquareBillingMode(pricing *ChannelModelPricing) string {
	if pricing == nil || pricing.BillingMode == "" {
		return string(BillingModeToken)
	}
	return string(pricing.BillingMode)
}

// fillGlobalPricingFallback 对未命中渠道定价的支持模型，从全局 LiteLLM 数据合成一份
// 展示用定价。仅用于「可用渠道」展示，不影响真实计费链路。
//
// 触发条件：
//  1. Pricing == nil（渠道完全没声明该模型的定价条目）
//  2. Pricing 非 nil 但所有价格字段为空（admin UI 建了条目但没填价格）
//
// 当 s.pricingService 为 nil（测试场景），跳过回落。
func (s *ChannelService) fillGlobalPricingFallback(models []SupportedModel) {
	if s.pricingService == nil {
		return
	}
	for i := range models {
		if !pricingNeedsFallback(models[i].Pricing) {
			continue
		}
		lp := s.pricingService.GetModelPricing(models[i].Name)
		if lp == nil {
			continue
		}
		models[i].Pricing = synthesizePricingFromLiteLLM(lp, models[i].Pricing)
	}
}

// pricingNeedsFallback 判定一个 ChannelModelPricing 是否需要走全局回落。
// 价格全部缺失（无 flat 字段且无任何带价 interval）即视为未配置。
func pricingNeedsFallback(p *ChannelModelPricing) bool {
	if p == nil {
		return true
	}
	if p.InputPrice != nil || p.OutputPrice != nil ||
		p.CacheWritePrice != nil || p.CacheReadPrice != nil ||
		p.ImageOutputPrice != nil || p.PerRequestPrice != nil {
		return false
	}
	for _, iv := range p.Intervals {
		if iv.InputPrice != nil || iv.OutputPrice != nil ||
			iv.CacheWritePrice != nil || iv.CacheReadPrice != nil ||
			iv.PerRequestPrice != nil {
			return false
		}
	}
	return true
}

// synthesizePricingFromLiteLLM 把 LiteLLM 的定价数据转成 ChannelModelPricing 形态，
// 仅用于展示。
//
// 计费模式优先级：
//  1. 渠道已选 BillingMode（admin 在 UI 里选了 image / per_request 但没填价的场景，
//     按选定模式合成对应字段）
//  2. LiteLLM mode="image_generation" → image
//  3. 默认 token
//
// LiteLLM 中字段 0 视为未配置，不带入展示。
func synthesizePricingFromLiteLLM(lp *LiteLLMModelPricing, existing *ChannelModelPricing) *ChannelModelPricing {
	if lp == nil {
		return existing
	}

	mode := BillingModeToken
	switch {
	case existing != nil && existing.BillingMode != "":
		mode = existing.BillingMode
	case lp.Mode == "image_generation":
		mode = BillingModeImage
	}

	if mode == BillingModeImage || mode == BillingModePerRequest {
		return &ChannelModelPricing{
			BillingMode:      mode,
			PerRequestPrice:  nonZeroPtr(lp.OutputCostPerImage),
			ImageOutputPrice: nonZeroPtr(lp.OutputCostPerImageToken),
			InputPrice:       nonZeroPtr(lp.InputCostPerToken),
			OutputPrice:      nonZeroPtr(lp.OutputCostPerToken),
		}
	}
	return &ChannelModelPricing{
		BillingMode:      mode,
		InputPrice:       nonZeroPtr(lp.InputCostPerToken),
		OutputPrice:      nonZeroPtr(lp.OutputCostPerToken),
		CacheWritePrice:  nonZeroPtr(lp.CacheCreationInputTokenCost),
		CacheReadPrice:   nonZeroPtr(lp.CacheReadInputTokenCost),
		ImageOutputPrice: nonZeroPtr(lp.OutputCostPerImageToken),
	}
}

func nonZeroPtr(v float64) *float64 {
	if v == 0 {
		return nil
	}
	return &v
}

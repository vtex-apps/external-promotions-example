import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

export interface ExternalPromotionsProviderRequest {
  items: Item[]
}

interface Item {
  sku: string
  price: number
}

export interface ExternalPromotionsProviderResponse {
  promotions: Promotion[]
}

interface Promotion {
  identifier: string
  effect:     PromotionEffect
  scope:      PromotionScope[]
}

interface PromotionEffect {
  type:     string
  settings: PromotionEffectSettings
}

interface PromotionEffectSettings {
  value:     number
  applyMode: PromotionEffectSettingsApplyMode
}

enum PromotionEffectSettingsApplyMode {
  onEachItem = "OnEachItem",
  sharedAmongItems = "SharedAmongItems"
}

interface PromotionScope {
  skuId:    string
  quantity: number
}

export class Provider extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`http://${context.workspace}--${context.account}.myvtex.com`, context, options)
  }

  public async calculateExternalPromotions(data: ExternalPromotionsProviderRequest) {
    return this.http.post<ExternalPromotionsProviderResponse>('/_v/promotions/calculate', data, {
      metric: 'calculate-promotions-external-provider',
    })
  }
}

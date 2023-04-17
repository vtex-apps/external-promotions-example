import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

import { Error, ErrorType } from '../utils/errors'
import { Result } from '../utils/result'

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

  public async calculateExternalPromotions(data: ExternalPromotionsProviderRequest): Promise<Result<ExternalPromotionsProviderResponse, Error>> {
    return this.http.post<ExternalPromotionsProviderResponse>('/_v/promotions/calculate', data, {
      metric: 'calculate-promotions-external-provider',
    })
    .then(response => Result.ok<any, Error>(response))
    .catch(error => Result.err<any, Error>(new Error(ErrorType.UnexpectedError, "an unexpected error occurred while calling the external provider to calculate promotions", error)))
  }
}

import type { InstanceOptions, IOContext } from '@vtex/api'
import { AppClient } from '@vtex/api'

export interface VTEXExternalPromotionsDataContract {
  items: Item[]
  sessionId: string
  externalPromotions: ExternalPromotion[]
}

interface Item {
  id: string
  quantity: number
  seller: string
}

interface ExternalPromotion {
  version: DataContractVersion
  exp: number
  type: DataContractType
  cartHash?: string
  promotions: Promotion[]
}

export const enum DataContractVersion {
  v1 = 'v1',
}

export const enum DataContractType {
  cart = 'cart',
  page = 'page',
}

export interface Promotion {
  identifier: string
  effect: PromotionEffect
  scope: PromotionScope[]
}

interface PromotionEffect {
  type: string
  settings: PromotionEffectSettings
}

interface PromotionEffectSettings {
  value: number
  applyMode: PromotionEffectSettingsApplyMode
}

const enum PromotionEffectSettingsApplyMode {
  onEachItem = 'OnEachItem',
  sharedAmongItems = 'SharedAmongItems',
}

interface PromotionScope {
  skuId: string
  quantity: number
}

export type ApplyPromotionsResponse = Record<string, unknown>

export class VTEXExternalPromotionsApp extends AppClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('vtex.external-promotions-middleware@0.x', context, options)
  }

  public applyExternalPromotions(data: VTEXExternalPromotionsDataContract) {
    // this may change when we implment the app on VTEX's side
    return this.http.post<ApplyPromotionsResponse>(
      '/_v/promotions/external/apply/page',
      data,
      {
        metric: 'apply-external-promotions',
      }
    )
  }
}

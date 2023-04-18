import { AppClient, InstanceOptions, IOContext } from '@vtex/api'

export interface VTEXExternalPromotionsDataContract {
  version: DataContractVersion
  exp: number
  type: DataContractType
  sessionId: string
  cartHash?: string
  promotions: Promotion[]
}

export enum DataContractVersion {
  v1 = "v1"
}

export enum DataContractType {
  cart = "cart",
  page = "page",
}

interface Promotion {
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

enum PromotionEffectSettingsApplyMode {
  onEachItem = "OnEachItem",
  sharedAmongItems = "SharedAmongItems",
}

interface PromotionScope {
  skuId: string
  quantity: number
}

export class VTEXExternalPromotionsApp extends AppClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    // this will change when we implement the app on VTEX's side
    super('vtex.external-promotions-app@0.x', context, options)
  }

  public applyExternalPromotions(data: VTEXExternalPromotionsDataContract): Promise<any> {
    // this may change when we implment the app on VTEX's side
    return this.http.post<any>('/_v/promotions/external/apply', data, {
      metric: 'apply-external-promotions',
    })
  }
}

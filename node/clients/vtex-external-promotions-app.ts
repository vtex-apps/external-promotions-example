import { AppClient, InstanceOptions, IOContext } from '@vtex/api'

import { Error, ErrorType } from '../utils/errors'
import { Result } from '../utils/result'

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

  public async applyExternalPromotions(data: VTEXExternalPromotionsDataContract): Promise<Result<any, Error>> {
    // this may change when we implment the app on VTEX's side
    return this.http.post<any>('/_v/promotions/external/apply', data, {
      metric: 'apply-external-promotions',
    })
      .then(response => Result.ok<any, Error>(response))
      .catch(error => Result.err<any, Error>(new Error(ErrorType.UnexpectedError, "an unexpected error occurred while applying external promotions", error)))
  }
}

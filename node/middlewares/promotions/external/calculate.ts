import { json } from 'co-body'

import { ExternalPromotionsProviderRequest, ExternalPromotionsProviderResponse } from "../../../clients/provider";

interface CalculateExternalPromotionsRequest {
  items: Item[]
}

interface Item {
  id: string
  sellingPrice: number
}

export async function calculate(ctx: Context, next: () => Promise<any>) {
  const body: CalculateExternalPromotionsRequest = await json(ctx.req)

  const {
    clients: { provider },
  } = ctx

  const data: ExternalPromotionsProviderRequest = {
    items: body.items.map(item => ({
      sku: item.id,
      price: item.sellingPrice,
    }))
  }

  console.log(JSON.stringify(data, null, 2))

  const response = await provider.calculateExternalPromotions(data)

  ctx.status = 200
  ctx.body = transformToVTEXExternalPromotionsDataContract(response)

  await next()
}

interface VTEXExternalPromotionsDataContract {
  version: DataContractVersion
  exp: number
  type: DataContractType
  intendedUser: string
  cartHash: string
  promotions: Promotion[]
}

enum DataContractVersion {
  v1 = "v1"
}

enum DataContractType {
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


function transformToVTEXExternalPromotionsDataContract(externalPromotions: ExternalPromotionsProviderResponse): VTEXExternalPromotionsDataContract {
  const now = new Date()
  return {
    version: DataContractVersion.v1,
    type: DataContractType.page,
    exp: now.setHours(now.getHours() + 1), // this should be the unix time when the promotion becomes invalid
    cartHash: "cart_hash",
    intendedUser: "intended_user",
    promotions: externalPromotions.promotions,
  }
}

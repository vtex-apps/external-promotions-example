import { json } from 'co-body'

import { ExternalPromotionsProviderRequest, ExternalPromotionsProviderResponse } from "../../../clients/provider";
import { DataContractType, DataContractVersion, VTEXExternalPromotionsDataContract } from '../../../clients/vtex-external-promotions-app';

interface CalculateExternalPromotionsRequest {
  sessionId: string
  promotionalContext: PromotionalContext
}

interface PromotionalContext {
  items: Item[]
}

interface Item {
  id: string
  sellingPrice: number
}

export async function calculate(ctx: Context, next: () => Promise<any>) {
  const { sessionId, promotionalContext }: CalculateExternalPromotionsRequest = await json(ctx.req)

  const {
    clients: { provider, vtexExternalPromotionsApp },
  } = ctx

  const data: ExternalPromotionsProviderRequest = {
    items: promotionalContext.items.map(item => ({
      sku: item.id,
      price: item.sellingPrice,
    }))
  }

  const externalPromotionsData = await provider.calculateExternalPromotions(data)

  const response = await vtexExternalPromotionsApp.applyExternalPromotions(transformToVTEXExternalPromotionsDataContract(externalPromotionsData, sessionId))

  // this may change when we implment the app on VTEX's side
  ctx.status = 200
  ctx.body = response

  await next()
}

function transformToVTEXExternalPromotionsDataContract(externalPromotions: ExternalPromotionsProviderResponse, sessionId: string): VTEXExternalPromotionsDataContract {
  const now = new Date()
  return {
    version: DataContractVersion.v1,
    type: DataContractType.page,
    exp: now.setHours(now.getHours() + 1), // this should be the unix time when the promotion becomes invalid,
    sessionId: sessionId,
    promotions: externalPromotions.promotions,
  }
}

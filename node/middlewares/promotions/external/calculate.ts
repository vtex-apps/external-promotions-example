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

  const externalPromotionsDataResult = await provider.calculateExternalPromotions(data)
  if (externalPromotionsDataResult.isErr) {
    console.error(externalPromotionsDataResult.error.message, { data, error: externalPromotionsDataResult.error })
    ctx.status = 500
    ctx.body = externalPromotionsDataResult.error.message
    return await next()
  }

  const applyExternalPromotionsResult = await vtexExternalPromotionsApp.applyExternalPromotions(transformToVTEXExternalPromotionsDataContract(externalPromotionsDataResult.value, sessionId))
  if (applyExternalPromotionsResult.isErr) {
    console.error(applyExternalPromotionsResult.error.message, { data, error: applyExternalPromotionsResult.error })
    ctx.status = 500
    ctx.body = applyExternalPromotionsResult.error.message
    return await next()
  }

  // this may change when we implment the app on VTEX's side
  ctx.status = 200
  ctx.body = applyExternalPromotionsResult.value

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

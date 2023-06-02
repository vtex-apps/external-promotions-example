import { json } from 'co-body'

import type {
  ExternalPromotionsProviderRequest,
  ExternalPromotionsProviderResponse,
} from '../../../clients/provider'
import type {
  ApplyPromotionsResponse,
  VTEXExternalPromotionsDataContract,
} from '../../../clients/vtex-external-promotions-app'
import {
  DataContractType,
  DataContractVersion,
} from '../../../clients/vtex-external-promotions-app'

interface CalculateExternalPromotionsRequest {
  sessionId: string
  promotionalContext: PromotionalContext
}

interface PromotionalContext {
  items: Item[]
}

interface Item {
  id: string
  quantity: number
  seller: string
  sellingPrice: number
}

export async function calculate(
  ctx: Context,
  next: () => Promise<ApplyPromotionsResponse>
) {
  const {
    sessionId,
    promotionalContext,
  }: CalculateExternalPromotionsRequest = await json(ctx.req)

  const {
    clients: { provider, vtexExternalPromotionsApp },
  } = ctx

  const data: ExternalPromotionsProviderRequest = {
    items: promotionalContext.items.map((item) => ({
      sku: item.id,
      price: item.sellingPrice,
    })),
  }

  return provider
    .calculateExternalPromotions(data)
    .then((externalPromotionsDataResult) => {
      return vtexExternalPromotionsApp
        .applyExternalPromotions(
          transformToVTEXExternalPromotionsDataContract(
            promotionalContext,
            sessionId,
            externalPromotionsDataResult
          )
        )
        .then((applyExternalPromotionsResult) => {
          // this may change when we implment the app on VTEX's side
          ctx.status = 200
          ctx.body = applyExternalPromotionsResult

          return next()
        })
        .catch((error) => {
          const msg =
            'an unexpected error occurred while applying external promotions'

          console.error(msg, { data: externalPromotionsDataResult, error })
          ctx.status = 500
          ctx.body = msg

          return next()
        })
    })
    .catch((error) => {
      const msg =
        'an unexpected error occurred while calling the external provider to calculate promotions'

      console.error(msg, { data, error })
      ctx.status = 500
      ctx.body = msg

      return next()
    })
}

function transformToVTEXExternalPromotionsDataContract(
  promotionalContext: PromotionalContext,
  sessionId: string,
  externalPromotions: ExternalPromotionsProviderResponse
): VTEXExternalPromotionsDataContract {
  const now = new Date()

  return {
    items: promotionalContext.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      seller: item.seller,
    })),
    sessionId: sessionId,
    externalPromotions: [
      {
        version: DataContractVersion.v1,
        type: DataContractType.page,
        exp: now.setHours(now.getHours() + 1), // this should be the unix time when the promotion becomes invalid,
        promotions: externalPromotions.promotions,
      },
    ],
  }
}

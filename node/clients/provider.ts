import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { Promotion } from './vtex-external-promotions-app'

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

export class Provider extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      `http://${context.workspace}--${context.account}.myvtex.com`,
      context,
      options
    )
  }

  public calculateExternalPromotions(data: ExternalPromotionsProviderRequest) {
    return this.http.post<ExternalPromotionsProviderResponse>(
      '/_v/promotions/calculate',
      data,
      {
        metric: 'calculate-promotions-external-provider',
      }
    )
  }
}

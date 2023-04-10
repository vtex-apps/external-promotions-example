import { IOClients } from '@vtex/api'

import { Provider } from './provider'
import { VTEXExternalPromotionsApp } from './vtex-external-promotions-app'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get provider() {
    return this.getOrSet('provider', Provider)
  }

  // this may change when we implment the app on VTEX's side
  public get vtexExternalPromotionsApp() {
    return this.getOrSet('vtexExternalPromotionsApp', VTEXExternalPromotionsApp)
  }
}

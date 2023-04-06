import { IOClients } from '@vtex/api'

import { Provider } from './provider'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get provider() {
    return this.getOrSet('provider', Provider)
  }
}

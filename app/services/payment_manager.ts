import { type PaymentGatewayContract } from '#contracts/payment_gateway'
import GatewayOneService from '#services/payment_gateways/gateway_one_service'
import GatewayTwoService from '#services/payment_gateways/gateway_two_service'
import Gateway from '#models/gateway'

export type AvailableGateways = 'gateway_one' | 'gateway_two'

class PaymentManager {
  // return list of available gateways sorted by priority
  public async listGateways(): Promise<Gateway[]> {
    return Gateway.query().orderBy('priority', 'asc')
  }

  // return an instance of the selected gateway service
  public driver(gatewayName: AvailableGateways): PaymentGatewayContract {
    switch (gatewayName) {
      case 'gateway_one':
        return new GatewayOneService()
      case 'gateway_two':
        return new GatewayTwoService()
      default:
        throw new Error(`Unsupported gateway: ${gatewayName}`)
    }
  }
}

export default new PaymentManager()

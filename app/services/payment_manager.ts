import { type PaymentGatewayContract } from '#contracts/payment_gateway'
import GatewayOneService from '#services/payment_gateways/gateway_one_service'
import GatewayTwoService from '#services/payment_gateways/gateway_two_service'

export type AvailableGateways = 'gateway_one' | 'gateway_two'

class PaymentManager {
  /**
   * Returns the selected payment gateway implementation
   */
  public driver(name: AvailableGateways): PaymentGatewayContract {
    switch (name) {
      case 'gateway_one':
        return new GatewayOneService()
      case 'gateway_two':
        return new GatewayTwoService()
      default:
        throw new Error(`Unsupported payment gateway: ${name}`)
    }
  }
}

// Export as a singleton
export default new PaymentManager()

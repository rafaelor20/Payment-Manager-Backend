import { type PaymentGatewayContract, type PaymentResult } from '#contracts/payment_gateway'
import GatewayOneService from '#services/payment_gateways/gateway_one_service'
import GatewayTwoService from '#services/payment_gateways/gateway_two_service'
import Gateway from '#models/gateway'

export type AvailableGateways = 'GATEWAY_1' | 'GATEWAY_2'

class PaymentManager {
  // return list of available gateways sorted by priority
  public async listGateways(): Promise<Gateway[]> {
    return Gateway.query().orderBy('priority', 'asc')
  }

  // return an instance of the selected gateway service
  public driver(gatewayName: AvailableGateways): PaymentGatewayContract {
    switch (gatewayName) {
      case 'GATEWAY_1':
        return new GatewayOneService()
      case 'GATEWAY_2':
        return new GatewayTwoService()
      default:
        throw new Error(`Unsupported gateway: ${gatewayName}`)
    }
  }

  public async processPaymentGateway(
    details: Parameters<PaymentGatewayContract['processPayment']>[0]
  ) {
    const gatewayList = await this.listGateways()

    // sort gateway list by priority
    gatewayList.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))

    let gatewayResponse: { externalId: string; status: string; usedGatewayId: number } = {
      externalId: '',
      status: 'failed',
      usedGatewayId: 0,
    }

    for (const gateway of gatewayList) {
      if (String(gateway.isActive) !== 'true') continue

      try {
        const driver = this.driver(gateway.name as any)
        let result: PaymentResult | undefined
        if (gateway.name === 'GATEWAY_1') {
          result = await driver.processPayment({
            amount: details.amount,
            name: details.name,
            email: details.email,
            cardNumber: details.cardNumber,
            cvv: details.cvv,
          })
        }

        if (gateway.name === 'GATEWAY_2') {
          result = await driver.processPayment({
            valor: details.amount,
            nome: details.name,
            email: details.email,
            numeroCartao: details.cardNumber,
            cvv: details.cvv,
          })
        }

        console.log(`gatewayResponse from ${gateway.name}:`, result)
        if (result && result.id) {
          gatewayResponse = {
            externalId: result.id,
            status: 'approved',
            usedGatewayId: Number(gateway.id),
          }
          return gatewayResponse
        }
      } catch (error) {
        continue
      }
    }

    if (gatewayResponse.status === 'failed') {
      return { status: 'failed', errorMessage: 'All gateways failed to process the payment' }
    }
  }
}

export default new PaymentManager()

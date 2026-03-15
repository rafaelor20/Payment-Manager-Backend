import env from '#start/env'
import {
  type PaymentGatewayContract,
  type PaymentDetails,
  type PaymentResult,
} from '#contracts/payment_gateway'

export default class GatewayTwoService implements PaymentGatewayContract {
  private tokenA: string
  private tokenB: string

  constructor() {
    this.tokenA = env.get('Gateway_2_Auth_Token') || ''
    this.tokenB = env.get('Gateway_2_Auth_Secret') || ''
  }

  public async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    console.log('Details 2:', details)
    try {
      console.log('Processing payment with Gateway 2:', details)
      const response = await fetch(`${env.get('GATEWAY_URL_2')}/transacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Gateway-Auth-Token': this.tokenA,
          'Gateway-Auth-Secret': this.tokenB,
        },
        body: JSON.stringify(details),
      })

      console.log('Gateway 2 Response Status:', response)
      const result = (await response.json()) as any
      return { id: result.id }
    } catch (error) {
      throw error
    }
  }
}

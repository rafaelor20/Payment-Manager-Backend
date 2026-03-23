import env from '#start/env'
import {
  type PaymentGatewayContract,
  type PaymentDetails,
  type PaymentResult,
  type ChargeBackResult,
} from '#contracts/payment_gateway'

export default class GatewayTwoService implements PaymentGatewayContract {
  private tokenA: string
  private tokenB: string

  constructor() {
    this.tokenA = env.get('Gateway_2_Auth_Token') || ''
    this.tokenB = env.get('Gateway_2_Auth_Secret') || ''
  }

  public async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    try {
      const response = await fetch(`${env.get('GATEWAY_URL_2')}/transacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Gateway-Auth-Token': this.tokenA,
          'Gateway-Auth-Secret': this.tokenB,
        },
        body: JSON.stringify(details),
      })

      const result = (await response.json()) as any
      return { id: result.id }
    } catch (error) {
      throw error
    }
  }

  public async chargeBack(transactionId: string): Promise<ChargeBackResult> {
    try {
      const response = await fetch(`${env.get('GATEWAY_URL_2')}/transacoes/reembolso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Gateway-Auth-Token': this.tokenA,
          'Gateway-Auth-Secret': this.tokenB,
        },
        body: JSON.stringify({ id: transactionId }),
      })

      const result = (await response.json()) as any
      return { id: result.id, result: result.status || result.result }
    } catch (error) {
      throw error
    }
  }
}

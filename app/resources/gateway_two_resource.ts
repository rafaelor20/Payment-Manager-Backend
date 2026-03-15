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
    this.tokenA = env.get('GATEWAY2_TOKEN_A') || ''
    this.tokenB = env.get('GATEWAY2_TOKEN_B') || ''
  }

  public async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    try {
      const response = await fetch(`${env.get('GATEWAY2_API_URL')}/charges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Token-A': this.tokenA, // Adjust header names per gateway specs
          'X-Api-Token-B': this.tokenB,
        },
        body: JSON.stringify(details),
      })

      const result = (await response.json()) as any
      return { success: response.ok, transactionId: result.txn_id }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

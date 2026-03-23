import env from '#start/env'
import {
  type PaymentGatewayContract,
  type PaymentDetails,
  type PaymentResult,
  type ChargeBackResult,
} from '#contracts/payment_gateway'

export default class GatewayOneService implements PaymentGatewayContract {
  private bearerToken: string | null = null
  private tokenExpiresAt: Date | null = null

  /**
   * Handles the login and caching of the token
   */
  private async authenticate(): Promise<string> {
    // If we have a valid unexpired token, reuse it
    if (this.bearerToken && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.bearerToken
    }

    // Otherwise, perform the login request
    // Example using native fetch (or you can use axios/undici)
    const response = await fetch(`${env.get('GATEWAY1_API_URL')}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: env.get('GATEWAY1_USER'),
        password: env.get('GATEWAY1_PASSWORD'),
      }),
    })

    if (!response.ok) {
      throw new Error('Gateway 1 Authentication failed')
    }

    const data = (await response.json()) as any
    this.bearerToken = data.token

    // Set expiration based on gateway specs (e.g., 1 hour from now)
    this.tokenExpiresAt = new Date(Date.now() + 3600 * 1000)

    if (!this.bearerToken) {
      throw new Error('Failed to obtain bearer token for Gateway 1')
    }

    return this.bearerToken
  }

  public async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    try {
      const token = await this.authenticate()

      const response = await fetch(`${env.get('GATEWAY1_API_URL')}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
      const token = await this.authenticate()

      const response = await fetch(
        `${env.get('GATEWAY_URL_1')}/transactions/${transactionId}/charge_back`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      const result = (await response.json()) as any
      return { id: result.id, result: result.status || result.result }
    } catch (error) {
      throw error
    }
  }
}

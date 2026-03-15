import env from '#start/env'
import {
  type PaymentGatewayContract,
  type PaymentDetails,
  type PaymentResult,
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
    const response = await fetch(`${env.get('GATEWAY_URL_1')}/login`, {
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
    const token = data.token
    if (!token) {
      throw new Error('Gateway 1 Authentication failed: No token received')
    }
    this.bearerToken = token

    // Set expiration based on gateway specs (e.g., 1 hour from now)
    this.tokenExpiresAt = new Date(Date.now() + 3600 * 1000)

    if (!this.bearerToken) {
      throw new Error('Failed to obtain bearer token for Gateway 1')
    }

    return this.bearerToken
  }

  public async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    console.log('Details 1:', details)
    try {
      const token = await this.authenticate()

      console.log('Processing payment with Gateway 1:', details)
      const response = await fetch(`${env.get('GATEWAY_URL_1')}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(details),
      })

      console.log('Gateway 1 Response Status:', response)
      const result = (await response.json()) as any
      return { id: result.id }
    } catch (error) {
      throw error
    }
  }
}

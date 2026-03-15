import type { HttpContext } from '@adonisjs/core/http'
import paymentManager from '#services/payment_manager'

export default class CheckoutController {
  public async store({ request, response }: HttpContext) {
    const payload = request.only(['amount', 'currency', 'gateway']) // E.g., gateway = 'gateway_two'

    try {
      // 1. Select the gateway dynamically
      const gateway = paymentManager.driver(payload.gateway)

      // 2. Process the payment using the unified contract
      const result = await gateway.processPayment({
        amount: payload.amount,
        currency: payload.currency,
      })

      if (result.success) {
        return response.ok({ message: 'Payment successful', id: result.transactionId })
      } else {
        return response.badRequest({ message: result.errorMessage })
      }
    } catch (error) {
      return response.internalServerError({ message: 'Failed to process payment' })
    }
  }
}

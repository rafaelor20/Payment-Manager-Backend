import type { HttpContext } from '@adonisjs/core/http'
import { createTransactionValidator } from '#validators/transaction'
import Client from '#models/client'
import Product from '#models/product'
import ProductService from '#services/product'
import Transaction from '#models/transaction'
import TransactionResource from '#resources/transaction_resource'
import paymentManager from '#services/payment_manager'

export default class TransactionsController {
  async index({ response }: HttpContext) {
    const transactions = await Transaction.query().preload('products').preload('client')

    return response.ok({ data: transactions })
  }

  async show({ params, response }: HttpContext) {
    const transaction = await Transaction.query()
      .where('id', params.id)
      .preload('products')
      .preload('client')
      .first()

    if (!transaction) {
      return response.notFound({ message: 'Transaction not found' })
    }

    return response.ok({ data: new TransactionResource(transaction).toObject() })
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createTransactionValidator)

    const client = await Client.firstOrCreate({ email: payload.email }, { name: payload.name })

    await Product.query().whereIn(
      'id',
      payload.products.map((p) => p.productId)
    )

    const amount = await new ProductService().calculateTotalAmount(payload.products)

    let gatewayResponse: { externalId: string; status: string; usedGatewayId: number } = {
      externalId: '',
      status: 'failed',
      usedGatewayId: 0,
    }

    try {
      const result = await paymentManager.processPaymentGateway({
        amount,
        name: payload.name,
        email: payload.email,
        cardNumber: payload.cardNumber,
        cvv: payload.cvv,
      })

      if (result && 'externalId' in result && result.status === 'approved') {
        gatewayResponse = {
          externalId: String(result.externalId) || '',
          status: 'approved',
          usedGatewayId: Number(result.usedGatewayId) || 0,
        }
      } else {
        return response.badRequest({
          message: 'Payment processing failed',
          error: 'Unknown error from payment manager',
        })
      }
    } catch (error) {
      return response.badRequest({
        message: 'Payment processing failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    const transaction = await Transaction.create({
      clientId: client.id,
      cardLastNumbers: payload.cardNumber.slice(-4),
      externalId: gatewayResponse.externalId,
      gatewayId: gatewayResponse.usedGatewayId,
      status: gatewayResponse.status,
    })

    const productsToAttach: Record<number, any> = {}
    const now = new Date()
    payload.products.forEach((p) => {
      productsToAttach[p.productId] = {
        quantity: p.quantity,
        created_at: now,
        updated_at: now,
      }
    })

    await transaction.related('products').attach(productsToAttach)

    await transaction.load('products')
    await transaction.load('client')

    return response.created({ data: new TransactionResource(transaction).toObject() })
  }
}

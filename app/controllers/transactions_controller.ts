import type { HttpContext } from '@adonisjs/core/http'
import { createTransactionValidator } from '#validators/transaction'
import Client from '#models/client'
import Product from '#models/product'
import Transaction from '#models/transaction'
import { createId } from '@paralleldrive/cuid2'
import TransactionResource from '#resources/transaction_resource'
import { DateTime } from 'luxon'

export default class TransactionsController {
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createTransactionValidator)

    const client = await Client.firstOrCreate({ email: payload.email }, { name: payload.name })

    const products = await Product.query().whereIn(
      'id',
      payload.products.map((p) => p.productId)
    )

    const amount = payload.products.reduce((total, p) => {
      const product = products.find((item) => item.id === p.productId)
      return total + (product?.amount || 0) * p.quantity
    }, 0)

    // TODO: Implement gateway logic
    const gatewayResponse = {
      externalId: createId(),
      status: 'paid',
    }

    const transaction = await Transaction.create({
      clientId: client.id,
      cardLastNumbers: payload.cardNumber.slice(-4),
      externalId: gatewayResponse.externalId,
      gatewayId: 1, // TODO: replace with gateway logic
      status: gatewayResponse.status,
    })

    const productsToAttach = new Map()
    payload.products.forEach((p) => {
      productsToAttach.set(p.productId, {
        quantity: p.quantity,
        created_at: DateTime.now(),
      })
    })

    await transaction.related('products').attach(productsToAttach)

    await transaction.load('products')
    await transaction.load('client')

    return response.created({ data: new TransactionResource(transaction).toObject() })
  }
}

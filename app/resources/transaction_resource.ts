import type Transaction from '#models/transaction'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class TransactionResource extends BaseTransformer<Transaction> {
  toObject() {
    return {
      id: this.resource.id,
      status: this.resource.status,
      name: this.resource.client.name,
      email: this.resource.client.email,
      cardLastNumbers: this.resource.cardLastNumbers,
      createdAt: this.resource.createdAt,
      updatedAt: this.resource.updatedAt,
      products: this.resource.products.map((p) => {
        return {
          id: p.id,
          name: p.name,
          amount: p.amount,
          quantity: p.$extras.pivot_quantity,
        }
      }),
    }
  }
}

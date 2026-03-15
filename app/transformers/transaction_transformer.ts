import type Transaction from '#models/transaction'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class TransactionTransformer extends BaseTransformer<Transaction> {
  static create(transaction: Transaction) {
    return new TransactionTransformer(transaction).transform(transaction)
  }

  transform(transaction: Transaction) {
    return {
      id: transaction.id,
      status: transaction.status,
      cardLastNumbers: transaction.cardLastNumbers,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      products: transaction.products.map((p) => {
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

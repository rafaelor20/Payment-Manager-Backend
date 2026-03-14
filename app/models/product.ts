import { ProductSchema } from '#database/schema'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Transaction from '#models/transaction'
import { manyToMany } from '@adonisjs/lucid/orm'

export default class Product extends ProductSchema {
  @manyToMany(() => Transaction, {
    pivotTable: 'transactions_products',
  })
  declare transactions: ManyToMany<typeof Transaction>
}

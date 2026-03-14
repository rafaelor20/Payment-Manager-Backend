import { TransactionSchema } from '#database/schema'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'
import { belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import Client from '#models/client'

export default class Transaction extends TransactionSchema {
  @manyToMany(() => Product, {
    pivotTable: 'transactions_products',
  })
  declare products: ManyToMany<typeof Product>

  @belongsTo(() => Client)
  declare client: BelongsTo<typeof Client>
}

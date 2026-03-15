import { ClientSchema } from '#database/schema'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { hasMany } from '@adonisjs/lucid/orm'
import Transaction from '#models/transaction'

export default class Client extends ClientSchema {
  @hasMany(() => Transaction)
  declare transactions: HasMany<typeof Transaction>
}

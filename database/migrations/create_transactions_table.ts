import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'
  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('client_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('clients')
        .onDelete('CASCADE')
      table
        .integer('gateway_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('gateways')
        .onDelete('CASCADE')
      table.string('external_id').notNullable().unique()
      table.string('status').notNullable()
      table.string('card_last_numbers', 4).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }
  async down() {
    this.schema.dropTable(this.tableName)
  }
}

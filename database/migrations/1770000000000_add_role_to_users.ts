import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add the role column with the specified enum values
      // defaulting to 'USER' for existing or new records
      table.enum('role', ['ADMIN', 'MANAGER', 'FINANCE', 'USER']).defaultTo('USER').notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
    })
  }
}

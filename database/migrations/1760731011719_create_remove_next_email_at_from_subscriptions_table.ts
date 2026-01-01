import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscriptions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('next_email_at')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('next_email_at').notNullable()
    })
  }
}

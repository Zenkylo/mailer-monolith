import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscription_responses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('subscription_id')
        .unsigned()
        .references('id')
        .inTable('subscriptions')
        .onDelete('CASCADE')

      table.string('endpoint')
      table.integer('response_code').unsigned()
      table.string('response_message').nullable()

      table.json('response_data').nullable()
      table.timestamp('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

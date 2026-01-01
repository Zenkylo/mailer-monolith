import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscriptions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('last_run_at').nullable()
      table.timestamp('next_run_at').nullable()
      table.integer('failure_count').defaultTo(0)
      table.timestamp('last_failure_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('last_run_at')
      table.dropColumn('next_run_at')
      table.dropColumn('failure_count')
      table.dropColumn('last_failure_at')
    })
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscriptions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nid').notNullable()
      table.string('name').notNullable()
      table.boolean('enabled').defaultTo(false)
      table.string('cron_expression').notNullable().defaultTo('0 9 * * *')
      table.string('timezone').notNullable()
      table.timestamp('next_run_at').nullable()
      table.timestamp('last_run_at').nullable()
      table.integer('failure_count').defaultTo(0)
      table.timestamp('last_failure_at').nullable()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('endpoint').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

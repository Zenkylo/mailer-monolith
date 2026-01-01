import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('email_status', ['active', 'bounced', 'complained', 'suppressed'])
        .defaultTo('active')
      table.timestamp('email_status_updated_at').nullable()
      table.string('email_bounce_reason').nullable()
      table.integer('bounce_count').defaultTo(0)
      table.timestamp('last_bounce_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('email_status')
      table.dropColumn('email_status_updated_at')
      table.dropColumn('email_bounce_reason')
      table.dropColumn('bounce_count')
      table.dropColumn('last_bounce_at')
    })
  }
}

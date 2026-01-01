import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'email_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Email identifiers
      table.string('message_id').nullable() // Provider message ID (SES, etc.)
      table.string('subject')
      table.string('recipient_email')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      // Subscription context
      table
        .integer('subscription_id')
        .unsigned()
        .references('id')
        .inTable('subscriptions')
        .onDelete('SET NULL')
        .nullable()
      table.string('email_type').defaultTo('subscription') // subscription, failure, notification, etc.

      // Email content (optional - for historical viewing)
      table.text('html_content').nullable()
      table.text('text_content').nullable()
      table.json('template_data').nullable() // Data used to generate the email

      // Delivery tracking
      table.string('status').defaultTo('pending') // pending, sent, delivered, bounced, complained, failed
      table.string('provider').defaultTo('ses') // ses, mailgun, sendgrid, etc.
      table.text('provider_response').nullable() // Raw provider response
      table.text('error_message').nullable()

      // Timestamps for delivery tracking
      table.timestamp('sent_at').nullable()
      table.timestamp('delivered_at').nullable()
      table.timestamp('bounced_at').nullable()
      table.timestamp('complained_at').nullable()

      // Audit fields
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes for performance
      table.index(['user_id', 'created_at'])
      table.index(['subscription_id'])
      table.index(['status'])
      table.index(['message_id'])
      table.index(['email_type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

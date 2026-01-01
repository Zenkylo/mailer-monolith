import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'polar_subscriptions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')

      // https://polar.sh/docs/api-reference/webhooks/subscription.updated
      // Required fields
      table.string('polar_id').notNullable().unique()
      table.integer('polar_amount').notNullable()
      table.string('polar_currency').notNullable()
      table.string('polar_recurring_interval').notNullable()
      table.string('polar_status').notNullable()
      table.timestamp('polar_current_period_start').notNullable()
      table.boolean('polar_cancel_at_period_end').notNullable()
      table.string('polar_customer_id').notNullable()
      table.string('polar_product_id').notNullable()
      table.timestamp('polar_modified_at').nullable()

      // Nullable fields
      table.timestamp('polar_current_period_end').nullable()
      table.timestamp('polar_trial_start').nullable()
      table.timestamp('polar_trial_end').nullable()
      table.timestamp('polar_canceled_at').nullable()
      table.timestamp('polar_started_at').nullable()
      table.timestamp('polar_ends_at').nullable()
      table.timestamp('polar_ended_at').nullable()
      table.string('polar_discount_id').nullable()
      table.string('polar_checkout_id').nullable()
      table.string('polar_customer_cancellation_reason').nullable()
      table.string('polar_customer_cancellation_comment').nullable()

      // JSON fields for complex data
      table.json('polar_metadata').notNullable().defaultTo('{}')
      table.json('polar_custom_field_data').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
// "currency": "<string>",
// "recurring_interval": "day",
// "status": "incomplete",
// "current_period_start": "2023-11-07T05:31:56Z",
// "current_period_end": "2023-11-07T05:31:56Z",
// "trial_start": "2023-11-07T05:31:56Z",
// "trial_end": "2023-11-07T05:31:56Z",
// "cancel_at_period_end": true,
// "canceled_at": "2023-11-07T05:31:56Z",
// "started_at": "2023-11-07T05:31:56Z",
// "ends_at": "2023-11-07T05:31:56Z",
// "ended_at": "2023-11-07T05:31:56Z",
// "customer_id": "<string>",
// "product_id": "<string>",
// "discount_id": "<string>",
// "checkout_id": "<string>",
// "customer_cancellation_reason": "customer_service",
// "customer_cancellation_comment": "<string>",

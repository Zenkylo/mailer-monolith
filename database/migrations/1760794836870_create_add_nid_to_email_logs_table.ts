import { BaseSchema } from '@adonisjs/lucid/schema'
import { nanoid } from 'nanoid'

export default class extends BaseSchema {
  protected tableName = 'email_logs'

  async up() {
    // First add the column as nullable
    this.schema.alterTable(this.tableName, (table) => {
      table.string('nid', 36).nullable().after('id')
    })

    // Update existing records with generated nids
    await this.defer(async (db) => {
      const logs = await db.from(this.tableName).select('id')
      for (const log of logs) {
        await db
          .from(this.tableName)
          .where('id', log.id)
          .update({ nid: nanoid(36) })
      }
    })

    // Make the column not null and unique
    this.schema.alterTable(this.tableName, (table) => {
      table.string('nid', 36).notNullable().unique().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('nid')
    })
  }
}

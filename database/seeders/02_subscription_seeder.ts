import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Subscription from '#models/subscription'

export default class extends BaseSeeder {
  async run() {
    const userId = 1

    const subs = [
      {
        name: 'Sub 1',
        userId,
        endpoint: 'http://localhost:3333/test-endpoint',
        cronExpression: '0 0 0 * * *',
        timezone: 'America/New_York',
      },
      {
        name: 'Sub 2',
        userId,
        endpoint: 'http://localhost:3333/test-endpoint-2',
        cronExpression: '0 0 0 * * *',
        timezone: 'America/New_York',
      },
    ]

    for (const sub of subs) {
      await Subscription.firstOrCreate({ name: sub.name }, sub)
    }
  }
}

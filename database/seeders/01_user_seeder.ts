import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        email: 'user@user.com',
        password: 'asdasdasd',
      },
      {
        email: 'jane.doe@example.com',
        password: 'asdasdasd',
      },
    ])
  }
}

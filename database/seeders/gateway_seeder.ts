import Gateway from '#models/gateway'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Gateway.createMany([
      {
        name: 'GATEWAY_1',
        isActive: 'true',
        priority: 1,
      },
      {
        name: 'GATEWAY_2',
        isActive: 'true',
        priority: 2,
      },
    ])
  }
}

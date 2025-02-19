import Reservation from '#models/reservation'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Reservation.createMany([
      {
        start_date: new Date('2021-09-01'),
        end_date: new Date('2021-09-02'),
        total_price: 100,
        status: 'confirmada',
        userId: 1,
        toolId: 1,
      },
      {
        start_date: new Date('2021-09-02'),
        end_date: new Date('2021-09-03'),
        total_price: 200,
        status: 'confirmada',
        userId: 2,
        toolId: 2,
      },
    ])
  }
}

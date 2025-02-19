import Tool from '#models/tool'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Tool.createMany([
      {
        name: 'Furadeira',
        description: 'Furadeira de impacto',
        price: 10,
        category: 'Ferramentas',
        rating: 4.5,
        status: 'disponível',
        userId: 1,
      },
      {
        name: 'Parafusadeira',
        description: 'Parafusadeira sem fio',
        price: 15,
        category: 'Ferramentas',
        rating: 4.0,
        status: 'disponível',
        userId: 2,
      },
    ])
  }
}

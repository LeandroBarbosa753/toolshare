import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        name: 'John Doe',
        email: 'johnl@gmail.com',
        password: '123456',
        address: 'Rua dos Bobos, nº 0',
        cpf: '123456789000',
        type: 'locatário',
      },
      {
        name: 'kelly',
        email: 'keply@gmail.com',
        password: '123456',
        address: 'Rua dos Bobos, nº 9',
        cpf: '56789010345',
        type: 'locador',
      },
    ])
  }
}

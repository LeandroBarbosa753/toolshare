import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        name: 'John Doe',
        email: 'john@gmail.com',
        password: '123456',
        address: 'Rua dos Bobos, nº 0',
        cpf: '12345678900',
        type: 'locatário',
      },
      {
        name: 'kelly',
        email: 'kelly@gmail.com',
        password: '123456',
        address: 'Rua dos Bobos, nº 9',
        cpf: '56789012345',
        type: 'locador',
      },
    ])
  }
}

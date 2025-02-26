import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('cpf').notNullable()
      table.string('name').nullable()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()

      table.string('phone').notNullable()
      table.string('latitude').nullable()
      table.string('longitude').nullable()
      table.string('address').nullable()
      table.string('image').nullable()
      table.string('token').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

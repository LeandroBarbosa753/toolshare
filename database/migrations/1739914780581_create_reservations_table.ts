import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reservations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .integer('tool_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('tools')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.datetime('start_date').notNullable()
      table.datetime('end_date').notNullable()
      table.float('total_price').notNullable()
      table.enum('status', ['pendente', 'confirmada', 'cancelada']).defaultTo('pendente')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
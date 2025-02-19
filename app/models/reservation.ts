import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
//import { compareValues } from '@adonisjs/lucid/utils'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Tool from './tool.js'

export default class Reservation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare start_date: Date

  @column()
  declare end_date: Date

  @column()
  declare total_price: number

  @column()
  declare status: 'pendente' | 'confirmada' | 'cancelada'

  @column()
  declare userId: number

  @column()
  declare toolId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Tool)
  declare tool: BelongsTo<typeof Tool>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

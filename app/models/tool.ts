import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { type HasMany, type BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Reservation from './reservation.js'

export default class Tool extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare price: number

  @column()
  declare category: string

  @column()
  declare rating: number | null

  @column()
  declare status: 'disponível' | 'alugada' | 'em manutenção'

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Reservation)
  declare reservations: HasMany<typeof Reservation>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
//import { compareValues } from '@adonisjs/lucid/utils'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Tool from './tool.js'

export default class Chat extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare message: string 

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
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { type HasMany } from '@adonisjs/lucid/types/relations'
import Tool from './tool.js'
import Reservation from './reservation.js'
import Chat from './chat.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare cpf: string

  @column()
  declare name: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare phone: string

  @column()
  declare latitude: string

  @column()
  declare longitude: string

  @column()
  declare address: string

  @column()
  declare type: 'locador' | 'locatário'

  @column()
  declare image: string | null

  @column()
  declare token: string | null

  @hasMany(() => Tool)
  declare tools: HasMany<typeof Tool>

  @hasMany(() => Chat)
  declare chats: HasMany<typeof Chat>

  @hasMany(() => Reservation)
  declare reservations: HasMany<typeof Reservation>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)
}

import User from '#models/user'
import { createSessionValidator } from '#validators/session'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async store({ request, response }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(createSessionValidator)
      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user)
      const tokenEspecifico = token.toJSON().token
      user.$setAttribute('token', tokenEspecifico)
      user.save()
      return response.ok({ token })
    } catch (error) {
      return response.unauthorized({ message: 'Invalid email or password' })
    }
  }

  async destroy({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user || !user.currentAccessToken?.identifier) {
        return response.badRequest({ message: 'Invalid session' })
      }

      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
      user.token = null
      user.save()
      console.log('Usuário removido')
      return response.status(203)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to log out' })
    }
  }
}

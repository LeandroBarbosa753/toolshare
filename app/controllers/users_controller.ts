import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { createUserValidator, updateUserValidator } from '#validators/user'

export default class UsersController {
  async index({}: HttpContext) {
    const users = await User.query().preload('reservations')
    return users
  }

  async store({ request }: HttpContext) {
    const { name, email, password, cpf, type, address } =
      await request.validateUsing(createUserValidator)
    const user = await User.create({ name, cpf, email, password, type, address })
    return user
  }

  async show({ params, response }: HttpContext) {
    try {
      const user = await User.findByOrFail('id', params.id)
      await user.load('reservations')
      return user
    } catch (e) {
      return response.status(404).json({ message: 'User not found' })
    }
  }

  async update({ params, request }: HttpContext) {
    const user = await User.findBy('id', params.id)
    const { name, password, address } = await request.validateUsing(updateUserValidator)
    user!.merge({ name, password, address })
    await user!.save()
    return user
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const user = await User.findByOrFail('id', params.id)
      await user.delete()
      return response.status(203).json({ message: 'User deleted' })
    } catch (error) {
      return response.status(404).json({ message: 'User not found' })
    }
  }
}

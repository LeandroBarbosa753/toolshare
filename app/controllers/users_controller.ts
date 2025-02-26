import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { createUserValidator, updateUserValidator } from '#validators/user'

export default class UsersController {
  async index({}: HttpContext) {
    const users = await User.query().preload('reservations')
    return users
  }

  async store({ request, response }: HttpContext) {
    const { name, email, password, phone, cpf,  address, latitude, longitude, image } =
      await request.validateUsing(createUserValidator)
    try {
      const user = await User.create({
        name,
        email,
        password,
        phone,
        cpf,
        address,
        latitude,
        longitude,
        image,
      })
      response.status(201).json({ message: 'User created', user })
      return
    } catch (error) {
      console.error({ error: error })
    }
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

  async update({ params, request, response }: HttpContext) {
    const user = await User.findBy('id', params.id)
    const { name, password, address, phone, latitude, longitude, image } =
      await request.validateUsing(updateUserValidator)
    user!.merge({ name, password, address, phone, latitude, longitude, image })
    await user!.save()
    response.status(200).json({ message: 'User updated successfully', user })
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const user = await User.findByOrFail('id', params.id)
      await user.delete()
      return response.status(203).json({ message: 'User deleted', user })
    } catch (error) {
      return response.status(404).json({ message: 'User not found' })
    }
  }
}

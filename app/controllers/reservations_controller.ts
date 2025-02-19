// import type { HttpContext } from '@adonisjs/core/http'

export default class ReservationsController {
  async index({}: HttpContext) {}

  async store({ request }: HttpContext) {}

  async show({ params }: HttpContext) {}

  async update({ params, request }: HttpContext) {}

  async destroy({ params }: HttpContext) {}
}

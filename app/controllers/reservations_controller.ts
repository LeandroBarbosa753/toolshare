import type { HttpContext } from '@adonisjs/core/http'
import Reservation from '#models/reservation'
import Tool from '#models/tool'
import { createReservationValidator, updateReservationValidator } from '#validators/reservation'

export default class ReservationsController {
  public async index({ auth, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized({ message: 'Você precisa estar autenticado' })
    }
    const user = auth.user
    await user.preload('reservations', (query) => {
      query.preload('tool')
    })
    return user.reservations
  }

  public async store({ auth, request, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized({ message: 'Você precisa estar autenticado' })
    }
    try {
      const { tool_id, date_initial, date_end, status } = await request.validateUsing(createReservationValidator)
      if (date_end.getTime() <= date_initial.getTime()) {
        return response.status(400).json({ message: 'A data final deve ser maior que a data inicial' })
      }
      const tool = await Tool.findOrFail(tool_id)
      const diffMs = date_end.getTime() - date_initial.getTime()
      const hours = diffMs / (1000 * 60 * 60)
      const calculatedPrice = hours * tool.price
      const user = auth.user
      const reservation = await user.related('reservations').create({
        toolId: tool_id,
        dateInitial: date_initial,
        dateEnd: date_end,
        totalPrice: calculatedPrice,
        status,
      })
      return reservation
    } catch (error) {
      return response.status(400).json({ message: error.message })
    }
  }

  public async show({ auth, params, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized({ message: 'Você precisa estar autenticado' })
    }
    try {
      const user = auth.user
      const reservation = await user
        .related('reservations')
        .query()
        .where('id', params.id)
        .preload('tool')
        .firstOrFail()
      return reservation
    } catch (error) {
      return response.status(404).json({ message: 'Reserva não encontrada' })
    }
  }

  public async update({ auth, params, request, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized({ message: 'Você precisa estar autenticado' })
    }
    try {
      const user = auth.user
      const reservation = await user.related('reservations').query().where('id', params.id).firstOrFail()
      const { date_initial, date_end, status } = await request.validateUsing(updateReservationValidator)
      reservation.merge({
        ...(date_initial !== undefined && { dateInitial: date_initial }),
        ...(date_end !== undefined && { dateEnd: date_end }),
        ...(status !== undefined && { status }),
      })
      if (date_initial || date_end) {
        const newDateInitial = date_initial || reservation.dateInitial
        const newDateEnd = date_end || reservation.dateEnd
        if (newDateEnd.getTime() <= newDateInitial.getTime()) {
          return response.status(400).json({ message: 'A data final deve ser maior que a data inicial' })
        }
        const tool = await Tool.findOrFail(reservation.toolId)
        const diffMs = newDateEnd.getTime() - newDateInitial.getTime()
        const hours = diffMs / (1000 * 60 * 60)
        reservation.totalPrice = hours * tool.price
      }
      await reservation.save()
      return reservation
    } catch (error) {
      return response.status(404).json({ message: 'Reserva não encontrada' })
    }
  }

  public async destroy({ auth, params, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized({ message: 'Você precisa estar autenticado' })
    }
    try {
      const user = auth.user
      const reservation = await user.related('reservations').query().where('id', params.id).firstOrFail()
      await reservation.delete()
      return response.status(203).json({ message: 'Reserva deletada' })
    } catch (error) {
      return response.status(404).json({ message: 'Reserva não encontrada' })
    }
  }
}

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
      const { tool_id, start_date, end_date, status } =
        await request.validateUsing(createReservationValidator)

      if (end_date.getTime() <= start_date.getTime()) {
        return response.status(400).json({ message: 'A data final deve ser maior que a data inicial' })
      }

      const tool = await Tool.findOrFail(tool_id)
      const diffMs = end_date.getTime() - start_date.getTime()
      const hours = diffMs / (1000 * 60 * 60)
      const computedPrice = hours * tool.price

      const user = auth.user
      const reservation = await user.related('reservations').create({
        toolId: tool_id,
        start_date,
        end_date,
        total_price: computedPrice,
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
      const reservation = await user
        .related('reservations')
        .query()
        .where('id', params.id)
        .firstOrFail()

      const { tool_id, start_date, end_date, status } =
        await request.validateUsing(updateReservationValidator)

      reservation.merge({
        ...(tool_id !== undefined && { toolId: tool_id }),
        ...(start_date !== undefined && { start_date }),
        ...(end_date !== undefined && { end_date }),
        ...(status !== undefined && { status }),
      })

      if (start_date || end_date || tool_id) {
        const finalStart = start_date || reservation.start_date
        const finalEnd = end_date || reservation.end_date

        if (finalEnd.getTime() <= finalStart.getTime()) {
          return response.status(400).json({ message: 'A data final deve ser maior que a data inicial' })
        }

        const toolIdToUse = tool_id || reservation.toolId
        const tool = await Tool.findOrFail(toolIdToUse)

        const diffMs = finalEnd.getTime() - finalStart.getTime()
        const hours = diffMs / (1000 * 60 * 60)
        reservation.total_price = hours * tool.price
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
      const reservation = await user
        .related('reservations')
        .query()
        .where('id', params.id)
        .firstOrFail()

      await reservation.delete()
      return response.status(203).json({ message: 'Reserva deletada' })
    } catch (error) {
      return response.status(404).json({ message: 'Reserva não encontrada' })
    }
  }
}

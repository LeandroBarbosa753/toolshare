import type { HttpContext } from '@adonisjs/core/http'
import Reservation from '#models/reservation'
import Tool from '#models/tool'
import { createReservationValidator, updateReservationValidator } from '#validators/reservation'

export default class ReservationsController {
  public async index({ auth, response }: HttpContext) {
    const user = auth.user
    const reservations = await Reservation.query().where('user_id', user.id).preload('tool')
    return response.json(reservations)
  }

  public async store({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Você precisa estar autenticado' })
    }

    try {
      const rawData = request.all()
      console.log('Dados recebidos:', rawData)

      const { tool_id, start_date, end_date, status } = await request.validateUsing(
        createReservationValidator
      )

      if (end_date <= start_date) {
        return response.badRequest({ message: 'A data final deve ser maior que a data inicial' })
      }

      const tool = await Tool.findOrFail(tool_id)
      if (!tool.price) {
        return response.badRequest({ message: 'Preço da ferramenta não encontrado' })
      }

      const hours = (end_date.getTime() - start_date.getTime()) / (1000 * 60 * 60)
      const computedPrice = hours * tool.price

      const reservation = await Reservation.create({
        userId: user.id,
        toolId: tool_id,
        start_date: start_date,
        end_date: end_date,
        total_price: computedPrice,
        status: status || 'pendente',
      })

      return response.created(reservation)
    } catch (error) {
      console.error('Erro ao criar reserva:', error)

      if (error.messages) {
        return response.badRequest({
          message: 'Erro de validação',
          errors: error.messages,
        })
      }

      return response.internalServerError({
        message: 'Erro ao criar reserva',
      })
    }
  }

  public async show({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user
      const reservation = await Reservation.query()
        .where('id', params.id)
        .where('user_id', user.id)
        .preload('tool')
        .firstOrFail()
      return reservation
    } catch (error) {
      return response.status(404).json({ message: 'Reserva não encontrada' })
    }
  }

  public async update({ auth, params, request, response }: HttpContext) {
    try {
      const user = auth.user
      const reservation = await Reservation.query()
        .where('id', params.id)
        .where('user_id', user.id)
        .firstOrFail()
      const { toolId, startDate, endDate, status } = await request.validateUsing(
        updateReservationValidator
      )
      if (toolId !== undefined) {
        reservation.toolId = toolId
      }
      if (startDate !== undefined) {
        reservation.start_date = startDate
      }
      if (endDate !== undefined) {
        reservation.end_date = endDate
      }
      if (status !== undefined) {
        reservation.status = status
      }
      if (startDate || endDate || toolId) {
        const finalStart = startDate || reservation.start_date
        const finalEnd = endDate || reservation.end_date
        if (finalEnd.getTime() <= finalStart.getTime()) {
          return response
            .status(400)
            .json({ message: 'A data final deve ser maior que a data inicial' })
        }
        const toolIdToUse = toolId || reservation.toolId
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
    try {
      const user = auth.user
      const reservation = await Reservation.query()
        .where('id', params.id)
        .where('user_id', user.id)
        .firstOrFail()
      await reservation.delete()
      return response.status(203).json({ message: 'Reserva deletada' })
    } catch (error) {
      return response.status(404).json({ message: 'Reserva não encontrada' })
    }
  }
}

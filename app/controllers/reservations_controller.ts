import type { HttpContext } from '@adonisjs/core/http'
import Reservation from '#models/reservation'
import Tool from '#models/tool'
import { createReservationValidator, updateReservationValidator } from '#validators/reservation'
import Notification from '#models/notification'

export default class ReservationsController {
  public async index({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Você precisa estar autenticado' })
    }

    const reservations = await Reservation.query().where('user_id', user.id).preload('tool')
    return response.json(reservations)
  }

  public async received({ auth, response }: HttpContext) {
    const user = auth.user;
    if (!user) {
      return response.unauthorized({ message: 'Você precisa estar autenticado' });
    }
  
    try {
      
      const receivedReservations = await Reservation.query()
        .whereHas('tool', (query) => {
          query.where('user_id', user.id);
        })
        .whereNot('user_id', user.id) 
        .preload('tool')
        .preload('user'); 
  
      return response.json(receivedReservations);
    } catch (error) {
      console.error('Erro ao buscar reservas recebidas:', error);
      return response.internalServerError({ message: 'Erro ao buscar reservas recebidas' });
    }
  }

  public async updateStatus({ auth, params, request, response }: HttpContext) {
    const user = auth.user;
    if (!user) {
      return response.unauthorized({ message: 'Você precisa estar autenticado' });
    }

    try {
     
      const reservation = await Reservation.query()
        .where('id', params.id)
        .preload('tool')
        .preload('user') 
        .firstOrFail();

     
      if (reservation.tool.userId !== user.id) {
        return response.unauthorized({ message: 'Você não tem permissão para atualizar o status desta reserva' });
      }

     
      const { status } = await request.validateUsing(updateReservationValidator);

     
      reservation.status = status;
      await reservation.save();

      
      await Notification.create({
        userId: reservation.userId, 
        reservationId: reservation.id, 
        message: `O status da sua reserva para a ferramenta "${reservation.tool.name}" foi alterado para "${status}".`,
      });

      
      return response.json({
        message: 'Status da reserva atualizado com sucesso',
        reservation,
      });
    } catch (error) {
      console.error('Erro ao atualizar o status da reserva:', error);
      return response.status(404).json({ message: 'Reserva não encontrada' });
    }
  }

  public async store({ auth, request, response }: HttpContext) {
    const user = auth.user;
    if (!user) {
      return response.unauthorized({ message: 'Você precisa estar autenticado' });
    }
  
    try {
      const rawData = request.all();
      console.log('Dados recebidos:', rawData);
  
      const { tool_id, start_date, end_date, status } = await request.validateUsing(
        createReservationValidator
      );
  
      if (end_date <= start_date) {
        return response.badRequest({ message: 'A data final deve ser maior que a data inicial' });
      }
  
      const tool = await Tool.findOrFail(tool_id);
      if (!tool.price) {
        return response.badRequest({ message: 'Preço da ferramenta não encontrado' });
      }
  
      const hours = end_date.diff(start_date, 'hours').hours; 
      const computedPrice = hours * tool.price;
  
      const reservation = await Reservation.create({
        userId: user.id,
        toolId: tool_id,
        start_date: start_date, 
        end_date: end_date,     
        total_price: computedPrice,
        status: status || 'pendente',
      });
  
      
      await Notification.create({
        userId: tool.userId,
        reservationId: reservation.id,
        message: `Nova solicitação de aluguel para a ferramenta ${tool.name}`,
      });
  
      return response.created(reservation);
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
  
      if (error.messages) {
        return response.badRequest({
          message: 'Erro de validação',
          errors: error.messages,
        });
      }
  
      return response.internalServerError({
        message: 'Erro ao criar reserva',
      });
    }
  }

  public async show({ auth, params, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Você precisa estar autenticado' })
    }

    try {
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
    const user = auth.user;
    if (!user) {
      return response.unauthorized({ message: 'Você precisa estar autenticado' });
    }
  
    try {
      const reservation = await Reservation.query()
        .where('id', params.id)
        .where('user_id', user.id)
        .firstOrFail();
  
      const { tool_id, start_date, end_date, status } = await request.validateUsing(
        updateReservationValidator
      );
  
      if (tool_id !== undefined) {
        reservation.toolId = tool_id;
      }
      if (start_date !== undefined) {
        reservation.start_date = start_date;
      }
      if (end_date !== undefined) {
        reservation.end_date = end_date;
      }
      if (status !== undefined) {
        reservation.status = status;
      }
  
      if (start_date || end_date || tool_id) {
        const finalStart = start_date || reservation.start_date;
        const finalEnd = end_date || reservation.end_date;
  
        if (finalEnd <= finalStart) {
          return response.badRequest({ message: 'A data final deve ser maior que a data inicial' });
        }
  
        const toolIdToUse = tool_id || reservation.toolId;
        const tool = await Tool.findOrFail(toolIdToUse);
  
        const duration = finalEnd.diff(finalStart, 'hours'); // Calcula a diferença em horas
        const hours = duration.hours; // Extrai o número de horas
  
        reservation.total_price = hours * tool.price;
      }
  
      await reservation.save();
      return response.json(reservation);
    } catch (error) {
      return response.status(404).json({ message: 'Reserva não encontrada' });
    }
  }

  public async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Você precisa estar autenticado' })
    }

    try {
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

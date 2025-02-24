import vine from '@vinejs/vine';
import { DateTime } from 'luxon';

const customDate = vine.string().transform((value) => {
  const date = DateTime.fromISO(value); 
  if (!date.isValid) {
    throw new Error('Formato de data inválido');
  }
  return date;
});

export const createReservationValidator = vine.compile(
  vine.object({
    tool_id: vine.number(),
    start_date: customDate,
    end_date: customDate,
    total_price: vine.number().min(0).optional(),
    status: vine.enum(['pendente', 'confirmada', 'cancelada', 'finalizada']),
  })
);

export const updateReservationValidator = vine.compile(
  vine.object({
    tool_id: vine.number().optional(),
    start_date: customDate.optional(),
    end_date: customDate.optional(),
    total_price: vine.number().min(0).optional(),
    status: vine.enum(['pendente', 'confirmada', 'cancelada']).optional(),
  })
);
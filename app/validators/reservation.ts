import vine from '@vinejs/vine'

export const createReservationValidator = vine.compile(
  vine.object({
    tool_id: vine.number(),
    date_initial: vine.date(),
    date_end: vine.date(),
    total_price: vine.number().min(0),
    status: vine.enum(['disponível', 'alugada', 'em manutenção']),
  })
)

export const updateReservationValidator = vine.compile(
  vine.object({
    tool_id: vine.number().optional(),
    date_initial: vine.date().optional(),
    date_end: vine.date().optional(),
    total_price: vine.number().min(0).optional(),
    status: vine.enum(['disponível', 'alugada', 'em manutenção']).optional(),
  })
)
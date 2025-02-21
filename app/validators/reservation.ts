import vine from '@vinejs/vine'

export const createReservationValidator = vine.compile(
  vine.object({
    tool_id: vine.number(),
    start_date: vine.date(),
    end_date: vine.date(),
    total_price: vine.number().min(0).optional(),
    status: vine.enum(['pendente', 'confirmada', 'cancelada']),
  })
)

export const updateReservationValidator = vine.compile(
  vine.object({
    tool_id: vine.number().optional(),
    start_date: vine.date().optional(),
    end_date: vine.date().optional(),
    total_price: vine.number().min(0).optional(),
    status: vine.enum(['pendente', 'confirmada', 'cancelada']).optional(),
  })
)

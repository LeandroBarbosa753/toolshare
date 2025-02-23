import vine from '@vinejs/vine'

// Função para validar datas em formatos personalizados
const customDate = vine.string().transform((value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Formato de data inválido')
  }
  return date
})

export const createReservationValidator = vine.compile(
  vine.object({
    tool_id: vine.number(),
    start_date: customDate,
    end_date: customDate,
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

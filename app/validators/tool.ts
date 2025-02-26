import vine from '@vinejs/vine'

export const createToolValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
    description: vine.string().trim().optional(),
    price: vine.number().min(0),
    category: vine.string().trim().minLength(3),
    rating: vine.number().min(0).max(5),
    status: vine.enum(['disponível', 'alugada', 'em manutenção']).optional(),
    image: vine.string().optional(),
  })
)

export const updateToolValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).optional(),
    description: vine.string().trim().minLength(10).optional(),
    price: vine.number().min(0).optional(),
    category: vine.string().trim().minLength(3).optional(),
    rating: vine.number().min(0).max(5).optional(),
    status: vine.enum(['disponível', 'alugada', 'em manutenção']).optional(),
    image: vine.string().optional(),
  })
)

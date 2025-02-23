import vine from '@vinejs/vine'

export const createChatValidator = vine.compile(
  vine.object({
    message: vine.string().trim().minLength(1).maxLength(500),
    toolId: vine.number().positive(),
  })
)

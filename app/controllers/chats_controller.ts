import type { HttpContext } from '@adonisjs/core/http'
import Chat from '#models/chat'
import Tool from '#models/tool'
import { createChatValidator } from '#validators/chat'

export default class ChatController {
  async store({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const { message, toolId } = await request.validateUsing(createChatValidator)

      const chat = await Chat.create({
        message,
        userId: user.id,
        toolId,
      })

      return response.status(201).json(chat)
    } catch (error) {
      return response.status(400).json({ message: error.message })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const tool = await Tool.findOrFail(params.id)
      const chats = await tool.related('chats').query().preload('user')
      return response.json(chats)
    } catch (error) {
      return response.status(404).json({ message: 'Tool not found' })
    }
  }
}

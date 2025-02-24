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

  async index({ response }: HttpContext) {
    try {
      const chats = await Chat.query().preload('user').preload('tool')
      return response.json(chats)
    } catch (error) {
      return response.status(500).json({ message: 'Error fetching chats' })
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

  async destroy({ params, response }: HttpContext) {
    try {
      const chat = await Chat.findOrFail(params.id)
      await chat.delete()
      return response.status(200).json({ message: 'Chat deleted successfully' })
    } catch (error) {
      return response.status(404).json({ message: 'Chat not found' })
    }
  }
}

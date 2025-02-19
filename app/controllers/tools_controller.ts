import type { HttpContext } from '@adonisjs/core/http'
import { createToolValidator, updateToolValidator } from '#validators/tool'
import Tool from '#models/tool'
export default class ToolsController {
  async index({ auth }: HttpContext) {
    const user = auth.user!
    await user.preload('tools')
    return user.tools
  }

  async store({ request, response, auth }: HttpContext) {
    try {
      const { name, description, price, category, rating, status } =
        await request.validateUsing(createToolValidator)
      const user = auth.user!
      await user.related('tools').create({
        name,
        description,
        price,
        category,
        rating,
        status,
      })
      return {
        name,
        description,
        price,
        category,
        rating,
        status,
      }
    } catch (error) {
      return response.status(400).json({ message: error.message })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const tool = await Tool.findOrFail(params.id)
      return tool
    } catch (error) {
      return response.status(404).json({ message: 'Tool not found' })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const tool = await Tool.findOrFail(params.id)
      const { name, description, price, category, rating, status } =
        await request.validateUsing(updateToolValidator)
      tool.merge({ name, description, price, category, rating, status })
      await tool.save()
      return tool
    } catch (error) {
      return response.status(404).json({ message: 'Tool not found' })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const tool = await Tool.findOrFail(params.id)
      await tool.delete()
      return response.status(203).json({ message: 'Tool deleted' })
    } catch (error) {
      return response.status(404).json({ message: 'Tool not found' })
    }
  }
}

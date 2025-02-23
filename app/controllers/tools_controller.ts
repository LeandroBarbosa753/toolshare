import type { HttpContext } from '@adonisjs/core/http'
import { createToolValidator, updateToolValidator } from '#validators/tool'
import Tool from '#models/tool'

export default class ToolsController {
  async index({ response }: HttpContext) {
    try {
      const availableTools = await Tool.query()

      return response.status(200).json({
        message: 'All tools retrieved successfully',
        tools: availableTools,
      })
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to retrieve tools', error: error.message })
    }
  }

  async store({ request, response, auth }: HttpContext) {
    try {
      const { name, description, price, category, rating, status, image } =
        await request.validateUsing(createToolValidator)
      const user = auth.user!
      await user.related('tools').create({
        name,
        description,
        price,
        category,
        rating,
        status,
        image,
      })

      response.status(201).json({
        message: 'Tool created',
        name,
        description,
        price,
        category,
        rating,
        status,
        image,
      })
      return
    } catch (error) {
      return response.status(400).json({ message: error.message })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const tool = await Tool.findOrFail(params.id)
      return response.status(200).json({ message: 'Tool found', tool })
    } catch (error) {
      return response.status(404).json({ message: 'Tool not found' })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const tool = await Tool.findOrFail(params.id)
      const { name, description, price, category, rating, status, image } =
        await request.validateUsing(updateToolValidator)
      tool.merge({ name, description, price, category, rating, status, image })
      await tool.save()
      return response.status(200).json({ message: 'Tool updated successfully', tool })
    } catch (error) {
      return response.status(404).json({ message: 'Tool not found' })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const tool = await Tool.findOrFail(params.id)
      await tool.delete()
      return response.status(203).json({ message: 'Tool deleted', tool })
    } catch (error) {
      return response.status(404).json({ message: 'Tool not found' })
    }
  }
}

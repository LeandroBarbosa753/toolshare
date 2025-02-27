import type { HttpContext } from '@adonisjs/core/http'
import { createToolValidator, updateToolValidator } from '#validators/tool'
import Tool from '#models/tool'
import { haversineDistance } from '../utils/haversine.ts'

export default class ToolsController {
  async index({ response }: HttpContext) {
    try {
      const tools = await Tool.query();

      return response.status(200).json({
        message: 'Tools retrieved successfully',
        tools: tools,
      });
    } catch (error: any) {
      return response.status(500).json({ message: 'Failed to retrieve tools', error: error.message });
    }
  }

  async nearby({ request, response }: HttpContext) {
    const { latitude, longitude, radius } = request.qs();

    // Validar os parâmetros
    if (!latitude || !longitude || !radius) {
      return response.badRequest({
        message: 'Parâmetros latitude, longitude e radius são obrigatórios.',
      });
    }

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    const searchRadius = parseFloat(radius);

    if (isNaN(userLat) || isNaN(userLng) || isNaN(searchRadius)) {
      return response.badRequest({
        message: 'Latitude, longitude e radius devem ser números válidos.',
      });
    }

    try {
      const tools = await Tool.query().where('status', 'disponível');

      const nearbyTools = tools.filter((tool) => {
        if (!tool.latitude || !tool.longitude) return false;

        const toolLat = parseFloat(tool.latitude);
        const toolLng = parseFloat(tool.longitude);

        if (isNaN(toolLat) || isNaN(toolLng)) return false;

        const distance = haversineDistance(userLat, userLng, toolLat, toolLng);
        return distance <= searchRadius;
      });

      return response.json({
        message: 'Ferramentas próximas encontradas',
        tools: nearbyTools,
      });
    } catch (error: any) {
      return response.internalServerError({
        message: 'Erro ao buscar ferramentas próximas',
        error: error.message,
      });
    }
  }

  async store({ request, response, auth }: HttpContext) {
    try {
      const { name, description, price, category, rating, status, image } =
        await request.validateUsing(createToolValidator);

      const user = auth.user!;

      if (!user.latitude || !user.longitude) {
        return response.badRequest({
          message: 'Você precisa definir sua localização (latitude e longitude) antes de cadastrar uma ferramenta.',
        });
      }

      const tool = await user.related('tools').create({
        name,
        description,
        price,
        category,
        rating,
        status: status || 'disponível',
        image,
        latitude: user.latitude,
        longitude: user.longitude,
      });

      return response.status(201).json({
        message: 'Tool created',
        tool,
      });
    } catch (error: any) {
      console.error('Erro ao criar ferramenta:', error);
      return response.status(400).json({
        message: 'Erro ao criar ferramenta',
        error: error.message,
      });
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const tool = await Tool.query()
        .where('id', params.id)
        .firstOrFail();

      return response.status(200).json({ message: 'Tool found', tool });
    } catch (error) {
      return response.status(404).json({ message: 'Tool not found' });
    }
  }

  async update({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.user!;
      const tool = await Tool.query()
        .where('id', params.id)
        .where('userId', user.id)
        .firstOrFail();

      const { name, description, price, category, rating, status, image } =
        await request.validateUsing(updateToolValidator);
      tool.merge({ name, description, price, category, rating, status, image });
      await tool.save();

      return response.status(200).json({ message: 'Tool updated successfully', tool });
    } catch (error) {
      return response.status(404).json({ message: 'Tool not found or you do not have permission' });
    }
  }

  async destroy({ params, response, auth }: HttpContext) {
    try {
      const user = auth.user!;
      const tool = await Tool.query()
        .where('id', params.id)
        .where('userId', user.id)
        .firstOrFail();

      await tool.delete();
      return response.status(203).json({ message: 'Tool deleted', tool });
    } catch (error) {
      return response.status(404).json({ message: 'Tool not found or you do not have permission' });
    }
  }
}
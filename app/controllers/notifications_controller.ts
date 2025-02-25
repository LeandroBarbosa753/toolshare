import Notification from '#models/notification'
import type { HttpContext } from '@adonisjs/core/http'

export default class NotificationsController {
  async index({ auth, response }: HttpContext) {
    const user = auth.user!
    const notifications = await Notification.query()
      .where('user_id', user.id)
      .preload('reservation')
      .orderBy('created_at', 'desc')

    return response.json(notifications)
  }

  async markAsRead({ params, response }: HttpContext) {
    const notification = await Notification.findOrFail(params.id)
    notification.read = true
    await notification.save()

    return response.json({ message: 'Notification marked as read' })
  }

  
  async delete({ params, response }: HttpContext) {
    try {
      const notification = await Notification.findOrFail(params.id);
      await notification.delete();

      return response.json({ message: 'Notificação apagada com sucesso' });
    } catch (error) {
      return response.status(404).json({ message: 'Notificação não encontrada' });
    }
  }
}
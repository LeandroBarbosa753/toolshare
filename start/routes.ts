import router from '@adonisjs/core/services/router'
//import io from './socket'
import { middleware } from './kernel.js'
import NotificationsController from '#controllers/notifications_controller'

// Importe os controllers
const UsersController = () => import('#controllers/users_controller')
const ToolsController = () => import('#controllers/tools_controller')
const ReservationsController = () => import('#controllers/reservations_controller')
const SessionController = () => import('#controllers/session_controller')
const ChatController = () => import('#controllers/chats_controller')

// Rotas públicas
router.resource('user', UsersController).apiOnly()

// Rotas de sessão (login/logout)
router.post('session', [SessionController, 'store'])

// Rotas protegidas 
router
  .group(() => {
    // Rotas para ferramentas e reservas
    router.resource('tool', ToolsController).apiOnly()
    router.post('/tools', [ToolsController, 'store']).use(middleware.auth());
    router.resource('reservation', ReservationsController).apiOnly()
    router.get('/reservations/received', [ReservationsController, 'received'])
    router.put('/reservations/:id/status', [ReservationsController, 'updateStatus'])
    router.get('/tools/nearby', [ToolsController, 'nearby'])
    // Rotas para o chat
    router.post('/chats', [ChatController, 'store'])
    router.get('/tools/:id/chats', [ChatController, 'show'])
    router.get('/notifications', [NotificationsController, 'index'])
    router.put('/notifications/:id/mark-as-read', [NotificationsController, 'markAsRead'])
    router.delete('/notifications/:id', [NotificationsController, 'delete'])

  })
  .use(middleware.auth())
import router from '@adonisjs/core/services/router'
//import io from './socket'
import { middleware } from './kernel.js'

// Importe os controllers
const UsersController = () => import('#controllers/users_controller')
const ToolsController = () => import('#controllers/tools_controller')
const ReservationsController = () => import('#controllers/reservations_controller')
const SessionController = () => import('#controllers/session_controller')
const ChatController = () => import('#controllers/chats_controller') // Importe o ChatController

// Rotas públicas
router.resource('user', UsersController).apiOnly()

// Rotas de sessão (login/logout)
router.post('session', [SessionController, 'store'])
router.delete('session', [SessionController, 'destroy'])

// Rotas protegidas (requerem autenticação)
router
  .group(() => {
    // Rotas para ferramentas e reservas
    router.resource('tool', ToolsController).apiOnly()
    router.resource('reservation', ReservationsController).apiOnly()

    // Rotas para o chat
    router.post('/chats', [ChatController, 'store'])
    router.get('/tools/:id/chats', [ChatController, 'show'])
  })
  .use(middleware.auth()) // Aplica o middleware de autenticação a todas as rotas do grupo
import router from '@adonisjs/core/services/router'
const UsersController = () => import('#controllers/users_controller')
const ToolsController = () => import('#controllers/tools_controller')
const ReservationsController = () => import('#controllers/reservations_controller')
const SessionController = () => import('#controllers/session_controller')
import { middleware } from './kernel.js'

router.resource('user', UsersController).apiOnly()

router.post('session', [SessionController, 'store'])
router.delete('session', [SessionController, 'destroy'])

router
  .group(() => {
    router.resource('tool', ToolsController).apiOnly()
    router.resource('reservation', ReservationsController).apiOnly()
  })
  .use(middleware.auth())

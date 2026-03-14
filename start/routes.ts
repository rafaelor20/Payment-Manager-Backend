/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessToken, 'store'])
        router.post('logout', [controllers.AccessToken, 'destroy']).use(middleware.auth())
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('/profile', [controllers.Profile, 'show'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    router
      .group(() => {
        router.post('/', [controllers.Users, 'store'])
        router.delete('/:id', [controllers.Users, 'destroy'])
      })
      .prefix('users')
      .as('users')
      .use(middleware.auth())

    router
      .group(() => {
        router.post('/', [controllers.Products, 'store'])
      })
      .prefix('products')
      .as('products')
      .use([middleware.auth(), middleware.role(['ADMIN', 'FINANCE'])])

    router
      .group(() => {
        router.patch('/switch-priority', [controllers.Gateways, 'switchPriority'])
        router.patch('/:id/status', [controllers.Gateways, 'updateStatus'])
      })
      .prefix('gateways')
      .as('gateways')
      .use([middleware.auth(), middleware.role(['ADMIN', 'FINANCE'])])
  })
  .prefix('/api/v1')

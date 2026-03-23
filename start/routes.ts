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
        router.put('/:id', [controllers.Users, 'update']).use(middleware.role(['ADMIN', 'MANAGER']))
        router.delete('/:id', [controllers.Users, 'destroy'])
      })
      .prefix('users')
      .as('users')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [controllers.Products, 'index'])
        router
          .post('/', [controllers.Products, 'store'])
          .use([middleware.auth(), middleware.role(['ADMIN', 'MANAGER', 'FINANCE'])])
        router
          .put('/:id', [controllers.Products, 'update'])
          .use([middleware.auth(), middleware.role(['ADMIN', 'MANAGER', 'FINANCE'])])
      })
      .prefix('products')
      .as('products')

    router
      .group(() => {
        router.patch('/switch-priority', [controllers.Gateways, 'switchPriority'])
        router.patch('/:id/status', [controllers.Gateways, 'updateStatus'])
      })
      .prefix('gateways')
      .as('gateways')
      .use([middleware.auth(), middleware.role(['ADMIN', 'FINANCE'])])

    router
      .group(() => {
        router.get('/', [controllers.Clients, 'index'])
        router.get('/:id', [controllers.Clients, 'show'])
        router.put('/:id', [controllers.Clients, 'update'])
      })
      .prefix('clients')
      .as('clients')
      .use([middleware.auth(), middleware.role(['ADMIN', 'MANAGER'])])

    router
      .group(() => {
        router.post('/', [controllers.Transactions, 'store'])
        router
          .get('/:id', [controllers.Transactions, 'show'])
          .use([middleware.auth(), middleware.role(['ADMIN', 'FINANCE'])])
        router
          .get('/', [controllers.Transactions, 'index'])
          .use([middleware.auth(), middleware.role(['ADMIN', 'FINANCE'])])
        router
          .post('/:id/charge_back', [controllers.Transactions, 'chargeBack'])
          .use([middleware.auth(), middleware.role(['ADMIN', 'FINANCE'])])
      })
      .prefix('transactions')
      .as('transactions')
  })
  .prefix('/api/v1')

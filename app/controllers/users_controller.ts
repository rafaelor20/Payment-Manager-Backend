import type { HttpContext } from '@adonisjs/core/http'
import { createUserValidator } from '#validators/user'
import User from '#models/user'
import { USER_ROLE } from '#database/schema_rules'
import UserTransformer from '#transformers/user_transformer'

export default class UsersController {
  async store({ request, auth, response, serialize }: HttpContext) {
    const authenticatedUser = auth.getUserOrFail()

    if (
      authenticatedUser.role !== USER_ROLE.ADMIN &&
      authenticatedUser.role !== USER_ROLE.MANAGER
    ) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(createUserValidator)

    if (authenticatedUser.role === USER_ROLE.MANAGER && payload.role === USER_ROLE.ADMIN) {
      return response.forbidden('Managers cannot create Admin users.')
    }

    const user = await User.create(payload)

    response.status(201)
    return serialize(UserTransformer.transform(user))
  }

  async destroy({ auth, response, params }: HttpContext) {
    const authenticatedUser = auth.getUserOrFail()

    if (
      authenticatedUser.role !== USER_ROLE.ADMIN &&
      authenticatedUser.role !== USER_ROLE.MANAGER
    ) {
      return response.forbidden()
    }

    const user = await User.findOrFail(params.id)

    if (authenticatedUser.role === USER_ROLE.MANAGER && user.role === USER_ROLE.ADMIN) {
      return response.forbidden('Managers cannot delete Admin users.')
    }

    if (authenticatedUser.id === user.id) {
      return response.forbidden('You cannot delete yourself.')
    }

    await user.delete()

    return response.noContent()
  }
}

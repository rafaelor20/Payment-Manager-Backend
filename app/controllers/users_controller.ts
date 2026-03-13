import type { HttpContext } from '@adonisjs/core/http'
import { createUserValidator } from '#validators/user'
import User from '#models/user'
import { USER_ROLE } from '#database/schema_rules'
import UserTransformer from '#transformers/user_transformer'

export default class UsersController {
  async store({ request, auth, response, serialize }: HttpContext) {
    const authenticatedUser = auth.getUserOrFail()

    if (authenticatedUser.role !== USER_ROLE.ADMIN) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(createUserValidator)

    const user = await User.create(payload)

    response.status(201)
    return serialize(UserTransformer.transform(user))
  }
}

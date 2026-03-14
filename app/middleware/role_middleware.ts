import { type HttpContext } from '@adonisjs/core/http'
import { type NextFn } from '@adonisjs/core/types/http'
import { Exception } from '@adonisjs/core/exceptions'

export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, allowedRoles: string[]) {
    const user = ctx.auth.user
    if (!user || !allowedRoles.includes(user.role)) {
      throw new Exception('Unauthorized access', { status: 403 })
    }
    await next()
  }
}

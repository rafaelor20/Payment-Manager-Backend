import Gateway from '../models/gateway.ts'
import { updateGatewayStatusValidator } from '#validators/gateway'
import type { HttpContext } from '@adonisjs/core/http'

export default class GatewaysController {
  public async updateStatus({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateGatewayStatusValidator)
    const gateway = await Gateway.findOrFail(params.id)

    gateway.isActive = payload.isActive
    await gateway.save()

    return response.ok({ message: 'Gateway status updated successfully', data: gateway })
  }
}

import Gateway from '../models/gateway.ts'
import { updateGatewayStatusValidator, switchGatewayPriorityValidator } from '#validators/gateway'
import type { HttpContext } from '@adonisjs/core/http'

export default class GatewaysController {
  public async updateStatus({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateGatewayStatusValidator)
    const gateway = await Gateway.findOrFail(params.id)

    gateway.isActive = payload.isActive
    await gateway.save()

    return response.ok({ message: 'Gateway status updated successfully', data: gateway })
  }

  public async switchPriority({ request, response }: HttpContext) {
    const payload = await request.validateUsing(switchGatewayPriorityValidator)

    const gateway1 = await Gateway.findOrFail(payload.gatewayId)
    const gateway2 = await Gateway.findByOrFail('priority', payload.targetPriority)

    if (gateway1.id === gateway2.id) {
      return response.badRequest({ message: 'Gateway already has the target priority' })
    }

    const priority1 = gateway1.priority
    const priority2 = gateway2.priority

    gateway1.priority = priority2
    gateway2.priority = priority1

    await gateway1.save()
    await gateway2.save()

    return response.ok({
      message: 'Gateways priorities switched successfully',
      data: [gateway1, gateway2],
    })
  }
}

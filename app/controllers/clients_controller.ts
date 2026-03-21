import type { HttpContext } from '@adonisjs/core/http'
import Client from '#models/client'
import { updateClientValidator } from '#validators/client'

export default class ClientsController {
  async index({ response }: HttpContext) {
    const clients = await Client.query().orderBy('id', 'desc')
    return response.ok({ data: clients })
  }

  async show({ params, response }: HttpContext) {
    const client = await Client.query()
      .where('id', params.id)
      .preload('transactions', (transactionsQuery) => {
        transactionsQuery.preload('products')
      })
      .first()

    if (!client) {
      return response.notFound({ message: 'Client not found' })
    }

    return response.ok({ data: client })
  }

  async update({ request, response, params }: HttpContext) {
    const payload = await request.validateUsing(updateClientValidator)
    const client = await Client.findOrFail(params.id)
    client.merge(payload)
    await client.save()
    return response.ok({ message: 'Client updated successfully', data: client })
  }
}

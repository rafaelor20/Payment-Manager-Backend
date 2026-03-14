import Product from '#models/product'
import { createProductValidator } from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProductsController {
  public async index({ response }: HttpContext) {
    const products = await Product.all()
    return response.ok({ data: products })
  }

  public async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createProductValidator)
    const product = await Product.create(payload)
    return response.created({ message: 'Product created successfully', data: product })
  }
}

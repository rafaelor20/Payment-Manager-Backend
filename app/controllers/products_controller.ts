import Product from '#models/product'
import { createProductValidator, updateProductValidator } from '#validators/product'
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

  public async update({ request, response, params }: HttpContext) {
    const payload = await request.validateUsing(updateProductValidator)
    const product = await Product.findOrFail(params.id)
    product.merge(payload)
    await product.save()
    return response.ok({ message: 'Product updated successfully', data: product })
  }
}

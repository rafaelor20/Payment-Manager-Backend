import Product from '#models/product'

export default class ProductService {
  public async calculateTotalAmount(
    products: { productId: number; quantity: number }[]
  ): Promise<number> {
    let totalAmount = 0

    for (const item of products) {
      const product = await Product.find(item.productId)
      if (product) {
        totalAmount += product.amount * item.quantity
      }
    }

    return totalAmount
  }
}

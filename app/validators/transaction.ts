import vine from '@vinejs/vine'

export const createTransactionValidator = vine.compile(
  vine.object({
    name: vine.string(),
    email: vine.string().email(),
    cardNumber: vine.string().fixedLength(16),
    cvv: vine.string().fixedLength(3),
    products: vine.array(
      vine.object({
        productId: vine.number().positive(),
        quantity: vine.number().positive(),
      })
    ),
  })
)

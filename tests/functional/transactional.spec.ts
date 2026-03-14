import User from '#models/user'
import { test } from '@japa/runner'
import { USER_ROLE } from '#database/schema_rules'
import Product from '#models/product'
import Client from '#models/client'
import Transaction from '#models/transaction'
import Gateway from '#models/gateway'

test.group('Create a Transaction', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
    await Product.query().delete()
    await Client.query().delete()
    await Transaction.query().delete()
    await Gateway.query().delete()
  })

  test('should return 201 when a unauthenticate user creates a transaction', async ({
    client,
    assert,
  }) => {
    const manager = await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password',
      role: USER_ROLE.MANAGER,
    })

    await Gateway.create({
      name: 'Test Gateway',
      isActive: 'true',
    })

    const token = await User.accessTokens.create(manager)

    await Product.create({
      name: 'Test Product 1',
      amount: 1000,
    })

    await Product.create({
      name: 'Test Product 2',
      amount: 2000,
    })

    const ProductsResponse = await client
      .get('/api/v1/products')
      .bearerToken(token.value!.release())

    const products = ProductsResponse.body().data
    const product1 = products.find((p: any) => p.name === 'Test Product 1')
    const product2 = products.find((p: any) => p.name === 'Test Product 2')

    const transactionExample = {
      name: 'User buying products',
      email: 'user@example.com',
      cardNumber: '4111111111111111',
      cvv: '123',
      products: [
        {
          productId: Number(product1.id),
          quantity: 2,
        },
        {
          productId: Number(product2.id),
          quantity: 1,
        },
      ],
    }

    const response = await client.post('/api/v1/transactions').json(transactionExample)

    console.log(response.body())
    response.assertStatus(201)
    assert.equal(response.body().data.name, transactionExample.name)
    assert.equal(response.body().data.email, transactionExample.email)
  })
})

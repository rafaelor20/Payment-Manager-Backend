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

    await Gateway.create({
      id: 1,
      name: 'Test Gateway',
      isActive: 'true',
    })
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
      name: 'Test User',
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

    response.assertStatus(201)
    assert.equal(response.body().data.name, transactionExample.name)
    assert.equal(response.body().data.email, transactionExample.email)
    assert.equal(response.body().data.cardLastNumbers, '1111')
    assert.equal(response.body().data.products.length, 2)
  })
})

test.group('ADMIN or FINANCE user can get all transactions', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
    await Product.query().delete()
    await Client.query().delete()
    await Transaction.query().delete()
    await Gateway.query().delete()

    await Gateway.create({
      id: 1,
      name: 'Test Gateway',
      isActive: 'true',
    })
  })

  test('should return 200 when an ADMIN user gets all transactions', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'password',
      role: USER_ROLE.ADMIN,
    })

    const token = await User.accessTokens.create(admin)

    const client1 = await Client.create({
      name: 'Client 1',
      email: 'client1@example.com',
    })

    const client2 = await Client.create({
      name: 'Client 2',
      email: 'client2@example.com',
    })

    const product1 = await Product.create({
      name: 'Test Product 1',
      amount: 1000,
    })

    const product2 = await Product.create({
      name: 'Test Product 2',
      amount: 2000,
    })

    const transactionExample1 = {
      name: 'Client 1',
      email: client1.email,
      cardNumber: '4111111111111111',
      cvv: '123',
      products: [
        {
          productId: Number(product1.id),
          quantity: 1,
        },
        {
          productId: Number(product2.id),
          quantity: 2,
        },
      ],
    }

    await client.post('/api/v1/transactions').json(transactionExample1)

    const transactionExample2 = {
      name: 'Client 2',
      email: client2.email,
      cardNumber: '4111111111111111',
      cvv: '123',
      products: [
        {
          productId: Number(product1.id),
          quantity: 10,
        },
        {
          productId: Number(product2.id),
          quantity: 20,
        },
      ],
    }

    await client.post('/api/v1/transactions').json(transactionExample2)

    const response = await client.get('/api/v1/transactions').bearerToken(token.value!.release())

    response.assertStatus(200)
    assert.equal(response.body().data.length, 2)
  })

  test('should return 200 when an Finance user gets all transactions', async ({
    client,
    assert,
  }) => {
    const finance = await User.create({
      fullName: 'Finance User',
      email: 'finance@example.com',
      password: 'password',
      role: USER_ROLE.FINANCE,
    })

    const token = await User.accessTokens.create(finance)

    const client1 = await Client.create({
      name: 'Client 1',
      email: 'client1@example.com',
    })

    const client2 = await Client.create({
      name: 'Client 2',
      email: 'client2@example.com',
    })

    const product1 = await Product.create({
      name: 'Test Product 1',
      amount: 1000,
    })

    const product2 = await Product.create({
      name: 'Test Product 2',
      amount: 2000,
    })

    const transactionExample1 = {
      name: 'Test User',
      email: client1.email,
      cardNumber: '4111111111111111',
      cvv: '123',
      products: [
        {
          productId: Number(product1.id),
          quantity: 1,
        },
        {
          productId: Number(product2.id),
          quantity: 2,
        },
      ],
    }

    await client.post('/api/v1/transactions').json(transactionExample1)

    const transactionExample2 = {
      name: 'Test User',
      email: client2.email,
      cardNumber: '4111111111111111',
      cvv: '123',
      products: [
        {
          productId: Number(product1.id),
          quantity: 10,
        },
        {
          productId: Number(product2.id),
          quantity: 20,
        },
      ],
    }

    await client.post('/api/v1/transactions').json(transactionExample2)

    const response = await client.get('/api/v1/transactions').bearerToken(token.value!.release())

    response.assertStatus(200)
    assert.equal(response.body().data.length, 2)
  })

  test('should return 401 when an unauthenticated user tries to get all transactions', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/transactions')

    response.assertStatus(401)
  })

  test('should return 403 when an user with role USER tries to get all transactions', async ({
    client,
  }) => {
    const user = await User.create({
      fullName: 'Regular User',
      email: 'user@example.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.get('/api/v1/transactions').bearerToken(token.value!.release())

    response.assertStatus(403)
  })
})

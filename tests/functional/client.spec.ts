import User from '#models/user'
import Product from '#models/product'
import { test } from '@japa/runner'
import { USER_ROLE } from '#database/schema_rules'
import Client from '#models/client'
import Gateway from '#models/gateway'
import Transaction from '#models/transaction'
import { gatewayResponseMock } from '../gateway_response_mock.js'
import paymentManager from '#services/payment_manager'

test.group('ADMIN or MANAGER get list of clients', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
    await Client.query().delete()
  })

  test('should return 200 when an admin user gets the list of clients', async ({
    client,
    assert,
  }) => {
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

    const client3 = await Client.create({
      name: 'Client 3',
      email: 'client3@example.com',
    })

    const response = await client.get('/api/v1/clients').bearerToken(token.value!.release())

    response.assertStatus(200)
    assert.equal(response.body().data.length, 3)
    assert.equal(response.body().data[0].name, client3.name)
    assert.equal(response.body().data[0].email, client3.email)
    assert.equal(response.body().data[1].name, client2.name)
    assert.equal(response.body().data[1].email, client2.email)
    assert.equal(response.body().data[2].name, client1.name)
    assert.equal(response.body().data[2].email, client1.email)
  })

  test('should return 200 when an manager user gets the list of clients', async ({
    client,
    assert,
  }) => {
    const manager = await User.create({
      fullName: 'Manager User',
      email: 'manager@example.com',
      password: 'password',
      role: USER_ROLE.MANAGER,
    })

    const token = await User.accessTokens.create(manager)

    const client1 = await Client.create({
      name: 'Client 1',
      email: 'client1@example.com',
    })

    const client2 = await Client.create({
      name: 'Client 2',
      email: 'client2@example.com',
    })

    const client3 = await Client.create({
      name: 'Client 3',
      email: 'client3@example.com',
    })

    const response = await client.get('/api/v1/clients').bearerToken(token.value!.release())

    response.assertStatus(200)
    assert.equal(response.body().data.length, 3)
    assert.equal(response.body().data[0].name, client3.name)
    assert.equal(response.body().data[0].email, client3.email)
    assert.equal(response.body().data[1].name, client2.name)
    assert.equal(response.body().data[1].email, client2.email)
    assert.equal(response.body().data[2].name, client1.name)
    assert.equal(response.body().data[2].email, client1.email)
  })

  test('should return 403 when a user without the right role tries to get the list of clients', async ({
    client,
  }) => {
    const user = await User.create({
      fullName: 'Regular User',
      email: 'user@example.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    const token = await User.accessTokens.create(user)

    await Client.create({
      name: 'Client 1',
      email: 'client1@example.com',
    })

    const response = await client.get('/api/v1/clients').bearerToken(token.value!.release())

    response.assertStatus(403)
  })

  test('should return 401 when an unauthenticated user tries to get the list of clients', async ({
    client,
  }) => {
    await Client.create({
      name: 'Client 1',
      email: 'client1@example.com',
    })

    const response = await client.get('/api/v1/clients')

    response.assertStatus(401)
  })
})

test.group('ADMIN or MANAGER get a client by id and all his transactions', (group) => {
  let originalProcessPaymentGateway: any

  group.setup(() => {
    originalProcessPaymentGateway = paymentManager.processPaymentGateway
    paymentManager.processPaymentGateway = async () => {
      return gatewayResponseMock()
    }
  })

  group.teardown(() => {
    paymentManager.processPaymentGateway = originalProcessPaymentGateway
  })

  group.each.setup(async () => {
    await User.query().delete()
    await Client.query().delete()
    await Product.query().delete()
    await Transaction.query().delete()
    await Gateway.query().delete()

    await Gateway.create({
      id: 1,
      name: 'Test Gateway',
      isActive: 'true',
    })
  })

  test('should return 200 when an admin user gets a client by id and all his transactions', async ({
    client,
    assert,
  }) => {
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

    const response = await client
      .get(`/api/v1/clients/${client1.id}`)
      .bearerToken(token.value!.release())

    response.assertStatus(200)
    assert.equal(response.body().data.name, client1.name)
    assert.equal(response.body().data.email, client1.email)
    assert.equal(response.body().data.transactions.length, 1)
    assert.exists(response.body().data.transactions[0].products)
    assert.equal(response.body().data.transactions[0].products.length, 2)
  })

  test('should return 200 when an manager user gets a client by id and all his transactions', async ({
    client,
    assert,
  }) => {
    const manager = await User.create({
      fullName: 'Manager User',
      email: 'manager@example.com',
      password: 'password',
      role: USER_ROLE.MANAGER,
    })

    const token = await User.accessTokens.create(manager)

    const client1 = await Client.create({
      name: 'Client 1',
      email: 'client1@example.com',
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

    const response = await client
      .get(`/api/v1/clients/${client1.id}`)
      .bearerToken(token.value!.release())

    response.assertStatus(200)
    assert.equal(response.body().data.name, client1.name)
    assert.equal(response.body().data.email, client1.email)
    assert.equal(response.body().data.transactions.length, 1)
    assert.exists(response.body().data.transactions[0].products)
    assert.equal(response.body().data.transactions[0].products.length, 2)
  })

  test('should return 403 when a user without the right role tries to get a client by id and his transactions', async ({
    client,
  }) => {
    const user = await User.create({
      fullName: 'Regular User',
      email: 'user@example.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    const token = await User.accessTokens.create(user)

    const client1 = await Client.create({
      name: 'Client 1',
      email: 'client1@example.com',
    })

    const response = await client
      .get(`/api/v1/clients/${client1.id}`)
      .bearerToken(token.value!.release())

    response.assertStatus(403)
  })

  test('should return 401 when an unauthenticated user tries to get a client by id and his transactions', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/clients/1')

    response.assertStatus(401)
  })
})

test.group('ADMIN or MANAGER update a client', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
    await Client.query().delete()
  })

  test('should return 200 when an admin user updates a client', async ({ client, assert }) => {
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

    const response = await client
      .put(`/api/v1/clients/${client1.id}`)
      .bearerToken(token.value!.release())
      .json({
        name: 'Updated Client',
        email: 'updated@example.com',
      })

    response.assertStatus(200)
    assert.equal(response.body().message, 'Client updated successfully')
    assert.equal(response.body().data.name, 'Updated Client')
    assert.equal(response.body().data.email, 'updated@example.com')
  })

  test('should return 200 when an manager user updates a client', async ({ client, assert }) => {
    const manager = await User.create({
      fullName: 'Manager User',
      email: 'manager@example.com',
      password: 'password',
      role: USER_ROLE.MANAGER,
    })

    const token = await User.accessTokens.create(manager)

    const client1 = await Client.create({
      name: 'Client 1',
      email: 'client1@example.com',
    })

    const response = await client
      .put(`/api/v1/clients/${client1.id}`)
      .bearerToken(token.value!.release())
      .json({
        name: 'Updated Client',
        email: 'updated@example.com',
      })

    response.assertStatus(200)
    assert.equal(response.body().message, 'Client updated successfully')
    assert.equal(response.body().data.name, 'Updated Client')
    assert.equal(response.body().data.email, 'updated@example.com')
  })

  test('should return 403 when an common user updates a client', async ({ client }) => {
    const user = await User.create({
      fullName: 'User',
      email: 'user@example.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    const token = await User.accessTokens.create(user)

    const client1 = await Client.create({
      name: 'Client 1',
      email: 'client1@example.com',
    })

    const response = await client
      .put(`/api/v1/clients/${client1.id}`)
      .bearerToken(token.value!.release())
      .json({
        name: 'Updated Client',
        email: 'updated@example.com',
      })

    response.assertStatus(403)
  })

  test('should return 401 when an unauthenticated', async ({ client }) => {
    const client1 = await Client.create({
      name: 'Client 1',
      email: 'client1@example.com',
    })

    const response = await client.put(`/api/v1/clients/${client1.id}`).json({
      name: 'Updated Client',
      email: 'updated@example.com',
    })

    response.assertStatus(401)
  })
})

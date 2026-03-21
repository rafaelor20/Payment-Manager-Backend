import User from '#models/user'
import { test } from '@japa/runner'
import { USER_ROLE } from '#database/schema_rules'
import Product from '#models/product'

test.group('Create a Product', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
    await Product.query().delete()
  })

  test('should return 201 when an admin user creates a product', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'password',
      role: USER_ROLE.ADMIN,
    })

    const token = await User.accessTokens.create(admin)

    const response = await client
      .post('/api/v1/products')
      .bearerToken(token.value!.release())
      .json({
        name: 'New Product',
        amount: 1000,
      })

    response.assertStatus(201)
    assert.equal(response.body().message, 'Product created successfully')
  })

  test('should return 201 when a manager user creates a product', async ({ client, assert }) => {
    const manager = await User.create({
      fullName: 'Manager User',
      email: 'manager@example.com',
      password: 'password',
      role: USER_ROLE.MANAGER,
    })

    const token = await User.accessTokens.create(manager)

    const response = await client
      .post('/api/v1/products')
      .bearerToken(token.value!.release())
      .json({
        name: 'New Product',
        amount: 1000,
      })

    response.assertStatus(201)
    assert.equal(response.body().message, 'Product created successfully')
  })

  test('should return 201 when a finance user creates a product', async ({ client, assert }) => {
    const finance = await User.create({
      fullName: 'Finance User',
      email: 'finance@example.com',
      password: 'password',
      role: USER_ROLE.FINANCE,
    })

    const token = await User.accessTokens.create(finance)

    const response = await client
      .post('/api/v1/products')
      .bearerToken(token.value!.release())
      .json({
        name: 'New Product',
        amount: 1000,
      })

    response.assertStatus(201)
    assert.equal(response.body().message, 'Product created successfully')
  })

  test('should return 403 when a normal user tries to create a product', async ({ client }) => {
    const user = await User.create({
      fullName: 'Normal User',
      email: 'user@example.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    const token = await User.accessTokens.create(user)

    const response = await client
      .post('/api/v1/products')
      .bearerToken(token.value!.release())
      .json({
        name: 'New Product',
        amount: 1000,
      })

    response.assertStatus(403)
  })

  test('should return 401 when an unauthenticated user tries to create a product', async ({
    client,
  }) => {
    const response = await client.post('/api/v1/products').json({
      name: 'New Product',
      amount: 1000,
    })

    response.assertStatus(401)
  })

  test('should return 200 when an admin user updates a product', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'password',
      role: USER_ROLE.ADMIN,
    })

    const token = await User.accessTokens.create(admin)

    const product = await Product.create({
      name: 'Test Product',
      amount: 1000,
    })

    const response = await client
      .put(`/api/v1/products/${product.id}`)
      .bearerToken(token.value!.release())
      .json({
        name: 'Updated Product',
        amount: 2000,
      })

    response.assertStatus(200)
    assert.equal(response.body().message, 'Product updated successfully')
    assert.equal(response.body().data.name, 'Updated Product')
    assert.equal(response.body().data.amount, 2000)
  })

  test('should return 200 when a manager user updates a product', async ({ client, assert }) => {
    const manager = await User.create({
      fullName: 'Manager User',
      email: 'manager@example.com',
      password: 'password',
      role: USER_ROLE.MANAGER,
    })

    const token = await User.accessTokens.create(manager)

    const product = await Product.create({
      name: 'Test Product',
      amount: 1000,
    })

    const response = await client
      .put(`/api/v1/products/${product.id}`)
      .bearerToken(token.value!.release())
      .json({
        name: 'Updated Product',
        amount: 2000,
      })

    response.assertStatus(200)
    assert.equal(response.body().message, 'Product updated successfully')
    assert.equal(response.body().data.name, 'Updated Product')
    assert.equal(response.body().data.amount, 2000)
  })

  test('Should not allow a common user to update a product', async ({ client }) => {
    const user = await User.create({
      fullName: 'fincance User',
      email: 'finance@example.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    const token = await User.accessTokens.create(user)

    const product = await Product.create({
      name: 'Test Product',
      amount: 1000,
    })

    const response = await client
      .put(`/api/v1/products/${product.id}`)
      .bearerToken(token.value!.release())
      .json({
        name: 'Updated Product',
        amount: 2000,
      })

    response.assertStatus(403)
  })
})

test.group('List Products', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
    await Product.query().delete()
  })

  test('should return 200 and a list of products without requiring authentication', async ({
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
      name: 'Product 1',
      amount: 1000,
    })

    await Product.create({
      name: 'Product 2',
      amount: 2000,
    })

    const response = await client.get('/api/v1/products').bearerToken(token.value!.release())

    response.assertStatus(200)
    assert.equal(response.body().data.length, 2)
    assert.equal(response.body().data[0].name, 'Product 2')
    assert.equal(response.body().data[0].amount, 2000)
    assert.equal(response.body().data[1].name, 'Product 1')
    assert.equal(response.body().data[1].amount, 1000)
  })
})

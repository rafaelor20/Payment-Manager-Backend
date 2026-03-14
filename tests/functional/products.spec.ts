import User from '#models/user'
import { test } from '@japa/runner'
import { USER_ROLE } from '#database/schema_rules'
import Product from '#models/product'

test.group('Products', (group) => {
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
})

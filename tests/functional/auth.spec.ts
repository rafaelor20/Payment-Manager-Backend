import User from '#models/user'
import { test } from '@japa/runner'

test.group('Auth', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  test('should return 200 and a token on signup', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password',
      passwordConfirmation: 'password',
      role: 'USER',
    })

    response.assertStatus(200)
    assert.properties(response.body().data, ['user', 'token'])
    assert.exists(response.body().data.token)
    assert.equal(response.body().data.user.fullName, 'Test User')
    assert.equal(response.body().data.user.email, 'test@example.com')
  })

  test('should return 200 and a token on login', async ({ client, assert }) => {
    await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password',
      role: 'ADMIN',
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'test@example.com',
      password: 'password',
    })

    response.assertStatus(200)
    assert.properties(response.body().data, ['user', 'token'])
    assert.equal(response.body().data.user.fullName, 'Test User')
    assert.equal(response.body().data.user.email, 'test@example.com')
  })

  test('should return user profile on /account/profile', async ({ client, assert }) => {
    const user = await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password',
      role: 'MANAGER',
    })

    const token = await User.accessTokens.create(user)

    const response = await client.get('/api/v1/account/profile').bearerToken(token.value!.release())

    response.assertStatus(200)
    assert.equal(response.body().data.fullName, 'Test User')
    assert.equal(response.body().data.email, 'test@example.com')
    assert.equal(response.body().data.role, 'MANAGER')
  })
})

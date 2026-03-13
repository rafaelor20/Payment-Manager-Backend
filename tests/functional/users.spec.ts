import User from '#models/user'
import { test } from '@japa/runner'
import { USER_ROLE } from '#database/schema_rules'

test.group('Users', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  test('should return 403 when a non-admin user tries to create a user', async ({ client }) => {
    const user = await User.create({
      fullName: 'Normal User',
      email: 'user@example.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.post('/api/v1/users').bearerToken(token.value!.release()).json({
      fullName: 'New User',
      email: 'newuser@example.com',
      password: 'password',
    })

    response.assertStatus(403)
  })

  test('should return 201 when an admin user creates a user', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'password',
      role: USER_ROLE.ADMIN,
    })

    const token = await User.accessTokens.create(admin)

    const response = await client.post('/api/v1/users').bearerToken(token.value!.release()).json({
      fullName: 'New User by Admin',
      email: 'newuserbyadmin@example.com',
      password: 'password',
      role: USER_ROLE.MANAGER,
    })

    response.assertStatus(201)
    assert.equal(response.body().data.fullName, 'New User by Admin')
    assert.equal(response.body().data.email, 'newuserbyadmin@example.com')
    assert.equal(response.body().data.role, USER_ROLE.MANAGER)
  })
})

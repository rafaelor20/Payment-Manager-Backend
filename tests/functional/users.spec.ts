import User from '#models/user'
import { test } from '@japa/runner'
import { USER_ROLE } from '#database/schema_rules'

test.group('Users', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  test('should return 403 when a non-admin/non-manager user tries to create a user', async ({
    client,
  }) => {
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

  test('should return 201 when a manager user creates a user', async ({ client, assert }) => {
    const manager = await User.create({
      fullName: 'Manager User',
      email: 'manager@example.com',
      password: 'password',
      role: USER_ROLE.MANAGER,
    })

    const token = await User.accessTokens.create(manager)

    const response = await client.post('/api/v1/users').bearerToken(token.value!.release()).json({
      fullName: 'New User by Manager',
      email: 'newuserbymanager@example.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    response.assertStatus(201)
    assert.equal(response.body().data.fullName, 'New User by Manager')
    assert.equal(response.body().data.email, 'newuserbymanager@example.com')
    assert.equal(response.body().data.role, USER_ROLE.USER)
  })

  test('should return 201 when a manager user creates a finance user', async ({
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

    const response = await client.post('/api/v1/users').bearerToken(token.value!.release()).json({
      fullName: 'New Finance by Manager',
      email: 'newfinancebymanager@example.com',
      password: 'password',
      role: USER_ROLE.FINANCE,
    })

    response.assertStatus(201)
    assert.equal(response.body().data.fullName, 'New Finance by Manager')
    assert.equal(response.body().data.email, 'newfinancebymanager@example.com')
    assert.equal(response.body().data.role, USER_ROLE.FINANCE)
  })

  test('should return 201 when a manager user creates another manager user', async ({
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

    const response = await client.post('/api/v1/users').bearerToken(token.value!.release()).json({
      fullName: 'New Manager by Manager',
      email: 'newmanagerbymanager@example.com',
      password: 'password',
      role: USER_ROLE.MANAGER,
    })

    response.assertStatus(201)
    assert.equal(response.body().data.fullName, 'New Manager by Manager')
    assert.equal(response.body().data.email, 'newmanagerbymanager@example.com')
    assert.equal(response.body().data.role, USER_ROLE.MANAGER)
  })

  test('should return 422 when a manager user tries to create an admin user', async ({
    client,
  }) => {
    const manager = await User.create({
      fullName: 'Manager User',
      email: 'manager@example.com',
      password: 'password',
      role: USER_ROLE.MANAGER,
    })

    const token = await User.accessTokens.create(manager)

    const response = await client.post('/api/v1/users').bearerToken(token.value!.release()).json({
      fullName: 'New Admin by Manager',
      email: 'newadminbymanager@example.com',
      password: 'password',
      role: USER_ROLE.ADMIN,
    })

    response.assertStatus(403)
  })

  test('should not allow a non-admin or non-manager user to delete users', async ({ client }) => {
    const manager = await User.create({
      fullName: 'Manager User',
      email: 'manager@example.com',
      password: 'password',
      role: USER_ROLE.FINANCE,
    })

    const user = await User.create({
      fullName: 'User',
      email: 'user@example.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    const token = await User.accessTokens.create(manager)

    const response = await client
      .delete(`/api/v1/users/${user.id}`)
      .bearerToken(token.value!.release())

    response.assertStatus(403)
  })

  test('should allow an admin to delete users', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'password',
      role: USER_ROLE.ADMIN,
    })

    const user = await User.create({
      fullName: 'User',
      email: 'user@example.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    const token = await User.accessTokens.create(admin)

    const response = await client
      .delete(`/api/v1/users/${user.id}`)
      .bearerToken(token.value!.release())

    response.assertStatus(204)
  })

  test('should allow a manager to delete non-admin users', async ({ client }) => {
    const manager = await User.create({
      fullName: 'Manager User',
      email: 'manager@example.com',
      password: 'password',
      role: USER_ROLE.MANAGER,
    })

    const user = await User.create({
      fullName: 'User',
      email: 'user@example.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    const token = await User.accessTokens.create(manager)

    const response = await client
      .delete(`/api/v1/users/${user.id}`)
      .bearerToken(token.value!.release())

    response.assertStatus(204)
  })

  test('should not allow a user to delete themselves', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'password',
      role: USER_ROLE.ADMIN,
    })

    const token = await User.accessTokens.create(admin)

    const response = await client
      .delete(`/api/v1/users/${admin.id}`)
      .bearerToken(token.value!.release())

    response.assertStatus(403)
  })

  test('should allow a admin to update a user', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'password',
      role: USER_ROLE.ADMIN,
    })

    const token = await User.accessTokens.create(admin)

    const user = await User.create({
      fullName: 'User',
      email: 'user@example.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    const response = await client
      .put(`/api/v1/users/${user.id}`)
      .bearerToken(token.value!.release())
      .json({
        fullName: 'Updated User',
        email: 'updateduser@example.com',
        role: USER_ROLE.MANAGER,
      })

    response.assertStatus(200)
    assert.equal(response.body().data.fullName, 'Updated User')
    assert.equal(response.body().data.email, 'updateduser@example.com')
    assert.equal(response.body().data.role, USER_ROLE.MANAGER)
  })

  test('should allow a manager to update a user', async ({ client, assert }) => {
    const manager = await User.create({
      fullName: 'Manager User',
      email: 'manager@example.com',
      password: 'password',
      role: USER_ROLE.MANAGER,
    })

    const token = await User.accessTokens.create(manager)

    const user = await User.create({
      fullName: 'User',
      email: 'user@email.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    const response = await client
      .put(`/api/v1/users/${user.id}`)
      .bearerToken(token.value!.release())
      .json({
        fullName: 'Updated User',
        email: 'updateduser@example.com',
        role: USER_ROLE.FINANCE,
      })

    response.assertStatus(200)
    assert.equal(response.body().data.fullName, 'Updated User')
    assert.equal(response.body().data.email, 'updateduser@example.com')
    assert.equal(response.body().data.role, USER_ROLE.FINANCE)
  })

  test('should not allow a non-admin/non-manager user to update to update a user', async ({
    client,
  }) => {
    const finance = await User.create({
      fullName: 'finance User',
      email: 'manager@example.com',
      password: 'password',
      role: USER_ROLE.FINANCE,
    })

    const token = await User.accessTokens.create(finance)

    const user = await User.create({
      fullName: 'User',
      email: 'user@email.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    const response = await client
      .put(`/api/v1/users/${user.id}`)
      .bearerToken(token.value!.release())
      .json({
        fullName: 'Updated User',
        email: 'updateduser@example.com',
        role: USER_ROLE.FINANCE,
      })

    response.assertStatus(403)
  })
})

import User from '#models/user'
import { test } from '@japa/runner'
import { USER_ROLE } from '#database/schema_rules'
import Client from '#models/client'

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

import { test } from '@japa/runner'
import User from '#models/user'
import Gateway from '../../app/models/gateway.ts'
import { USER_ROLE } from '#database/schema_rules'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Gateways / Update Status', (group) => {
  group.each.setup(async () => {
    const teardown = await testUtils.db().truncate()
    await testUtils.db().seed()
    return teardown
  })

  test('it should allow ADMIN user to update gateway status', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@test.com',
      password: 'password',
      role: USER_ROLE.ADMIN,
    })

    const gateway = await Gateway.create({
      name: 'Test Gateway',
      isActive: 'true',
    })

    const token = await User.accessTokens.create(admin)

    const response = await client
      .patch(`/api/v1/gateways/${gateway.id}/status`)
      .json({ isActive: 'false' })
      .bearerToken(token.value!.release())

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Gateway status updated successfully' })

    await gateway.refresh()
    assert.equal(gateway.isActive, 'false')
  })

  test('it should allow FINANCE user to update gateway status', async ({ client, assert }) => {
    const financeUser = await User.create({
      fullName: 'Finance User',
      email: 'finance@test.com',
      password: 'password',
      role: USER_ROLE.FINANCE,
    })

    const gateway = await Gateway.create({
      name: 'Test Gateway',
      isActive: 'true',
    })

    const token = await User.accessTokens.create(financeUser)

    const response = await client
      .patch(`/api/v1/gateways/${gateway.id}/status`)
      .json({ isActive: 'false' })
      .bearerToken(token.value!.release())

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Gateway status updated successfully' })

    await gateway.refresh()
    assert.equal(gateway.isActive, 'false')
  })

  test('it should deny USER role from updating gateway status', async ({ client }) => {
    const user = await User.create({
      fullName: 'Normal User',
      email: 'user@test.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    const gateway = await Gateway.create({
      name: 'Test Gateway',
      isActive: 'true',
    })

    const token = await User.accessTokens.create(user)

    const response = await client
      .patch(`/api/v1/gateways/${gateway.id}/status`)
      .json({ isActive: 'false' })
      .bearerToken(token.value!.release())

    response.assertStatus(403)
  })

  test('it should deny unauthenticated users from updating gateway status', async ({ client }) => {
    const gateway = await Gateway.create({
      name: 'Test Gateway',
      isActive: 'true',
    })

    const response = await client
      .patch(`/api/v1/gateways/${gateway.id}/status`)
      .json({ isActive: 'false' })

    response.assertStatus(401)
  })

  test('it should return 404 if gateway does not exist', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@test.com',
      password: 'password',
      role: USER_ROLE.ADMIN,
    })

    const token = await User.accessTokens.create(admin)

    const response = await client
      .patch(`/api/v1/gateways/999/status`)
      .json({ isActive: 'false' })
      .bearerToken(token.value!.release())

    response.assertStatus(404)
  })

  test('it should return 422 for invalid payload', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@test.com',
      password: 'password',
      role: USER_ROLE.ADMIN,
    })

    const gateway = await Gateway.create({ name: 'Test Gateway', isActive: 'true' })

    const token = await User.accessTokens.create(admin)

    const response = await client
      .patch(`/api/v1/gateways/${gateway.id}/status`)
      .json({ status: 'invalid' }) // Intentionally invalid payload
      .bearerToken(token.value!.release())

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [{ message: 'The isActive field must be defined', field: 'isActive' }],
    })
  })
})

test.group('Gateways / Switch Priority', (group) => {
  group.each.setup(async () => {
    const teardown = await testUtils.db().truncate()
    await testUtils.db().seed()
    return teardown
  })

  test('it should allow ADMIN user to switch gateways priorities', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin_switch@test.com',
      password: 'password',
      role: USER_ROLE.ADMIN,
    })

    const token = await User.accessTokens.create(admin)

    const gateway1 = await Gateway.create({ name: 'Test Gateway 1', isActive: 'true', priority: 1 })
    const gateway2 = await Gateway.create({ name: 'Test Gateway 2', isActive: 'true', priority: 2 })

    const prevPriority1 = gateway1.priority
    const prevPriority2 = gateway2.priority

    const targetPriority = 2

    const response = await client
      .patch(`/api/v1/gateways/switch-priority`)
      .json({ gatewayId: gateway1.id, targetPriority })
      .bearerToken(token.value!.release())

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Gateways priorities switched successfully' })

    await gateway1.refresh()
    await gateway2.refresh()

    assert.equal(gateway1.priority, prevPriority2)
    assert.equal(gateway2.priority, prevPriority1)
  })

  test('it should allow FINANCE user to switch gateways priorities', async ({ client, assert }) => {
    const financeUser = await User.create({
      fullName: 'Finance User',
      email: 'finance_switch@test.com',
      password: 'password',
      role: USER_ROLE.FINANCE,
    })

    const token = await User.accessTokens.create(financeUser)

    const gateway1 = await Gateway.create({ name: 'Test Gateway 1', isActive: 'true', priority: 1 })
    const gateway2 = await Gateway.create({ name: 'Test Gateway 2', isActive: 'true', priority: 2 })

    const prevPriority1 = gateway1.priority
    const prevPriority2 = gateway2.priority

    const targetPriority = 2

    const response = await client
      .patch(`/api/v1/gateways/switch-priority`)
      .json({ gatewayId: gateway1.id, targetPriority })
      .bearerToken(token.value!.release())

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Gateways priorities switched successfully' })

    await gateway1.refresh()
    await gateway2.refresh()

    assert.equal(gateway1.priority, prevPriority2)
    assert.equal(gateway2.priority, prevPriority1)
  })

  test('it should deny USER role from switching gateways priorities', async ({ client }) => {
    const user = await User.create({
      fullName: 'Normal User',
      email: 'user_switch@test.com',
      password: 'password',
      role: USER_ROLE.USER,
    })

    const token = await User.accessTokens.create(user)

    const gateway1 = await Gateway.create({ name: 'Test Gateway 1', isActive: 'true', priority: 1 })

    const response = await client
      .patch(`/api/v1/gateways/switch-priority`)
      .json({ gatewayId: gateway1.id, targetPriority: 2 })
      .bearerToken(token.value!.release())

    response.assertStatus(403)
  })
})

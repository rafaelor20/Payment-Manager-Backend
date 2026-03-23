import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { Exception } from '@adonisjs/core/exceptions'

// NOTE: This is a simple in-memory cache for demonstration.
// For a production environment, especially with multiple instances or Docker containers,
// you should use Redis or a database (e.g., Lucid ORM) to store these keys.
const idempotencyCache = new Map<string, any>()

export default class IdempotencyMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    // 1. Extract the Idempotency-Key from the headers
    const idempotencyKey = request.header('Idempotency-Key')

    // Here we choose to bypass, but you can return a 400 Bad Request if you want to enforce it.
    if (!idempotencyKey) {
      throw new Exception('Idempotency-Key header is missing', { status: 400 })
    }

    // 3. Check if we already have a cached response for this key
    if (idempotencyCache.has(idempotencyKey)) {
      const cachedResponse = idempotencyCache.get(idempotencyKey)
      console.log('cachedResponse', cachedResponse)
      return response.status(cachedResponse.status).send(cachedResponse.body)
    }

    // 4. Mark the key as currently processing to prevent race conditions
    idempotencyCache.set(idempotencyKey, {
      status: 409,
      body: { message: 'Concurrent request processing. Please try again later.' },
    })

    // 5. Proceed with the request
    await next()

    // 6. Cache the successful response
    if (response.getStatus() >= 200 && response.getStatus() < 300) {
      idempotencyCache.set(idempotencyKey, {
        status: response.getStatus(),
        body: response.getBody(),
      })
    }
  }
}

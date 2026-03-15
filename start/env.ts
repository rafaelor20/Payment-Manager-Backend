/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Database
  DB_CONNECTION: Env.schema.enum(['mysql', 'sqlite'] as const),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  // Gateway 1 (Requires login)
  GATEWAY_URL_1: Env.schema.string(),
  GATEWAY_1_EMAIL: Env.schema.string(),
  GATEWAY_1_TOKEN: Env.schema.string(),

  // Gateway 2 (Requires 2 tokens)
  GATEWAY_URL_2: Env.schema.string(),
  Gateway_2_Auth_Token: Env.schema.string(),
  Gateway_2_Auth_Secret: Env.schema.string(),
})

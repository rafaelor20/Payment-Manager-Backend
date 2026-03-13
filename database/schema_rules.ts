import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

export const USER_ROLE = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  FINANCE: 'FINANCE',
  USER: 'USER',
} as const

export default {} satisfies SchemaRules

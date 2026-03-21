import vine from '@vinejs/vine'

export const updateClientValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).optional(),
    email: vine.string().email().optional(),
  })
)

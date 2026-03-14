import vine from '@vinejs/vine'

export const updateGatewayStatusValidator = vine.compile(
  vine.object({
    isActive: vine.string(),
  })
)

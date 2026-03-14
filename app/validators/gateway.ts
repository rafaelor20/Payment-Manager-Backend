import vine from '@vinejs/vine'

export const updateGatewayStatusValidator = vine.compile(
  vine.object({
    isActive: vine.string(),
  })
)

export const switchGatewayPriorityValidator = vine.compile(
  vine.object({
    gatewayId: vine.number(),
    targetPriority: vine.number(),
  })
)

let id = 0
export const gatewayResponseMock = () => {
  id++
  return {
    externalId: `12345-${id}`,
    status: 'approved',
    usedGatewayId: 1,
  }
}

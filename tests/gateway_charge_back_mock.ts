let id = 0
export const gatewayChargeBackResponseMock = () => {
  id++
  return {
    id: `12345-${id}`,
    status: 'charged_back',
  }
}

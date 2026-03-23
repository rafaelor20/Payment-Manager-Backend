export interface PaymentDetails {
  cvv: string
  email: string
  amount?: number
  valor?: number
  name?: string
  nome?: string
  cardNumber?: string
  numeroCartao?: string
}

export interface PaymentResult {
  id: string
}

export interface ChargeBackResult {
  id: string
  result: string
}

export interface PaymentGatewayContract {
  processPayment(details: PaymentDetails): Promise<PaymentResult>
  chargeBack(transactionId: string): Promise<ChargeBackResult>
}

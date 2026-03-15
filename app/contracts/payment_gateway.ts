export interface PaymentDetails {
  amount: number
  currency?: string
  description?: string
  name?: string
  email?: string
  cardNumber?: string
  cvv?: string
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  errorMessage?: string
}

export interface PaymentGatewayContract {
  processPayment(details: PaymentDetails): Promise<PaymentResult>
}

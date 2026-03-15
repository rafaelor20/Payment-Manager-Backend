export interface PaymentDetails {
  amount: number
  currency: string
  description?: string
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  errorMessage?: string
}

export interface PaymentGatewayContract {
  processPayment(details: PaymentDetails): Promise<PaymentResult>
}

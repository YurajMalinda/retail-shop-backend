export class DummyPaymentGateway {
  static async processPayment(orderId: string, amount: number) {
    const success = Math.random() > 0.2; // 80% success rate
    return {
      success,
      transactionId: success ? `TXN-${orderId}-${Date.now()}` : undefined,
      error: success ? undefined : "Payment declined",
    };
  }
}
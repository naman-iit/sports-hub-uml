export interface Payment {
  id: string;
  amount: number;
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRequest {
  amount: number;
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
} 
import { Request, Response } from 'express';
import { Payment, PaymentRequest } from '../models/Payment';

// Mock payment validation
const validatePayment = (payment: PaymentRequest): { isValid: boolean; error?: string } => {
  // Validate card number (Luhn algorithm)
  const cardNumber = payment.cardNumber.replace(/\s/g, '');
  if (!/^\d{16}$/.test(cardNumber)) {
    return { isValid: false, error: 'Invalid card number' };
  }

  // Validate expiry date
  const [month, year] = payment.expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  if (
    parseInt(month) < 1 ||
    parseInt(month) > 12 ||
    parseInt(year) < currentYear ||
    (parseInt(year) === currentYear && parseInt(month) < currentMonth)
  ) {
    return { isValid: false, error: 'Card has expired' };
  }

  // Validate CVV
  if (!/^\d{3,4}$/.test(payment.cvv)) {
    return { isValid: false, error: 'Invalid CVV' };
  }

  // Validate amount
  if (payment.amount <= 0) {
    return { isValid: false, error: 'Invalid amount' };
  }

  return { isValid: true };
};

// Mock payment processing
const processPayment = async (payment: PaymentRequest): Promise<Payment> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate random failure (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Payment processing failed');
  }

  return {
    id: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    amount: payment.amount,
    cardNumber: `**** **** **** ${payment.cardNumber.slice(-4)}`,
    cardName: payment.cardName,
    expiryDate: payment.expiryDate,
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const validateAndProcessPayment = async (req: Request, res: Response) => {
  try {
    const paymentRequest: PaymentRequest = req.body;

    // Validate payment
    const validation = validatePayment(paymentRequest);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Process payment
    const payment = await processPayment(paymentRequest);

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return res.status(500).json({
      success: false,
      error: 'Payment processing failed',
    });
  }
}; 
import express from 'express';
import { validateAndProcessPayment } from '../controllers/paymentController';

const router = express.Router();

// POST /api/payments/process
router.post('/process', validateAndProcessPayment);

export default router; 
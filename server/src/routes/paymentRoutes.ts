import express from 'express';
import { validateAndProcessPayment } from '../controllers/paymentController';
import { authorizeUser } from '../middlewares/authorizeUser';

const router = express.Router();

// POST /api/payments/process
router.post("/process", authorizeUser, validateAndProcessPayment);

export default router; 
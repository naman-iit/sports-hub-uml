import express from 'express';
import { login, signup } from '../controllers/authController';

const router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/login', login);

export default router; 
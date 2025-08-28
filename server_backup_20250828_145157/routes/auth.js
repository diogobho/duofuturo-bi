import express from 'express';
import { validateRequest, schemas } from '../middleware/validation.js';
import { login, register, refreshToken, logout, resetPassword } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', validateRequest(schemas.login), login);
router.post('/register', validateRequest(schemas.register), register);
router.post('/refresh', refreshToken);
router.post('/reset-password', validateRequest(schemas.resetPassword), resetPassword);

// Protected routes
router.post('/logout', verifyToken, logout);

export default router;
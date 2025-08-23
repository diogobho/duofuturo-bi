import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changePassword,
  getUserProfile
} from '../controllers/userController.js';

const router = express.Router();

// All user routes require authentication
router.use(verifyToken);

// Current user profile (any authenticated user)
router.get('/profile', getUserProfile);

// Creator-only routes
router.get('/', requireRole(['creator']), getUsers);
router.get('/:id', requireRole(['creator']), getUser);
router.put('/:id', requireRole(['creator']), validateRequest(schemas.updateUser), updateUser);
router.delete('/:id', requireRole(['creator']), deleteUser);

// Change password (users can change their own, creators can change any)
router.post('/:id/change-password', changePassword);

export default router;
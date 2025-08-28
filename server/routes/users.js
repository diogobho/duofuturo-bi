import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changePassword,
  getUserProfile
} from '../controllers/userController.js';

const router = express.Router();

router.use(verifyToken);

router.get('/profile', getUserProfile);
router.get('/', requireRole(['creator']), getUsers);
router.get('/:id', requireRole(['creator']), getUser);

router.post('/', requireRole(['creator']), async (req, res) => {
  try {
    const { username, password, nome, email, data_nascimento, endereco, role } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await pool.query(
      'INSERT INTO users (username, nome, email, senha, data_nascimento, endereco, role) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, nome, email, role, data_nascimento, endereco, created_at',
      [username, nome, email, hashedPassword, data_nascimento, endereco, role || 'viewer']
    );
    
    res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email or username already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', requireRole(['creator']), updateUser);
router.delete('/:id', requireRole(['creator']), deleteUser);
router.post('/:id/change-password', requireRole(['creator']), changePassword);

export default router;

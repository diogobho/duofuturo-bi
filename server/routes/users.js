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

// Create user
router.post('/', authenticateToken, requireCreator, async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, password, nome, email, data_nascimento, endereco, role } = req.body;

    const existingUser = await client.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Usuário ou email já existe' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await client.query(`
      INSERT INTO users (username, password, nome, email, data_nascimento, endereco, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, username, nome, email, data_nascimento, endereco, role, created_at
    `, [username, hashedPassword, nome, email, data_nascimento, endereco, role || 'viewer']);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

// Update user
router.put('/:id', authenticateToken, requireCreator, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.params.id;
    const { username, password, nome, email, data_nascimento, endereco, role } = req.body;

    const user = await client.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const existingUser = await client.query(
      'SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3',
      [username, email, userId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Usuário ou email já existe' });
    }

    let updateQuery, queryParams;

    if (password && password.trim() !== '') {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);
      updateQuery = `
        UPDATE users 
        SET username = $1, password = $2, nome = $3, email = $4, data_nascimento = $5, endereco = $6, role = $7
        WHERE id = $8
        RETURNING id, username, nome, email, data_nascimento, endereco, role, created_at
      `;
      queryParams = [username, hashedPassword, nome, email, data_nascimento, endereco, role || 'viewer', userId];
    } else {
      updateQuery = `
        UPDATE users 
        SET username = $1, nome = $2, email = $3, data_nascimento = $4, endereco = $5, role = $6
        WHERE id = $7
        RETURNING id, username, nome, email, data_nascimento, endereco, role, created_at
      `;
      queryParams = [username, nome, email, data_nascimento, endereco, role || 'viewer', userId];
    }

    const result = await client.query(updateQuery, queryParams);

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});
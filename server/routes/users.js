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

router.get("/profile", async (req, res) => { try { res.json({ user: req.user }); } catch (error) { console.error("Get profile error:", error); res.status(500).json({ error: "Internal server error" }); } });
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

// Get user's dashboards
router.get('/:id/dashboards', requireRole(['creator']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT d.*, ud.created_at as assigned_at
      FROM dashboards d
      JOIN user_dashboards ud ON d.id = ud.dashboard_id
      WHERE ud.user_id = $1
      ORDER BY d.nome
    `, [id]);
    
    res.json({ dashboards: result.rows });
  } catch (error) {
    console.error('Get user dashboards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboards not assigned to user
router.get('/:id/unassigned-dashboards', requireRole(['creator']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT d.id, d.nome, d.classe, d.descricao, d.url
      FROM dashboards d
      WHERE d.id NOT IN (
        SELECT dashboard_id 
        FROM user_dashboards 
        WHERE user_id = $1
      )
      ORDER BY d.nome
    `, [id]);
    
    res.json({ dashboards: result.rows });
  } catch (error) {
    console.error('Get unassigned dashboards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's dashboards
router.get('/:id/dashboards', requireRole(['creator']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT d.*, ud.created_at as assigned_at
      FROM dashboards d
      JOIN user_dashboards ud ON d.id = ud.dashboard_id
      WHERE ud.user_id = $1
      ORDER BY d.nome
    `, [id]);
    
    res.json({ dashboards: result.rows });
  } catch (error) {
    console.error('Get user dashboards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

import bcrypt from 'bcrypt';
import pool from '../config/db.js';

export const getUserProfile = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, nome, email, role, data_nascimento, endereco, created_at FROM users ORDER BY created_at DESC');
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, username, nome, email, role, data_nascimento, endereco, created_at FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, nome, email, password, data_nascimento, endereco, role } = req.body;
    
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
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, nome, email, data_nascimento, endereco, role } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET username = $1, nome = $2, email = $3, data_nascimento = $4, endereco = $5, role = $6, updated_at = NOW() WHERE id = $7 RETURNING id, username, nome, email, role, data_nascimento, endereco, updated_at',
      [username, nome, email, data_nascimento, endereco, role, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete user's dashboard assignments
    await pool.query('DELETE FROM user_dashboards WHERE user_id = $1', [id]);
    
    // Then delete the user
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const result = await pool.query(
      'UPDATE users SET senha = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [hashedPassword, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

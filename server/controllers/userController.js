import bcrypt from 'bcrypt';
import pool from '../config/database.js';

export const getUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, u.username, u.nome, u.email, u.data_nascimento, u.endereco, u.role, u.created_at, u.updated_at,
        COUNT(ud.dashboard_id) as dashboard_count
      FROM users u
      LEFT JOIN user_dashboards ud ON u.id = ud.user_id
      GROUP BY u.id, u.username, u.nome, u.email, u.data_nascimento, u.endereco, u.role, u.created_at, u.updated_at
      ORDER BY u.created_at DESC
    `;

    const result = await pool.query(query);
    
    res.json({
      users: result.rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        u.id, u.username, u.nome, u.email, u.data_nascimento, u.endereco, u.role, u.created_at, u.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', d.id,
              'nome', d.nome,
              'classe', d.classe
            )
          ) FILTER (WHERE d.id IS NOT NULL), '[]'
        ) as dashboards
      FROM users u
      LEFT JOIN user_dashboards ud ON u.id = ud.user_id
      LEFT JOIN dashboards d ON ud.dashboard_id = d.id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.nome, u.email, u.data_nascimento, u.endereco, u.role, u.created_at, u.updated_at
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, nome, email, data_nascimento, endereco, role } = req.body;

    // Check if user exists
    const userExistsQuery = 'SELECT id FROM users WHERE id = $1';
    const userExistsResult = await pool.query(userExistsQuery, [id]);

    if (userExistsResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for email/username conflicts with other users
    const conflictQuery = 'SELECT id FROM users WHERE (email = $1 OR username = $2) AND id != $3';
    const conflictResult = await pool.query(conflictQuery, [email, username, id]);

    if (conflictResult.rows.length > 0) {
      return res.status(409).json({ error: 'Email or username already exists' });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (username !== undefined) {
      updateFields.push(`username = $${paramCount++}`);
      updateValues.push(username);
    }
    if (nome !== undefined) {
      updateFields.push(`nome = $${paramCount++}`);
      updateValues.push(nome);
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramCount++}`);
      updateValues.push(email);
    }
    if (data_nascimento !== undefined) {
      updateFields.push(`data_nascimento = $${paramCount++}`);
      updateValues.push(data_nascimento);
    }
    if (endereco !== undefined) {
      updateFields.push(`endereco = $${paramCount++}`);
      updateValues.push(endereco);
    }
    if (role !== undefined) {
      updateFields.push(`role = $${paramCount++}`);
      updateValues.push(role);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, nome, email, data_nascimento, endereco, role, updated_at
    `;

    const result = await pool.query(updateQuery, updateValues);

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.userId;

    // Prevent self-deletion
    if (parseInt(id) === currentUserId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete user_dashboard relationships
      await client.query('DELETE FROM user_dashboards WHERE user_id = $1', [id]);
      
      // Delete user
      const deleteResult = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      
      if (deleteResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'User not found' });
      }
      
      await client.query('COMMIT');
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;
    const currentUserId = req.user.userId;

    // Users can only change their own password, unless they are creators
    if (req.user.role !== 'creator' && parseInt(id) !== currentUserId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Get current password for verification (only if changing own password)
    if (parseInt(id) === currentUserId && current_password) {
      const userQuery = 'SELECT password FROM users WHERE id = $1';
      const userResult = await pool.query(userQuery, [id]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(current_password, userResult.rows[0].password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password
    const updateQuery = 'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id';
    const result = await pool.query(updateQuery, [hashedPassword, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const query = `
      SELECT 
        u.id, u.username, u.nome, u.email, u.data_nascimento, u.endereco, u.role, u.created_at,
        COUNT(ud.dashboard_id) as dashboard_count
      FROM users u
      LEFT JOIN user_dashboards ud ON u.id = ud.user_id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.nome, u.email, u.data_nascimento, u.endereco, u.role, u.created_at
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
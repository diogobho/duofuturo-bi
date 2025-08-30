import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

export const getUserDashboards = async (req, res) => {
  try {
    let result;
    if (req.user.role === 'creator') {
      result = await pool.query('SELECT * FROM dashboards ORDER BY nome');
    } else {
      result = await pool.query(`
        SELECT d.*, ud.created_at as assigned_at 
        FROM dashboards d 
        JOIN user_dashboards ud ON d.id = ud.dashboard_id 
        WHERE ud.user_id = $1 ORDER BY d.nome
      `, [req.user.id]);
    }
    res.json({ dashboards: result.rows });
  } catch (error) {
    console.error('Get dashboards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createDashboard = async (req, res) => {
  try {
    const { nome, descricao, url, iframe, classe } = req.body;
    const result = await pool.query(
      'INSERT INTO dashboards (nome, descricao, url, iframe, classe) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nome, descricao || '', url, classe]
    );
    res.status(201).json({ message: 'Dashboard created successfully', dashboard: result.rows[0] });
  } catch (error) {
    console.error('Create dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, url, iframe, classe } = req.body;
    const result = await pool.query(
      'UPDATE dashboards SET nome = $1, descricao = $2, url = $3, classe = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [nome, descricao, url, classe, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    res.json({ message: 'Dashboard updated successfully', dashboard: result.rows[0] });
  } catch (error) {
    console.error('Update dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM dashboards WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    res.json({ message: 'Dashboard deleted successfully' });
  } catch (error) {
    console.error('Delete dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM dashboards WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    res.json({ dashboard: result.rows[0] });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignDashboard = async (req, res) => {
  try {
    const { userId, dashboardId } = req.body;
    await pool.query(
      'INSERT INTO user_dashboards (user_id, dashboard_id) VALUES ($1, $2) ON CONFLICT (user_id, dashboard_id) DO NOTHING',
      [userId, dashboardId]
    );
    res.json({ message: 'Dashboard assigned successfully' });
  } catch (error) {
    console.error('Assign dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unassignDashboard = async (req, res) => {
  try {
    const { userId, dashboardId } = req.body;
    await pool.query(
      'DELETE FROM user_dashboards WHERE user_id = $1 AND dashboard_id = $2',
      [userId, dashboardId]
    );
    res.json({ message: 'Dashboard unassigned successfully' });
  } catch (error) {
    console.error('Unassign dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTableauToken = async (req, res) => {
  try {
    const CONNECTED_APP_ID = '3a8d113d-e4dc-44eb-a3b9-e4d79ee60d8e';
    const SECRET_ID = '0c11222f-9cec-4b3c-a366-b9e896299272';
    const SECRET_VALUE = '4mtYgy+k+qonbIHB1XnCTYrMqumoivCy95+ezVx2joo=';
    const TABLEAU_USER = 'futuroncontato@gmail.com';
    
    const payload = {
      'iss': CONNECTED_APP_ID,
      'exp': Math.floor(Date.now() / 1000) + 600,
      'jti': randomUUID(),
      'aud': 'tableau',
      'sub': TABLEAU_USER,
      'scp': ['tableau:views:embed', 'tableau:views:embed_authoring']
    };
    
    const token = jwt.sign(payload, SECRET_VALUE, { 
      algorithm: 'HS256',
      header: { 'alg': 'HS256', 'typ': 'JWT', 'kid': SECRET_ID }
    });
    
    res.json({ token, expires_in: 600, user: TABLEAU_USER });
  } catch (error) {
    console.error('Tableau token error:', error);
    res.status(500).json({ error: 'Failed to generate Tableau token' });
  }
};

export const assignMultipleDashboards = async (req, res) => {
  try {
    const { userId, dashboardIds } = req.body;
    
    if (!Array.isArray(dashboardIds) || dashboardIds.length === 0) {
      return res.status(400).json({ error: 'dashboardIds must be a non-empty array' });
    }

    // Usar transação para garantir atomicidade
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const dashboardId of dashboardIds) {
        await client.query(
          'INSERT INTO user_dashboards (user_id, dashboard_id) VALUES ($1, $2) ON CONFLICT (user_id, dashboard_id) DO NOTHING',
          [userId, dashboardId]
        );
      }
      
      await client.query('COMMIT');
      res.json({ 
        message: `${dashboardIds.length} dashboards assigned successfully to user ${userId}`,
        assignedCount: dashboardIds.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Assign multiple dashboards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignDashboardToMultipleUsers = async (req, res) => {
  try {
    const { dashboardId, userIds } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds must be a non-empty array' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const userId of userIds) {
        await client.query(
          'INSERT INTO user_dashboards (user_id, dashboard_id) VALUES ($1, $2) ON CONFLICT (user_id, dashboard_id) DO NOTHING',
          [userId, dashboardId]
        );
      }
      
      await client.query('COMMIT');
      res.json({ 
        message: `Dashboard ${dashboardId} assigned successfully to ${userIds.length} users`,
        assignedCount: userIds.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Assign dashboard to multiple users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllAssignments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ud.id,
        ud.user_id,
        ud.dashboard_id,
        u.nome as user_name,
        u.email as user_email,
        u.username,
        d.nome as dashboard_name,
        d.classe as dashboard_class,
        ud.created_at as assigned_at
      FROM user_dashboards ud
      JOIN users u ON ud.user_id = u.id
      JOIN dashboards d ON ud.dashboard_id = d.id
      ORDER BY u.nome, d.nome
    `);
    
    res.json({ assignments: result.rows });
  } catch (error) {
    console.error('Get all assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUsersWithoutDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT u.id, u.nome, u.email, u.username, u.role
      FROM users u
      WHERE u.id NOT IN (
        SELECT user_id 
        FROM user_dashboards 
        WHERE dashboard_id = $1
      )
      ORDER BY u.nome
    `, [id]);
    
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users without dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboardsNotAssignedToUser = async (req, res) => {
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
    console.error('Get dashboards not assigned to user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

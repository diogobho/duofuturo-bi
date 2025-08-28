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
    const { nome, descricao, url, classe } = req.body;
    const result = await pool.query(
      'INSERT INTO dashboards (nome, descricao, url, classe) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, descricao || '', url, classe]
    );
    res.status(201).json({ message: 'Dashboard created successfully', dashboard: result.rows[0] });
  } catch (error) {
    console.error('Create dashboard error:', error);
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

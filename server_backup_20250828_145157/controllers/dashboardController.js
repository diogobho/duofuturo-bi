import pool from '../config/db.js';
import jwt from 'jsonwebtoken';

export const getUserDashboards = async (req, res) => {
  try {
    let result;
    
    if (req.user.role === 'creator') {
      // Creators see all dashboards
      result = await pool.query('SELECT * FROM dashboards ORDER BY nome');
    } else {
      // Viewers only see assigned dashboards
      result = await pool.query(`
        SELECT d.*, ud.created_at as assigned_at 
        FROM dashboards d 
        JOIN user_dashboards ud ON d.id = ud.dashboard_id 
        WHERE ud.user_id = $1
        ORDER BY d.nome
      `, [req.user.id]);
    }
    
    res.json({ dashboards: result.rows });
  } catch (error) {
    console.error('Get user dashboards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createDashboard = async (req, res) => {
  try {
    const { nome, descricao, url, classe } = req.body;
    
    const result = await pool.query(
      'INSERT INTO dashboards (nome, descricao, url, classe) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, descricao, url, classe]
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
    const JWT_SECRET = process.env.TABLEAU_EMBEDDED_SECRET || '4mtYgy+k+qonbIHB1XnCTYrMqumoivCy95+ezVx2joo=';
    const EMBEDDED_ID = process.env.TABLEAU_EMBEDDED_ID || '3a8d113d-e4dc-44eb-a3b9-e4d79ee60d8e';
    const USER_EMAIL = process.env.TABLEAU_USER_EMAIL || 'futuroncontato@gmail.com';
    
    const token = jwt.sign({
      iss: EMBEDDED_ID,
      exp: Math.floor(Date.now() / 1000) + (60 * 10),
      jti: Math.random().toString(36).substring(2, 15),
      aud: "tableau",
      sub: USER_EMAIL,
      scp: ["tableau:views:embed", "tableau:metrics:embed"]
    }, JWT_SECRET, { algorithm: 'HS256' });
    
    res.json({ token });
  } catch (error) {
    console.error('Get Tableau token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, url, classe } = req.body;
    
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

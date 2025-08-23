import pool from '../config/database.js';
import { generateTableauJWT, buildTableauUrl } from '../config/tableau.js';

export const getUserDashboards = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let query;
    let params;

    if (userRole === 'creator') {
      // Creators can see all dashboards
      query = `
        SELECT d.*, 
               CASE WHEN ud.user_id IS NOT NULL THEN true ELSE false END as has_access
        FROM dashboards d
        LEFT JOIN user_dashboards ud ON d.id = ud.dashboard_id AND ud.user_id = $1
        ORDER BY d.nome
      `;
      params = [userId];
    } else {
      // Viewers can only see assigned dashboards
      query = `
        SELECT d.*
        FROM dashboards d
        INNER JOIN user_dashboards ud ON d.id = ud.dashboard_id
        WHERE ud.user_id = $1
        ORDER BY d.nome
      `;
      params = [userId];
    }

    const result = await pool.query(query, params);
    
    res.json({
      dashboards: result.rows
    });
  } catch (error) {
    console.error('Get dashboards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check access
    let accessQuery;
    let accessParams;

    if (userRole === 'creator') {
      accessQuery = 'SELECT * FROM dashboards WHERE id = $1';
      accessParams = [id];
    } else {
      accessQuery = `
        SELECT d.*
        FROM dashboards d
        INNER JOIN user_dashboards ud ON d.id = ud.dashboard_id
        WHERE d.id = $1 AND ud.user_id = $2
      `;
      accessParams = [id, userId];
    }

    const dashboardResult = await pool.query(accessQuery, accessParams);

    if (dashboardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found or access denied' });
    }

    const dashboard = dashboardResult.rows[0];

    // Generate Tableau JWT
    const tableauToken = generateTableauJWT();

    res.json({
      dashboard: {
        ...dashboard,
        tableau_token: tableauToken
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createDashboard = async (req, res) => {
  try {
    const { classe, nome, iframe, link, link_mobile } = req.body;

    const insertQuery = `
      INSERT INTO dashboards (classe, nome, iframe, link, link_mobile, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [classe, nome, iframe, link, link_mobile]);
    const newDashboard = result.rows[0];

    res.status(201).json({
      message: 'Dashboard created successfully',
      dashboard: newDashboard
    });
  } catch (error) {
    console.error('Create dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const { classe, nome, iframe, link, link_mobile } = req.body;

    const updateQuery = `
      UPDATE dashboards 
      SET classe = $1, nome = $2, iframe = $3, link = $4, link_mobile = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [classe, nome, iframe, link, link_mobile, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    res.json({
      message: 'Dashboard updated successfully',
      dashboard: result.rows[0]
    });
  } catch (error) {
    console.error('Update dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete user_dashboard relationships
      await client.query('DELETE FROM user_dashboards WHERE dashboard_id = $1', [id]);
      
      // Delete dashboard
      const deleteResult = await client.query('DELETE FROM dashboards WHERE id = $1 RETURNING *', [id]);
      
      if (deleteResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Dashboard not found' });
      }
      
      await client.query('COMMIT');
      
      res.json({ message: 'Dashboard deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignDashboard = async (req, res) => {
  try {
    const { dashboardId, userId } = req.body;

    // Check if assignment already exists
    const existingQuery = 'SELECT id FROM user_dashboards WHERE user_id = $1 AND dashboard_id = $2';
    const existingResult = await pool.query(existingQuery, [userId, dashboardId]);

    if (existingResult.rows.length > 0) {
      return res.status(409).json({ error: 'Dashboard already assigned to user' });
    }

    // Create assignment
    const insertQuery = `
      INSERT INTO user_dashboards (user_id, dashboard_id, created_at)
      VALUES ($1, $2, NOW())
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [userId, dashboardId]);

    res.status(201).json({
      message: 'Dashboard assigned successfully',
      assignment: result.rows[0]
    });
  } catch (error) {
    console.error('Assign dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unassignDashboard = async (req, res) => {
  try {
    const { dashboardId, userId } = req.body;

    const deleteQuery = 'DELETE FROM user_dashboards WHERE user_id = $1 AND dashboard_id = $2 RETURNING *';
    const result = await pool.query(deleteQuery, [userId, dashboardId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ message: 'Dashboard unassigned successfully' });
  } catch (error) {
    console.error('Unassign dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTableauToken = async (req, res) => {
  try {
    const token = generateTableauJWT();
    
    res.json({
      token,
      expires_in: 600 // 10 minutes
    });
  } catch (error) {
    console.error('Get Tableau token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
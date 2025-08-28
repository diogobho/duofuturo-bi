import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import pool from '../config/db.js';
import {
  getUserDashboards,
  createDashboard,
  assignDashboard,
  unassignDashboard,
  getTableauToken
} from '../controllers/dashboardController.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getUserDashboards);
router.get('/tableau/token', getTableauToken);
router.post('/', requireRole(['creator']), createDashboard);
router.post('/assign', requireRole(['creator']), assignDashboard);
router.post('/unassign', requireRole(['creator']), unassignDashboard);

export default router;

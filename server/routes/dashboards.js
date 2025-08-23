import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';
import {
  getUserDashboards,
  getDashboard,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  assignDashboard,
  unassignDashboard,
  getTableauToken
} from '../controllers/dashboardController.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(verifyToken);

// Get user's dashboards
router.get('/', getUserDashboards);

// Get specific dashboard
router.get('/:id', getDashboard);

// Get Tableau token
router.get('/tableau/token', getTableauToken);

// Creator-only routes
router.post('/', requireRole(['creator']), validateRequest(schemas.dashboard), createDashboard);
router.put('/:id', requireRole(['creator']), validateRequest(schemas.dashboard), updateDashboard);
router.delete('/:id', requireRole(['creator']), deleteDashboard);
router.post('/assign', requireRole(['creator']), assignDashboard);
router.post('/unassign', requireRole(['creator']), unassignDashboard);

export default router;
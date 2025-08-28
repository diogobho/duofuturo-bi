import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import {
  getUserDashboards,
  getDashboard,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  assignDashboard,
  unassignDashboard,
  getTableauToken,
  assignMultipleDashboards,
  assignDashboardToMultipleUsers,
  getAllAssignments,
  getUsersWithoutDashboard,
  getDashboardsNotAssignedToUser
} from '../controllers/dashboardController.js';

const router = express.Router();

router.use(verifyToken);

// Rotas públicas para usuários autenticados
router.get('/', getUserDashboards);
router.get('/tableau/token', getTableauToken);
router.get('/assignments', requireRole(['creator']), getAllAssignments);
router.get('/:id', getDashboard);
router.get('/:id/unassigned-users', requireRole(['creator']), getUsersWithoutDashboard);

// Rotas administrativas (apenas creators)
router.post('/', requireRole(['creator']), createDashboard);
router.put('/:id', requireRole(['creator']), updateDashboard);
router.delete('/:id', requireRole(['creator']), deleteDashboard);
router.post('/assign', requireRole(['creator']), assignDashboard);
router.post('/assign-multiple', requireRole(['creator']), assignMultipleDashboards);
router.post('/assign-to-multiple-users', requireRole(['creator']), assignDashboardToMultipleUsers);
router.post('/unassign', requireRole(['creator']), unassignDashboard);

export default router;

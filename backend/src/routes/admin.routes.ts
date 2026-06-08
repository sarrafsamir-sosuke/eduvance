import { Router } from 'express';

import {
  getAdminDashboard,
  getRankingAlunos,
  listUsers,
} from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const adminRoutes = Router();

adminRoutes.use(authMiddleware);
adminRoutes.use(authorizeRoles('admin'));

adminRoutes.get('/dashboard', getAdminDashboard);
adminRoutes.get('/users', listUsers);
adminRoutes.get('/ranking', getRankingAlunos);

export default adminRoutes;

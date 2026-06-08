import { Router } from 'express';

import {
  getConversaById,
  getLimiteEduAI,
  listarConversas,
  perguntarEduAI,
  resetarLimiteIA,
} from '../controllers/eduai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const eduaiRoutes = Router();

eduaiRoutes.post('/perguntar', authMiddleware, perguntarEduAI);
eduaiRoutes.get('/conversas', authMiddleware, listarConversas);
eduaiRoutes.get('/conversas/:id', authMiddleware, getConversaById);
eduaiRoutes.get('/limite', authMiddleware, getLimiteEduAI);
eduaiRoutes.patch(
  '/resetar-limite',
  authMiddleware,
  authorizeRoles('admin'),
  resetarLimiteIA,
);

export default eduaiRoutes;

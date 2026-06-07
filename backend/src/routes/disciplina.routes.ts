import { Router } from 'express';

import {
  createDisciplina,
  getDisciplinaById,
  listDisciplinas,
} from '../controllers/disciplina.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const disciplinaRoutes = Router();

disciplinaRoutes.post(
  '/',
  authMiddleware,
  authorizeRoles('professor', 'admin'),
  createDisciplina,
);
disciplinaRoutes.get('/', authMiddleware, listDisciplinas);
disciplinaRoutes.get('/:id', authMiddleware, getDisciplinaById);

export default disciplinaRoutes;

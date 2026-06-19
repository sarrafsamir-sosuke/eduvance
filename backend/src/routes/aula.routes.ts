import { Router } from 'express';

import {
  createAula,
  deleteAula,
  getAulaById,
  listAulas,
  updateAula,
} from '../controllers/aula.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { uploadVideo } from '../middlewares/upload.middleware';

const aulaRoutes = Router();

aulaRoutes.post(
  '/',
  authMiddleware,
  authorizeRoles('professor', 'admin'),
  uploadVideo.single('video'),
  createAula,
);
aulaRoutes.get('/', authMiddleware, listAulas);
aulaRoutes.get('/:id', authMiddleware, getAulaById);
aulaRoutes.put('/:id', authMiddleware, authorizeRoles('professor', 'admin'), updateAula);
aulaRoutes.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('professor', 'admin'),
  deleteAula,
);

export default aulaRoutes;

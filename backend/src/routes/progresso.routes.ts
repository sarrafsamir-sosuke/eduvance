import { Router } from 'express';

import {
  concluirAula,
  getProgressoPorAula,
  listarMeuProgresso,
} from '../controllers/progresso.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const progressoRoutes = Router();

progressoRoutes.post('/concluir-aula', authMiddleware, concluirAula);
progressoRoutes.get('/me', authMiddleware, listarMeuProgresso);
progressoRoutes.get('/aulas/:aulaId', authMiddleware, getProgressoPorAula);

export default progressoRoutes;

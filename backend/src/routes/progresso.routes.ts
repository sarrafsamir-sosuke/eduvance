import { Router } from 'express';

import {
  concluirAula,
  getProgressoPorAula,
  getResumoProgresso,
  listarMeuProgresso,
} from '../controllers/progresso.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const progressoRoutes = Router();

progressoRoutes.post('/concluir-aula', authMiddleware, concluirAula);
progressoRoutes.get('/me', authMiddleware, listarMeuProgresso);
progressoRoutes.get('/resumo', authMiddleware, getResumoProgresso);
progressoRoutes.get('/aulas/:aulaId', authMiddleware, getProgressoPorAula);

export default progressoRoutes;

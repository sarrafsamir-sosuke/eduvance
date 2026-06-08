import { Router } from 'express';

import {
  createQuiz,
  getQuizById,
  listQuizzes,
  listarMeusResultados,
  responderQuiz,
} from '../controllers/quiz.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const quizRoutes = Router();

quizRoutes.post(
  '/',
  authMiddleware,
  authorizeRoles('professor', 'admin'),
  createQuiz,
);
quizRoutes.get('/', authMiddleware, listQuizzes);

// Esta rota fica antes de /:id para o Express nao tratar "me" como id.
quizRoutes.get('/me/resultados', authMiddleware, listarMeusResultados);

quizRoutes.get('/:id', authMiddleware, getQuizById);
quizRoutes.post('/:id/responder', authMiddleware, responderQuiz);

export default quizRoutes;

import { Router } from 'express';

import {
  getMeuPlano,
  upgradeParaPremium,
  voltarParaGratis,
} from '../controllers/plano.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const planoRoutes = Router();

planoRoutes.get('/me', authMiddleware, getMeuPlano);
planoRoutes.patch('/upgrade', authMiddleware, upgradeParaPremium);
planoRoutes.patch('/downgrade', authMiddleware, voltarParaGratis);

export default planoRoutes;

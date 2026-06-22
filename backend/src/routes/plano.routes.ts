import { Router } from 'express';

import {
  getMeuPlano,
  upgradeParaPremium,
  voltarParaGratis,
} from '../controllers/plano.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const planoRoutes = Router();

planoRoutes.get('/me', authMiddleware, getMeuPlano);
// Upgrade direto sem passar pelo pagamento e restrito a admin (uso operacional/seed).
// O fluxo de assinatura para alunos e feito por /api/payments.
planoRoutes.patch('/upgrade', authMiddleware, authorizeRoles('admin'), upgradeParaPremium);
planoRoutes.patch('/downgrade', authMiddleware, voltarParaGratis);

export default planoRoutes;

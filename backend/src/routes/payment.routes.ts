import { Router } from 'express';

import {
  checkPaymentStatus,
  createPremiumCheckout,
  getMyPayments,
  mercadoPagoWebhook,
  simulatePaymentApproved,
} from '../controllers/payment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const paymentRoutes = Router();

paymentRoutes.post('/create-checkout', authMiddleware, createPremiumCheckout);
paymentRoutes.post('/webhook', mercadoPagoWebhook);
paymentRoutes.get('/me', authMiddleware, getMyPayments);
paymentRoutes.get('/status/:paymentId', authMiddleware, checkPaymentStatus);
paymentRoutes.post('/simulate-approved', authMiddleware, simulatePaymentApproved);

export default paymentRoutes;

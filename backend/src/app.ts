import path from 'path';

import cors from 'cors';
import express from 'express';

import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';
import aulaRoutes from './routes/aula.routes';
import disciplinaRoutes from './routes/disciplina.routes';
import eduaiRoutes from './routes/eduai.routes';
import paymentRoutes from './routes/payment.routes';
import planoRoutes from './routes/plano.routes';
import progressoRoutes from './routes/progresso.routes';
import quizRoutes from './routes/quiz.routes';

const app = express();

const defaultOrigins = [
  'http://localhost:5180',
  'http://localhost:5173',
  'http://localhost:4173',
];

const frontendEnv = process.env.FRONTEND_URL?.split(',').map((url) => url.trim()).filter(Boolean) ?? [];
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...frontendEnv]));

app.use(
  cors({
    origin(origin, callback) {
      // Permite requests sem origem (curl, mobile, server-to-server) e qualquer dominio configurado.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Em producao, libera dominios vercel.app automaticamente para evitar block trivial.
      if (/\.vercel\.app$/.test(new URL(origin).hostname)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '2mb' }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/disciplinas', disciplinaRoutes);
app.use('/api/aulas', aulaRoutes);
app.use('/api/progresso', progressoRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/planos', planoRoutes);
app.use('/api/eduai', eduaiRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (_request, response) => {
  return response.json({ message: 'EduVance API funcionando' });
});

app.get('/api', (_request, response) => {
  return response.json({ message: 'EduVance API funcionando' });
});

export default app;

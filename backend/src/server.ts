import path from 'path';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { connectDatabase } from './config/database';
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';
import aulaRoutes from './routes/aula.routes';
import disciplinaRoutes from './routes/disciplina.routes';
import eduaiRoutes from './routes/eduai.routes';
import planoRoutes from './routes/plano.routes';
import progressoRoutes from './routes/progresso.routes';
import quizRoutes from './routes/quiz.routes';

dotenv.config();

const app = express();

connectDatabase();

app.use(cors());
app.use(express.json());

// Serve arquivos de upload (videos, imagens) como estaticos.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/disciplinas', disciplinaRoutes);
app.use('/api/aulas', aulaRoutes);
app.use('/api/progresso', progressoRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/planos', planoRoutes);
app.use('/api/eduai', eduaiRoutes);

// Rota inicial para testar rapidamente se a API esta online.
app.get('/', (_request, response) => {
  return response.json({ message: 'EduVance API funcionando 🚀' });
});

// Usa a porta do .env quando existir; caso contrario, usa 3333.
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`EduVance API rodando na porta ${PORT}`);
});

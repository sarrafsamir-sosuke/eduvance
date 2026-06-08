import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { connectDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import aulaRoutes from './routes/aula.routes';
import disciplinaRoutes from './routes/disciplina.routes';
import progressoRoutes from './routes/progresso.routes';
import quizRoutes from './routes/quiz.routes';

// Carrega as variaveis do arquivo .env, quando ele existir.
dotenv.config();

const app = express();

connectDatabase();

// Permite que o frontend acesse a API durante o desenvolvimento.
app.use(cors());

// Faz o Express entender JSON enviado no corpo das requisicoes.
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/disciplinas', disciplinaRoutes);
app.use('/api/aulas', aulaRoutes);
app.use('/api/progresso', progressoRoutes);
app.use('/api/quizzes', quizRoutes);

// Rota inicial para testar rapidamente se a API esta online.
app.get('/', (_request, response) => {
  return response.json({ message: 'EduVance API funcionando 🚀' });
});

// Usa a porta do .env quando existir; caso contrario, usa 3333.
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`EduVance API rodando na porta ${PORT}`);
});

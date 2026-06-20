import dotenv from 'dotenv';

dotenv.config();

import app from './app';
import { connectDatabase } from './config/database';

const PORT = process.env.PORT || 3333;

connectDatabase();

app.listen(PORT, () => {
  console.log(`EduVance API rodando na porta ${PORT}`);
});

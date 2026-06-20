import dotenv from 'dotenv';

dotenv.config();

import app from '../src/app';
import { connectDatabase } from '../src/config/database';

// Conecta uma unica vez por instancia serverless (reuso entre invocacoes).
let connectionPromise: Promise<void> | null = null;

function ensureDatabaseConnection() {
  if (!connectionPromise) {
    connectionPromise = connectDatabase().catch((error) => {
      // Reseta para permitir nova tentativa na proxima invocacao.
      connectionPromise = null;
      throw error;
    });
  }
  return connectionPromise;
}

export default async function handler(
  request: import('http').IncomingMessage,
  response: import('http').ServerResponse,
) {
  await ensureDatabaseConnection();
  return (app as unknown as (req: typeof request, res: typeof response) => unknown)(request, response);
}

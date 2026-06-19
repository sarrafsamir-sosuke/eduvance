import dns from 'dns';

import mongoose from 'mongoose';

// Garante resolucao DNS via Google quando o DNS local nao resolve MongoDB Atlas.
dns.setServers(['8.8.8.8', '8.8.4.4']);

export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI nao foi definida no arquivo .env');
    }

    await mongoose.connect(mongoUri);

    console.log('MongoDB conectado 🚀');
  } catch (error) {
    console.error('Erro ao conectar no MongoDB:', error);
  }
};

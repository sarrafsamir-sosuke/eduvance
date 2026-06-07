import mongoose from 'mongoose';

export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    // O backend precisa da string de conexao para falar com o MongoDB.
    if (!mongoUri) {
      throw new Error('MONGO_URI nao foi definida no arquivo .env');
    }

    await mongoose.connect(mongoUri);

    console.log('MongoDB conectado 🚀');
  } catch (error) {
    console.error('Erro ao conectar no MongoDB:', error);
  }
};

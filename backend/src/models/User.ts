import { Document, Schema, model } from 'mongoose';

import { PlanType } from '../utils/plan';

export type UserType = 'aluno' | 'professor' | 'admin';

export interface IUser extends Document {
  nome: string;
  email: string;
  senha: string;
  tipo: UserType;
  turma?: string;
  matricula?: string;
  xp: number;
  nivel: number;
  streak: number;
  lastStudyDate?: string;
  totalAulasConcluidas: number;
  plano: PlanType;
  aiPerguntasUsadas: number;
  aiLimitePerguntas: number;
}

const userSchema = new Schema<IUser>(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select: false impede que a senha venha nas buscas comuns.
    senha: {
      type: String,
      required: true,
      select: false,
    },
    tipo: {
      type: String,
      enum: ['aluno', 'professor', 'admin'],
      required: true,
    },
    turma: {
      type: String,
      trim: true,
    },
    matricula: {
      type: String,
      trim: true,
    },
    xp: {
      type: Number,
      default: 0,
    },
    nivel: {
      type: Number,
      default: 1,
    },
    streak: {
      type: Number,
      default: 0,
    },
    // Guarda apenas a data do ultimo estudo no formato YYYY-MM-DD.
    lastStudyDate: {
      type: String,
    },
    totalAulasConcluidas: {
      type: Number,
      default: 0,
    },
    plano: {
      type: String,
      enum: ['gratis', 'premium'],
      default: 'gratis',
    },
    aiPerguntasUsadas: {
      type: Number,
      default: 0,
    },
    aiLimitePerguntas: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  },
);

export default model<IUser>('User', userSchema);

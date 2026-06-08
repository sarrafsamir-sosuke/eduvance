import { Document, Schema, Types, model } from 'mongoose';

import { PlanType } from '../utils/plan';

export interface IQuestaoQuiz {
  pergunta: string;
  alternativas: string[];
  respostaCorreta: number;
  explicacao?: string;
}

export interface IQuiz extends Document {
  titulo: string;
  descricao?: string;
  disciplina: Types.ObjectId;
  aula?: Types.ObjectId;
  professor: Types.ObjectId;
  questoes: IQuestaoQuiz[];
  xpPorAcerto: number;
  ativo: boolean;
  planoMinimo: PlanType;
}

const questaoSchema = new Schema<IQuestaoQuiz>(
  {
    pergunta: {
      type: String,
      required: true,
      trim: true,
    },
    alternativas: {
      type: [String],
      required: true,
      validate: {
        validator: (alternativas: string[]) => alternativas.length > 0,
        message: 'A questao precisa ter pelo menos uma alternativa.',
      },
    },
    respostaCorreta: {
      type: Number,
      required: true,
    },
    explicacao: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const quizSchema = new Schema<IQuiz>(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    descricao: {
      type: String,
      trim: true,
    },
    disciplina: {
      type: Schema.Types.ObjectId,
      ref: 'Disciplina',
      required: true,
    },
    aula: {
      type: Schema.Types.ObjectId,
      ref: 'Aula',
    },
    professor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questoes: {
      type: [questaoSchema],
      required: true,
      validate: {
        validator: (questoes: IQuestaoQuiz[]) => questoes.length > 0,
        message: 'O quiz precisa ter pelo menos uma questao.',
      },
    },
    xpPorAcerto: {
      type: Number,
      default: 10,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
    planoMinimo: {
      type: String,
      enum: ['gratis', 'premium'],
      default: 'gratis',
    },
  },
  {
    timestamps: true,
  },
);

export default model<IQuiz>('Quiz', quizSchema);

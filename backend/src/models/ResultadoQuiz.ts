import { Document, Schema, Types, model } from 'mongoose';

export interface IResultadoQuiz extends Document {
  usuario: Types.ObjectId;
  quiz: Types.ObjectId;
  respostas: number[];
  acertos: number;
  totalQuestoes: number;
  nota: number;
  xpGanho: number;
  finalizadoEm: Date;
}

const resultadoQuizSchema = new Schema<IResultadoQuiz>(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    respostas: {
      type: [Number],
      default: [],
    },
    acertos: {
      type: Number,
      required: true,
    },
    totalQuestoes: {
      type: Number,
      required: true,
    },
    nota: {
      type: Number,
      required: true,
    },
    xpGanho: {
      type: Number,
      default: 0,
    },
    finalizadoEm: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Impede que o mesmo usuario receba XP duas vezes pelo mesmo quiz.
resultadoQuizSchema.index({ usuario: 1, quiz: 1 }, { unique: true });

export default model<IResultadoQuiz>('ResultadoQuiz', resultadoQuizSchema);

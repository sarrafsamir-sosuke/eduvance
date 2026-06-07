import { Document, Schema, Types, model } from 'mongoose';

export interface IDisciplina extends Document {
  nome: string;
  categoria: string;
  emoji: string;
  descricao?: string;
  professor?: Types.ObjectId;
}

const disciplinaSchema = new Schema<IDisciplina>(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    categoria: {
      type: String,
      required: true,
      trim: true,
    },
    emoji: {
      type: String,
      required: true,
      trim: true,
    },
    descricao: {
      type: String,
      trim: true,
    },
    // Quando existir, liga a disciplina ao usuario professor responsavel.
    professor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

export default model<IDisciplina>('Disciplina', disciplinaSchema);

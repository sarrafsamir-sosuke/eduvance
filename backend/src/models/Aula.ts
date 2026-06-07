import { Document, Schema, Types, model } from 'mongoose';

export interface IAula extends Document {
  titulo: string;
  descricao?: string;
  urlVideo?: string;
  disciplina: Types.ObjectId;
  professor: Types.ObjectId;
  modulo?: string;
  ordem: number;
  duracao?: number;
  xpReward: number;
}

const aulaSchema = new Schema<IAula>(
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
    urlVideo: {
      type: String,
      trim: true,
    },
    disciplina: {
      type: Schema.Types.ObjectId,
      ref: 'Disciplina',
      required: true,
    },
    professor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modulo: {
      type: String,
      trim: true,
    },
    ordem: {
      type: Number,
      default: 1,
    },
    duracao: {
      type: Number,
    },
    xpReward: {
      type: Number,
      default: 50,
    },
  },
  {
    timestamps: true,
  },
);

export default model<IAula>('Aula', aulaSchema);

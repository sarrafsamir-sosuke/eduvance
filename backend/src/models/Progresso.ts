import { Document, Schema, Types, model } from 'mongoose';

export interface IProgresso extends Document {
  usuario: Types.ObjectId;
  aula: Types.ObjectId;
  assistida: boolean;
  percentual: number;
  xpGanho: number;
  concluidaEm?: Date;
}

const progressoSchema = new Schema<IProgresso>(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    aula: {
      type: Schema.Types.ObjectId,
      ref: 'Aula',
      required: true,
    },
    assistida: {
      type: Boolean,
      default: false,
    },
    percentual: {
      type: Number,
      default: 0,
    },
    xpGanho: {
      type: Number,
      default: 0,
    },
    concluidaEm: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Um usuario so pode ter um registro de progresso para cada aula.
progressoSchema.index({ usuario: 1, aula: 1 }, { unique: true });

export default model<IProgresso>('Progresso', progressoSchema);

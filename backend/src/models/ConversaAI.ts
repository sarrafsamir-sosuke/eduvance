import { Document, Schema, Types, model } from 'mongoose';

export interface IConversaAI extends Document {
  usuario: Types.ObjectId;
  titulo: string;
  disciplinaContexto?: string;
}

const conversaAISchema = new Schema<IConversaAI>(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    disciplinaContexto: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export default model<IConversaAI>('ConversaAI', conversaAISchema);

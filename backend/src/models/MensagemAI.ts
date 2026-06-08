import { Document, Schema, Types, model } from 'mongoose';

export type MensagemAIRole = 'user' | 'assistant';

export interface IMensagemAI extends Document {
  conversa: Types.ObjectId;
  usuario: Types.ObjectId;
  role: MensagemAIRole;
  conteudo: string;
}

const mensagemAISchema = new Schema<IMensagemAI>(
  {
    conversa: {
      type: Schema.Types.ObjectId,
      ref: 'ConversaAI',
      required: true,
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    conteudo: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export default model<IMensagemAI>('MensagemAI', mensagemAISchema);

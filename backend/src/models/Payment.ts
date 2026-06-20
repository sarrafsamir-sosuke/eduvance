import { Document, Schema, Types, model } from 'mongoose';

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded' | 'unknown';

export interface IPayment extends Document {
  user: Types.ObjectId;
  plano: string;
  valor: number;
  status: PaymentStatus;
  mercadoPagoPreferenceId?: string;
  mercadoPagoPaymentId?: string;
  checkoutUrl?: string;
  externalReference?: string;
  raw?: Record<string, unknown>;
}

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plano: {
      type: String,
      default: 'premium',
    },
    valor: {
      type: Number,
      default: 49,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'refunded', 'unknown'],
      default: 'pending',
    },
    mercadoPagoPreferenceId: {
      type: String,
    },
    mercadoPagoPaymentId: {
      type: String,
    },
    checkoutUrl: {
      type: String,
    },
    externalReference: {
      type: String,
    },
    raw: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

export default model<IPayment>('Payment', paymentSchema);

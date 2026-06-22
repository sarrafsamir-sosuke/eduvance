import { api } from '../lib/api';
import type { EduVanceUser } from '../lib/types';

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded' | 'unknown';

export interface PaymentRecord {
  _id: string;
  user: string;
  plano: string;
  valor: number;
  status: PaymentStatus;
  mercadoPagoPreferenceId?: string;
  mercadoPagoPaymentId?: string;
  checkoutUrl?: string;
  externalReference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCheckoutResponse {
  checkoutUrl: string;
  preferenceId?: string;
  paymentId?: string;
  payment: PaymentRecord;
}

export interface PaymentStatusResponse {
  status: PaymentStatus;
  payment: PaymentRecord;
}

export interface SimulatePaymentResponse {
  message: string;
  user: EduVanceUser;
  payment: PaymentRecord;
}

export async function createPremiumCheckout() {
  const { data } = await api.post<CreateCheckoutResponse>('/payments/create-checkout');
  return data;
}

export async function getMyPayments() {
  const { data } = await api.get<PaymentRecord[]>('/payments/me');
  return data;
}

export async function checkPaymentStatus(paymentId: string) {
  const { data } = await api.get<PaymentStatusResponse>(`/payments/status/${paymentId}`);
  return data;
}

export async function simulatePaymentApproved() {
  const { data } = await api.post<SimulatePaymentResponse>('/payments/simulate-approved');
  return data;
}

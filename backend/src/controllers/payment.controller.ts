import { Request, Response } from 'express';
import { MercadoPagoConfig, Payment as MercadoPagoPayment, Preference } from 'mercadopago';
import { Types } from 'mongoose';

import PaymentModel, { IPayment, PaymentStatus } from '../models/Payment';
import User from '../models/User';
import { getAiLimitByPlan } from '../utils/plan';

const PREMIUM_PLAN = 'premium';
const PREMIUM_PRICE = 49;

type UnknownRecord = Record<string, unknown>;

function cleanUrl(value: string) {
  return value.replace(/\/$/, '');
}

function getFrontendUrl() {
  return cleanUrl(process.env.FRONTEND_URL || 'http://localhost:5180');
}

function getBackendUrl() {
  return cleanUrl(process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3333}`);
}

function getMercadoPagoClients() {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN nao foi definido.');
  }

  const client = new MercadoPagoConfig({
    accessToken,
    options: { timeout: 5000 },
  });

  return {
    preference: new Preference(client),
    payment: new MercadoPagoPayment(client),
  };
}

function normalizePaymentStatus(status?: string): PaymentStatus {
  if (status === 'approved') return 'approved';
  if (status === 'rejected') return 'rejected';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'refunded' || status === 'charged_back') return 'refunded';
  if (status === 'pending' || status === 'in_process' || status === 'authorized' || status === 'in_mediation') {
    return 'pending';
  }
  return 'unknown';
}

function stringFromUnknown(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number') return String(value);
  return undefined;
}

function extractPaymentId(request: Request): string | undefined {
  const body = request.body as UnknownRecord;
  const query = request.query as UnknownRecord;

  const bodyData = body.data as UnknownRecord | undefined;
  const queryData = query.data as UnknownRecord | undefined;

  const directId =
    stringFromUnknown(bodyData?.id) ||
    stringFromUnknown(queryData?.id) ||
    stringFromUnknown(query['data.id']) ||
    stringFromUnknown(body.id) ||
    stringFromUnknown(query.id) ||
    stringFromUnknown(body.payment_id) ||
    stringFromUnknown(query.payment_id);

  if (directId) return directId;

  const resource = stringFromUnknown(body.resource) || stringFromUnknown(query.resource);
  const match = resource?.match(/payments\/(\d+)/);

  return match?.[1];
}

async function activatePremiumForUser(userId: string) {
  return User.findByIdAndUpdate(
    userId,
    {
      plano: 'premium',
      aiLimitePerguntas: getAiLimitByPlan('premium'),
    },
    { new: true },
  ).select('-senha');
}

async function updateLocalPaymentFromMercadoPago(mpPaymentId: string) {
  const { payment } = getMercadoPagoClients();
  const mpPayment = await payment.get({ id: mpPaymentId });
  const status = normalizePaymentStatus(mpPayment.status);
  const externalReference = stringFromUnknown(mpPayment.external_reference);

  let localPayment = await PaymentModel.findOne({ mercadoPagoPaymentId: String(mpPayment.id) });

  if (!localPayment && externalReference) {
    localPayment = await PaymentModel.findOne({
      externalReference,
      plano: PREMIUM_PLAN,
    }).sort({ createdAt: -1 });
  }

  if (localPayment) {
    localPayment.status = status;
    localPayment.mercadoPagoPaymentId = String(mpPayment.id);
    localPayment.externalReference = externalReference || localPayment.externalReference;
    localPayment.raw = mpPayment as unknown as Record<string, unknown>;
    await localPayment.save();
  }

  if (status === 'approved' && externalReference) {
    await activatePremiumForUser(externalReference);
  }

  return { mpPayment, localPayment, status };
}

export const createPremiumCheckout = async (request: Request, response: Response) => {
  try {
    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    if (request.user.plano === 'premium') {
      return response.status(400).json({ message: 'Seu plano Premium ja esta ativo.' });
    }

    const { preference } = getMercadoPagoClients();
    const frontendUrl = getFrontendUrl();
    const backendUrl = getBackendUrl();
    const externalReference = request.user._id.toString();

    const mercadoPagoPreference = await preference.create({
      body: {
        items: [
          {
            id: 'eduvance-premium',
            title: 'EduVance Premium',
            quantity: 1,
            unit_price: PREMIUM_PRICE,
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: request.user.nome,
          email: request.user.email,
        },
        external_reference: externalReference,
        notification_url: `${backendUrl}/api/payments/webhook`,
        back_urls: {
          success: `${frontendUrl}/pagamento-efetuado`,
          failure: `${frontendUrl}/pagamento-falhou`,
          pending: `${frontendUrl}/pagamento-pendente`,
        },
        metadata: {
          userId: externalReference,
          plano: PREMIUM_PLAN,
        },
        auto_return: 'approved',
      },
      requestOptions: {
        idempotencyKey: `${externalReference}-${Date.now()}`,
      },
    });

    const checkoutUrl = mercadoPagoPreference.init_point || mercadoPagoPreference.sandbox_init_point;

    if (!checkoutUrl) {
      return response.status(502).json({ message: 'Mercado Pago nao retornou URL de checkout.' });
    }

    const payment = await PaymentModel.create({
      user: request.user._id,
      plano: PREMIUM_PLAN,
      valor: PREMIUM_PRICE,
      status: 'pending',
      mercadoPagoPreferenceId: mercadoPagoPreference.id,
      checkoutUrl,
      externalReference,
      raw: mercadoPagoPreference as unknown as Record<string, unknown>,
    });

    return response.status(201).json({
      checkoutUrl,
      preferenceId: mercadoPagoPreference.id,
      payment,
    });
  } catch (error) {
    return response.status(500).json({
      message: error instanceof Error ? error.message : 'Erro ao criar checkout Premium.',
      error,
    });
  }
};

export const mercadoPagoWebhook = async (request: Request, response: Response) => {
  try {
    console.log('Mercado Pago webhook recebido:', {
      query: request.query,
      body: request.body,
    });

    const paymentId = extractPaymentId(request);

    if (paymentId) {
      await updateLocalPaymentFromMercadoPago(paymentId);
    }

    return response.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook Mercado Pago:', error);
    return response.status(200).json({ received: true });
  }
};

export const getMyPayments = async (request: Request, response: Response) => {
  if (!request.user) {
    return response.status(401).json({ message: 'Usuario nao autenticado.' });
  }

  const payments = await PaymentModel.find({ user: request.user._id }).sort({ createdAt: -1 });

  return response.json(payments);
};

export const checkPaymentStatus = async (request: Request, response: Response) => {
  try {
    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    const paymentId = String(request.params.paymentId);
    const query = Types.ObjectId.isValid(paymentId) ? { _id: paymentId, user: request.user._id } : undefined;

    let payment: IPayment | null = query
      ? await PaymentModel.findOne(query)
      : await PaymentModel.findOne({
          user: request.user._id,
          $or: [{ mercadoPagoPaymentId: paymentId }, { mercadoPagoPreferenceId: paymentId }],
        });

    if (!payment) {
      return response.status(404).json({ message: 'Pagamento nao encontrado.' });
    }

    if (payment.status !== 'approved' && payment.mercadoPagoPaymentId) {
      const sync = await updateLocalPaymentFromMercadoPago(payment.mercadoPagoPaymentId);
      payment = sync.localPayment || payment;
    }

    if (payment.status === 'approved') {
      await activatePremiumForUser(request.user._id.toString());
    }

    return response.json({
      status: payment.status,
      payment,
    });
  } catch (error) {
    return response.status(500).json({
      message: error instanceof Error ? error.message : 'Erro ao consultar status do pagamento.',
      error,
    });
  }
};

export const simulatePaymentApproved = async (request: Request, response: Response) => {
  try {
    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    const user = await activatePremiumForUser(request.user._id.toString());

    if (!user) {
      return response.status(404).json({ message: 'Usuario nao encontrado.' });
    }

    const payment = await PaymentModel.create({
      user: request.user._id,
      plano: PREMIUM_PLAN,
      valor: PREMIUM_PRICE,
      status: 'approved',
      externalReference: request.user._id.toString(),
      raw: {
        simulated: true,
        approvedAt: new Date().toISOString(),
      },
    });

    return response.json({
      message: 'Pagamento simulado aprovado. Plano Premium ativado.',
      user,
      payment,
    });
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao simular aprovacao do pagamento.',
      error,
    });
  }
};

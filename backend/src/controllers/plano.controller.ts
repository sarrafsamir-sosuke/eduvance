import { Request, Response } from 'express';

import User from '../models/User';
import { getAiLimitByPlan, PlanType } from '../utils/plan';

const formatPlanoUser = (user: {
  _id: unknown;
  nome: string;
  email: string;
  tipo: string;
  plano?: PlanType;
  aiPerguntasUsadas?: number;
  aiLimitePerguntas?: number;
}) => {
  const plano = user.plano || 'gratis';

  return {
    id: user._id,
    nome: user.nome,
    email: user.email,
    tipo: user.tipo,
    plano,
    aiPerguntasUsadas: user.aiPerguntasUsadas || 0,
    aiLimitePerguntas: user.aiLimitePerguntas || getAiLimitByPlan(plano),
  };
};

export const getMeuPlano = async (request: Request, response: Response) => {
  if (!request.user) {
    return response.status(401).json({ message: 'Usuario nao autenticado.' });
  }

  const plano = request.user.plano || 'gratis';

  return response.json({
    plano,
    aiPerguntasUsadas: request.user.aiPerguntasUsadas || 0,
    aiLimitePerguntas:
      request.user.aiLimitePerguntas || getAiLimitByPlan(plano),
  });
};

export const upgradeParaPremium = async (
  request: Request,
  response: Response,
) => {
  try {
    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    const user = await User.findByIdAndUpdate(
      request.user._id,
      {
        plano: 'premium',
        aiLimitePerguntas: getAiLimitByPlan('premium'),
      },
      {
        new: true,
      },
    ).select('-senha');

    if (!user) {
      return response.status(404).json({ message: 'Usuario nao encontrado.' });
    }

    return response.json({
      message: 'Plano atualizado para premium.',
      user: formatPlanoUser(user),
    });
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao atualizar plano.',
      error,
    });
  }
};

export const voltarParaGratis = async (
  request: Request,
  response: Response,
) => {
  try {
    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    const user = await User.findByIdAndUpdate(
      request.user._id,
      {
        plano: 'gratis',
        aiLimitePerguntas: getAiLimitByPlan('gratis'),
      },
      {
        new: true,
      },
    ).select('-senha');

    if (!user) {
      return response.status(404).json({ message: 'Usuario nao encontrado.' });
    }

    return response.json({
      message: 'Plano atualizado para gratis.',
      user: formatPlanoUser(user),
    });
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao atualizar plano.',
      error,
    });
  }
};

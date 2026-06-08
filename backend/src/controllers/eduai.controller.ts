import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import ConversaAI from '../models/ConversaAI';
import MensagemAI from '../models/MensagemAI';
import User from '../models/User';
import { gerarRespostaEduAI } from '../services/eduai.service';
import { getAiLimitByPlan } from '../utils/plan';

const getAiUsage = (user: {
  plano?: 'gratis' | 'premium';
  aiPerguntasUsadas?: number;
  aiLimitePerguntas?: number;
}) => {
  const plano = user.plano || 'gratis';
  const aiPerguntasUsadas = user.aiPerguntasUsadas || 0;
  const aiLimitePerguntas = user.aiLimitePerguntas || getAiLimitByPlan(plano);

  return {
    plano,
    aiPerguntasUsadas,
    aiLimitePerguntas,
    perguntasRestantes: Math.max(aiLimitePerguntas - aiPerguntasUsadas, 0),
  };
};

const createConversationTitle = (pergunta: string) => {
  const title = pergunta.trim().slice(0, 60);

  return title.length < pergunta.trim().length ? `${title}...` : title;
};

export const perguntarEduAI = async (request: Request, response: Response) => {
  try {
    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    const { pergunta, disciplinaContexto, conversaId } = request.body;

    if (!pergunta || typeof pergunta !== 'string' || !pergunta.trim()) {
      return response.status(400).json({ message: 'Pergunta e obrigatoria.' });
    }

    const usage = getAiUsage(request.user);

    if (usage.aiPerguntasUsadas >= usage.aiLimitePerguntas) {
      return response.status(403).json({
        message: 'Você atingiu o limite de perguntas da EduAI para o seu plano.',
      });
    }

    let conversa;

    if (conversaId) {
      if (!isValidObjectId(conversaId)) {
        return response.status(400).json({ message: 'Id da conversa invalido.' });
      }

      conversa = await ConversaAI.findOne({
        _id: conversaId,
        usuario: request.user._id,
      });

      if (!conversa) {
        return response.status(404).json({ message: 'Conversa nao encontrada.' });
      }
    } else {
      conversa = await ConversaAI.create({
        usuario: request.user._id,
        titulo: createConversationTitle(pergunta),
        disciplinaContexto,
      });
    }

    // Salva a pergunta do usuario antes de gerar a resposta.
    await MensagemAI.create({
      conversa: conversa._id,
      usuario: request.user._id,
      role: 'user',
      conteudo: pergunta.trim(),
    });

    const resposta = await gerarRespostaEduAI(pergunta.trim(), disciplinaContexto);

    await MensagemAI.create({
      conversa: conversa._id,
      usuario: request.user._id,
      role: 'assistant',
      conteudo: resposta,
    });

    const usuarioAtualizado = await User.findByIdAndUpdate(
      request.user._id,
      {
        $inc: {
          aiPerguntasUsadas: 1,
        },
        $set: {
          plano: usage.plano,
          aiLimitePerguntas: usage.aiLimitePerguntas,
        },
      },
      {
        new: true,
      },
    ).select('-senha');

    const updatedUsage = getAiUsage(usuarioAtualizado || request.user);

    return response.json({
      resposta,
      conversaId: conversa._id,
      aiPerguntasUsadas: updatedUsage.aiPerguntasUsadas,
      aiLimitePerguntas: updatedUsage.aiLimitePerguntas,
      perguntasRestantes: updatedUsage.perguntasRestantes,
    });
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao perguntar para a EduAI.',
      error,
    });
  }
};

export const listarConversas = async (request: Request, response: Response) => {
  try {
    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    const conversas = await ConversaAI.find({ usuario: request.user._id }).sort({
      updatedAt: -1,
      createdAt: -1,
    });

    return response.json(conversas);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao listar conversas da EduAI.',
      error,
    });
  }
};

export const getConversaById = async (request: Request, response: Response) => {
  try {
    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    const { id } = request.params;

    if (!isValidObjectId(id)) {
      return response.status(400).json({ message: 'Id da conversa invalido.' });
    }

    const conversa = await ConversaAI.findOne({
      _id: id,
      usuario: request.user._id,
    });

    if (!conversa) {
      return response.status(404).json({ message: 'Conversa nao encontrada.' });
    }

    const mensagens = await MensagemAI.find({
      conversa: conversa._id,
      usuario: request.user._id,
    }).sort({ createdAt: 1 });

    return response.json({
      conversa,
      mensagens,
    });
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao buscar conversa da EduAI.',
      error,
    });
  }
};

export const getLimiteEduAI = async (request: Request, response: Response) => {
  if (!request.user) {
    return response.status(401).json({ message: 'Usuario nao autenticado.' });
  }

  return response.json(getAiUsage(request.user));
};

export const resetarLimiteIA = async (request: Request, response: Response) => {
  try {
    const { userId } = request.body;

    if (!userId || !isValidObjectId(userId)) {
      return response.status(400).json({ message: 'userId invalido.' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        aiPerguntasUsadas: 0,
      },
      {
        new: true,
      },
    ).select('-senha');

    if (!user) {
      return response.status(404).json({ message: 'Usuario nao encontrado.' });
    }

    return response.json({
      message: 'Limite da EduAI resetado com sucesso.',
      user,
    });
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao resetar limite da EduAI.',
      error,
    });
  }
};

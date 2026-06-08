import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import Aula from '../models/Aula';
import Progresso from '../models/Progresso';
import User from '../models/User';
import {
  calculateLevel,
  calculateStreak,
  getTodayDateBR,
} from '../utils/gamification';

const progressoPopulate = {
  path: 'aula',
  select: 'titulo descricao disciplina modulo ordem duracao xpReward',
  populate: {
    path: 'disciplina',
    select: 'nome categoria emoji',
  },
};

const formatProgressUser = (user: {
  _id: unknown;
  nome: string;
  email: string;
  xp?: number;
  nivel?: number;
  streak?: number;
  lastStudyDate?: string;
  totalAulasConcluidas?: number;
}) => {
  return {
    id: user._id,
    nome: user.nome,
    email: user.email,
    xp: user.xp || 0,
    nivel: user.nivel || 1,
    streak: user.streak || 0,
    lastStudyDate: user.lastStudyDate || null,
    totalAulasConcluidas: user.totalAulasConcluidas || 0,
  };
};

export const concluirAula = async (request: Request, response: Response) => {
  try {
    const { aulaId } = request.body;

    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    if (!aulaId || !isValidObjectId(aulaId)) {
      return response.status(400).json({ message: 'Id da aula invalido.' });
    }

    const aula = await Aula.findById(aulaId);

    if (!aula) {
      return response.status(404).json({ message: 'Aula nao encontrada.' });
    }

    const progressoExistente = await Progresso.findOne({
      usuario: request.user._id,
      aula: aula._id,
    });

    // Se a aula ja foi concluida, nao damos XP novamente.
    if (progressoExistente?.assistida) {
      return response.json({
        message: 'Aula ja concluida. XP nao foi somado novamente.',
        progresso: progressoExistente,
        user: formatProgressUser(request.user),
      });
    }

    const xpReward = aula.xpReward || 0;
    const today = getTodayDateBR();
    const streakResult = calculateStreak(
      request.user.streak || 0,
      request.user.lastStudyDate,
    );

    const progresso = await Progresso.findOneAndUpdate(
      {
        usuario: request.user._id,
        aula: aula._id,
      },
      {
        usuario: request.user._id,
        aula: aula._id,
        assistida: true,
        percentual: 100,
        xpGanho: xpReward,
        concluidaEm: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    const novoXp = (request.user.xp || 0) + xpReward;
    const novoNivel = calculateLevel(novoXp);
    const totalAulasConcluidas = (request.user.totalAulasConcluidas || 0) + 1;

    const usuarioAtualizado = await User.findByIdAndUpdate(
      request.user._id,
      {
        xp: novoXp,
        nivel: novoNivel,
        streak: streakResult.streak,
        lastStudyDate: today,
        totalAulasConcluidas,
      },
      {
        new: true,
      },
    ).select('-senha');

    return response.json({
      message: 'Aula concluida com sucesso.',
      progresso,
      xpGanho: xpReward,
      user: usuarioAtualizado ? formatProgressUser(usuarioAtualizado) : null,
    });
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao concluir aula.',
      error,
    });
  }
};

export const getResumoProgresso = async (
  request: Request,
  response: Response,
) => {
  try {
    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    const totalAulasDisponiveis = await Aula.countDocuments();
    const totalAulasConcluidas = await Progresso.countDocuments({
      usuario: request.user._id,
      assistida: true,
    });

    const percentualConcluido =
      totalAulasDisponiveis > 0
        ? Math.round((totalAulasConcluidas / totalAulasDisponiveis) * 100)
        : 0;

    const progressosRecentes = await Progresso.find({
      usuario: request.user._id,
      assistida: true,
    })
      .populate(progressoPopulate)
      .sort({ concluidaEm: -1, updatedAt: -1 })
      .limit(5);

    return response.json({
      xp: request.user.xp || 0,
      nivel: request.user.nivel || 1,
      streak: request.user.streak || 0,
      lastStudyDate: request.user.lastStudyDate || null,
      totalAulasConcluidas,
      totalAulasDisponiveis,
      percentualConcluido,
      progressosRecentes,
    });
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao buscar resumo do progresso.',
      error,
    });
  }
};

export const listarMeuProgresso = async (request: Request, response: Response) => {
  try {
    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    const progressos = await Progresso.find({ usuario: request.user._id })
      .populate(progressoPopulate)
      .sort({ updatedAt: -1 });

    return response.json(progressos);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao listar progresso.',
      error,
    });
  }
};

export const getProgressoPorAula = async (
  request: Request,
  response: Response,
) => {
  try {
    const { aulaId } = request.params;

    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    if (!isValidObjectId(aulaId)) {
      return response.status(400).json({ message: 'Id da aula invalido.' });
    }

    const aula = await Aula.findById(aulaId);

    if (!aula) {
      return response.status(404).json({ message: 'Aula nao encontrada.' });
    }

    const progresso = await Progresso.findOne({
      usuario: request.user._id,
      aula: aulaId,
    }).populate(progressoPopulate);

    if (!progresso) {
      return response.json({
        aula,
        assistida: false,
        percentual: 0,
        xpGanho: 0,
        concluidaEm: null,
      });
    }

    return response.json(progresso);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao buscar progresso da aula.',
      error,
    });
  }
};

import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import Aula from '../models/Aula';
import Progresso from '../models/Progresso';
import User from '../models/User';

const calcularNivel = (xp: number) => {
  if (xp >= 4000) return 5;
  if (xp >= 2000) return 4;
  if (xp >= 1000) return 3;
  if (xp >= 500) return 2;

  return 1;
};

const progressoPopulate = {
  path: 'aula',
  select: 'titulo descricao disciplina modulo ordem duracao xpReward',
  populate: {
    path: 'disciplina',
    select: 'nome categoria emoji',
  },
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
        xpAtual: request.user.xp,
        nivelAtual: request.user.nivel,
      });
    }

    const xpReward = aula.xpReward || 0;

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
    const novoNivel = calcularNivel(novoXp);

    const usuarioAtualizado = await User.findByIdAndUpdate(
      request.user._id,
      {
        xp: novoXp,
        nivel: novoNivel,
      },
      {
        new: true,
      },
    ).select('-senha');

    return response.json({
      message: 'Aula concluida com sucesso.',
      progresso,
      xpGanho: xpReward,
      usuario: usuarioAtualizado,
    });
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao concluir aula.',
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

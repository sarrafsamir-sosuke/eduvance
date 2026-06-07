import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import Aula from '../models/Aula';
import Disciplina from '../models/Disciplina';

const aulaPopulate = [
  { path: 'disciplina', select: 'nome categoria emoji' },
  { path: 'professor', select: 'nome email tipo' },
];

export const createAula = async (request: Request, response: Response) => {
  try {
    const {
      titulo,
      descricao,
      urlVideo,
      disciplina,
      professor,
      modulo,
      ordem,
      duracao,
      xpReward,
    } = request.body;

    if (!titulo || !disciplina) {
      return response.status(400).json({
        message: 'Titulo e disciplina sao obrigatorios.',
      });
    }

    if (!isValidObjectId(disciplina)) {
      return response.status(400).json({ message: 'Id da disciplina invalido.' });
    }

    const disciplinaExists = await Disciplina.findById(disciplina);

    if (!disciplinaExists) {
      return response.status(404).json({ message: 'Disciplina nao encontrada.' });
    }

    // Se o professor nao vier no body, usa o usuario logado como responsavel.
    const professorResponsavel = professor || request.user?._id;

    const aula = await Aula.create({
      titulo,
      descricao,
      urlVideo,
      disciplina,
      professor: professorResponsavel,
      modulo,
      ordem,
      duracao,
      xpReward,
    });

    const aulaCompleta = await Aula.findById(aula._id).populate(aulaPopulate);

    return response.status(201).json(aulaCompleta);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao criar aula.',
      error,
    });
  }
};

export const listAulas = async (request: Request, response: Response) => {
  try {
    const { disciplina } = request.query;
    const filter: { disciplina?: string } = {};

    // Permite listar todas as aulas ou filtrar por uma disciplina especifica.
    if (typeof disciplina === 'string') {
      if (!isValidObjectId(disciplina)) {
        return response.status(400).json({ message: 'Id da disciplina invalido.' });
      }

      filter.disciplina = disciplina;
    }

    const aulas = await Aula.find(filter)
      .populate(aulaPopulate)
      .sort({ ordem: 1, createdAt: -1 });

    return response.json(aulas);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao listar aulas.',
      error,
    });
  }
};

export const getAulaById = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    if (!isValidObjectId(id)) {
      return response.status(400).json({ message: 'Id da aula invalido.' });
    }

    const aula = await Aula.findById(id).populate(aulaPopulate);

    if (!aula) {
      return response.status(404).json({ message: 'Aula nao encontrada.' });
    }

    return response.json(aula);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao buscar aula.',
      error,
    });
  }
};

export const updateAula = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    if (!isValidObjectId(id)) {
      return response.status(400).json({ message: 'Id da aula invalido.' });
    }

    if (request.body.disciplina && !isValidObjectId(request.body.disciplina)) {
      return response.status(400).json({ message: 'Id da disciplina invalido.' });
    }

    const allowedFields = [
      'titulo',
      'descricao',
      'urlVideo',
      'disciplina',
      'professor',
      'modulo',
      'ordem',
      'duracao',
      'xpReward',
    ];

    const updateData: Record<string, unknown> = {};

    allowedFields.forEach((field) => {
      if (request.body[field] !== undefined) {
        updateData[field] = request.body[field];
      }
    });

    const aula = await Aula.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate(aulaPopulate);

    if (!aula) {
      return response.status(404).json({ message: 'Aula nao encontrada.' });
    }

    return response.json(aula);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao atualizar aula.',
      error,
    });
  }
};

export const deleteAula = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    if (!isValidObjectId(id)) {
      return response.status(400).json({ message: 'Id da aula invalido.' });
    }

    const aula = await Aula.findByIdAndDelete(id);

    if (!aula) {
      return response.status(404).json({ message: 'Aula nao encontrada.' });
    }

    return response.json({ message: 'Aula removida com sucesso.' });
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao deletar aula.',
      error,
    });
  }
};

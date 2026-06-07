import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import Disciplina from '../models/Disciplina';

export const createDisciplina = async (request: Request, response: Response) => {
  try {
    const { nome, categoria, emoji, descricao, professor } = request.body;

    if (!nome || !categoria || !emoji) {
      return response.status(400).json({
        message: 'Nome, categoria e emoji sao obrigatorios.',
      });
    }

    // Se um professor criar, ele vira o responsavel automaticamente.
    const professorResponsavel =
      professor || (request.user?.tipo === 'professor' ? request.user._id : undefined);

    const disciplina = await Disciplina.create({
      nome,
      categoria,
      emoji,
      descricao,
      professor: professorResponsavel,
    });

    return response.status(201).json(disciplina);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao criar disciplina.',
      error,
    });
  }
};

export const listDisciplinas = async (_request: Request, response: Response) => {
  try {
    const disciplinas = await Disciplina.find()
      .populate('professor', 'nome email tipo')
      .sort({ createdAt: -1 });

    return response.json(disciplinas);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao listar disciplinas.',
      error,
    });
  }
};

export const getDisciplinaById = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    if (!isValidObjectId(id)) {
      return response.status(400).json({ message: 'Id da disciplina invalido.' });
    }

    const disciplina = await Disciplina.findById(id).populate(
      'professor',
      'nome email tipo',
    );

    if (!disciplina) {
      return response.status(404).json({ message: 'Disciplina nao encontrada.' });
    }

    return response.json(disciplina);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao buscar disciplina.',
      error,
    });
  }
};

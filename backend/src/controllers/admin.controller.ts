import { Request, Response } from 'express';

import Aula from '../models/Aula';
import Disciplina from '../models/Disciplina';
import Progresso from '../models/Progresso';
import Quiz from '../models/Quiz';
import ResultadoQuiz from '../models/ResultadoQuiz';
import User, { UserType } from '../models/User';

const allowedUserTypes: UserType[] = ['aluno', 'professor', 'admin'];

export const getAdminDashboard = async (_request: Request, response: Response) => {
  try {
    const [
      totalUsuarios,
      totalAlunos,
      totalProfessores,
      totalAdmins,
      totalDisciplinas,
      totalAulas,
      totalQuizzes,
      totalAulasConcluidas,
      totalQuizzesRespondidos,
      mediaXPResult,
      top5AlunosPorXP,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ tipo: 'aluno' }),
      User.countDocuments({ tipo: 'professor' }),
      User.countDocuments({ tipo: 'admin' }),
      Disciplina.countDocuments(),
      Aula.countDocuments(),
      Quiz.countDocuments(),
      Progresso.countDocuments({ assistida: true }),
      ResultadoQuiz.countDocuments(),
      User.aggregate<{ mediaXPAlunos: number }>([
        { $match: { tipo: 'aluno' } },
        { $group: { _id: null, mediaXPAlunos: { $avg: '$xp' } } },
      ]),
      User.find({ tipo: 'aluno' })
        .select('nome email xp nivel streak totalAulasConcluidas')
        .sort({ xp: -1 })
        .limit(5),
    ]);

    return response.json({
      totalUsuarios,
      totalAlunos,
      totalProfessores,
      totalAdmins,
      totalDisciplinas,
      totalAulas,
      totalQuizzes,
      totalAulasConcluidas,
      totalQuizzesRespondidos,
      mediaXPAlunos: Math.round(mediaXPResult[0]?.mediaXPAlunos || 0),
      top5AlunosPorXP,
    });
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao buscar dashboard administrativo.',
      error,
    });
  }
};

export const listUsers = async (request: Request, response: Response) => {
  try {
    const { tipo } = request.query;
    const filter: { tipo?: UserType } = {};

    // Filtro opcional: /api/admin/users?tipo=aluno
    if (typeof tipo === 'string') {
      if (!allowedUserTypes.includes(tipo as UserType)) {
        return response.status(400).json({ message: 'Tipo de usuario invalido.' });
      }

      filter.tipo = tipo as UserType;
    }

    const users = await User.find(filter)
      .select('-senha')
      .sort({ createdAt: -1 });

    return response.json(users);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao listar usuarios.',
      error,
    });
  }
};

export const getRankingAlunos = async (request: Request, response: Response) => {
  try {
    const { limit } = request.query;
    const rankingQuery = User.find({ tipo: 'aluno' })
      .select('nome email xp nivel streak totalAulasConcluidas')
      .sort({ xp: -1 });

    if (typeof limit === 'string') {
      const parsedLimit = Number(limit);

      if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
        return response.status(400).json({ message: 'Limit invalido.' });
      }

      rankingQuery.limit(parsedLimit);
    }

    const ranking = await rankingQuery;

    return response.json(ranking);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao buscar ranking de alunos.',
      error,
    });
  }
};

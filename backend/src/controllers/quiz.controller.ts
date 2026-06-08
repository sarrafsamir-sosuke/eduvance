import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import Aula from '../models/Aula';
import Disciplina from '../models/Disciplina';
import Quiz, { IQuestaoQuiz } from '../models/Quiz';
import ResultadoQuiz from '../models/ResultadoQuiz';
import User from '../models/User';
import { calculateLevel } from '../utils/gamification';

const quizPopulate = [
  { path: 'disciplina', select: 'nome categoria emoji' },
  { path: 'aula', select: 'titulo modulo ordem xpReward' },
  { path: 'professor', select: 'nome email tipo' },
];

const resultadoPopulate = {
  path: 'quiz',
  select: 'titulo descricao disciplina aula xpPorAcerto',
  populate: [
    { path: 'disciplina', select: 'nome categoria emoji' },
    { path: 'aula', select: 'titulo modulo ordem' },
  ],
};

const formatQuizUser = (user: {
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

const validateQuestoes = (questoes: IQuestaoQuiz[]) => {
  if (!Array.isArray(questoes) || questoes.length === 0) {
    return 'O quiz precisa ter pelo menos uma questao.';
  }

  for (const questao of questoes) {
    if (!questao.pergunta) {
      return 'Todas as questoes precisam ter pergunta.';
    }

    if (!Array.isArray(questao.alternativas) || questao.alternativas.length === 0) {
      return 'Todas as questoes precisam ter alternativas.';
    }

    if (
      typeof questao.respostaCorreta !== 'number' ||
      questao.respostaCorreta < 0 ||
      questao.respostaCorreta >= questao.alternativas.length
    ) {
      return 'A respostaCorreta precisa ser o indice de uma alternativa valida.';
    }
  }

  return null;
};

export const createQuiz = async (request: Request, response: Response) => {
  try {
    const { titulo, descricao, disciplina, aula, questoes, xpPorAcerto } =
      request.body;

    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    if (!titulo || !disciplina || !questoes) {
      return response.status(400).json({
        message: 'Titulo, disciplina e questoes sao obrigatorios.',
      });
    }

    if (!isValidObjectId(disciplina)) {
      return response.status(400).json({ message: 'Id da disciplina invalido.' });
    }

    const questoesError = validateQuestoes(questoes);

    if (questoesError) {
      return response.status(400).json({ message: questoesError });
    }

    const disciplinaExists = await Disciplina.findById(disciplina);

    if (!disciplinaExists) {
      return response.status(404).json({ message: 'Disciplina nao encontrada.' });
    }

    if (aula) {
      if (!isValidObjectId(aula)) {
        return response.status(400).json({ message: 'Id da aula invalido.' });
      }

      const aulaExists = await Aula.findById(aula);

      if (!aulaExists) {
        return response.status(404).json({ message: 'Aula nao encontrada.' });
      }
    }

    const quiz = await Quiz.create({
      titulo,
      descricao,
      disciplina,
      aula,
      professor: request.user._id,
      questoes,
      xpPorAcerto,
    });

    const quizCompleto = await Quiz.findById(quiz._id).populate(quizPopulate);

    return response.status(201).json(quizCompleto);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao criar quiz.',
      error,
    });
  }
};

export const listQuizzes = async (_request: Request, response: Response) => {
  try {
    const quizzes = await Quiz.find({ ativo: true })
      .select('-questoes.respostaCorreta')
      .populate(quizPopulate)
      .sort({ createdAt: -1 });

    return response.json(quizzes);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao listar quizzes.',
      error,
    });
  }
};

export const getQuizById = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    if (!isValidObjectId(id)) {
      return response.status(400).json({ message: 'Id do quiz invalido.' });
    }

    const quizQuery = Quiz.findOne({ _id: id, ativo: true }).populate(quizPopulate);

    // Alunos nao veem a resposta correta antes de responder.
    if (request.user?.tipo === 'aluno') {
      quizQuery.select('-questoes.respostaCorreta');
    }

    const quiz = await quizQuery;

    if (!quiz) {
      return response.status(404).json({ message: 'Quiz nao encontrado.' });
    }

    return response.json(quiz);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao buscar quiz.',
      error,
    });
  }
};

export const responderQuiz = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const { respostas } = request.body;

    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    if (!isValidObjectId(id)) {
      return response.status(400).json({ message: 'Id do quiz invalido.' });
    }

    if (!Array.isArray(respostas)) {
      return response.status(400).json({ message: 'Respostas deve ser um array.' });
    }

    const quiz = await Quiz.findOne({ _id: id, ativo: true });

    if (!quiz) {
      return response.status(404).json({ message: 'Quiz nao encontrado.' });
    }

    const resultadoExistente = await ResultadoQuiz.findOne({
      usuario: request.user._id,
      quiz: quiz._id,
    }).populate(resultadoPopulate);

    if (resultadoExistente) {
      return response.json({
        message: 'Quiz ja respondido. XP nao foi somado novamente.',
        resultado: resultadoExistente,
        user: formatQuizUser(request.user),
      });
    }

    const correcoes = quiz.questoes.map((questao, index) => {
      const respostaAluno = respostas[index];
      const correta = respostaAluno === questao.respostaCorreta;

      return {
        pergunta: questao.pergunta,
        respostaAluno,
        respostaCorreta: questao.respostaCorreta,
        correta,
        explicacao: questao.explicacao || null,
      };
    });

    const acertos = correcoes.filter((correcao) => correcao.correta).length;
    const totalQuestoes = quiz.questoes.length;
    const nota =
      totalQuestoes > 0 ? Number(((acertos / totalQuestoes) * 10).toFixed(2)) : 0;
    const xpGanho = acertos * (quiz.xpPorAcerto || 0);

    const resultado = await ResultadoQuiz.create({
      usuario: request.user._id,
      quiz: quiz._id,
      respostas,
      acertos,
      totalQuestoes,
      nota,
      xpGanho,
      finalizadoEm: new Date(),
    });

    const novoXp = (request.user.xp || 0) + xpGanho;
    const novoNivel = calculateLevel(novoXp);

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

    const resultadoCompleto = await ResultadoQuiz.findById(resultado._id).populate(
      resultadoPopulate,
    );

    return response.status(201).json({
      message: 'Quiz respondido com sucesso.',
      resultado: resultadoCompleto,
      correcoes,
      user: usuarioAtualizado ? formatQuizUser(usuarioAtualizado) : null,
    });
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao responder quiz.',
      error,
    });
  }
};

export const listarMeusResultados = async (
  request: Request,
  response: Response,
) => {
  try {
    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    const resultados = await ResultadoQuiz.find({ usuario: request.user._id })
      .populate(resultadoPopulate)
      .sort({ finalizadoEm: -1, createdAt: -1 });

    return response.json(resultados);
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao listar resultados.',
      error,
    });
  }
};

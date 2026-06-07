import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import User, { IUser } from '../models/User';

const removePassword = (user: IUser) => {
  // Nunca devolvemos a senha para o cliente, mesmo quando ela esta criptografada.
  const { senha: _senha, ...userWithoutPassword } = user.toObject();

  return userWithoutPassword;
};

export const register = async (request: Request, response: Response) => {
  try {
    const { nome, email, senha, tipo, turma, matricula } = request.body;

    if (!nome || !email || !senha || !tipo) {
      return response.status(400).json({
        message: 'Nome, email, senha e tipo sao obrigatorios.',
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const userAlreadyExists = await User.findOne({ email: normalizedEmail });

    if (userAlreadyExists) {
      return response.status(400).json({ message: 'Este email ja esta em uso.' });
    }

    // O bcrypt transforma a senha em hash antes de salvar no banco.
    const hashedPassword = await bcrypt.hash(senha, 10);

    const user = await User.create({
      nome,
      email: normalizedEmail,
      senha: hashedPassword,
      tipo,
      turma,
      matricula,
    });

    return response.status(201).json(removePassword(user));
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao cadastrar usuario.',
      error,
    });
  }
};

export const login = async (request: Request, response: Response) => {
  try {
    const { email, senha } = request.body;

    if (!email || !senha) {
      return response.status(400).json({
        message: 'Email e senha sao obrigatorios.',
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Como a senha tem select: false no model, usamos +senha apenas no login.
    const user = await User.findOne({ email: normalizedEmail }).select('+senha');

    if (!user) {
      return response.status(401).json({ message: 'Email ou senha invalidos.' });
    }

    const passwordMatches = await bcrypt.compare(senha, user.senha);

    if (!passwordMatches) {
      return response.status(401).json({ message: 'Email ou senha invalidos.' });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return response.status(500).json({ message: 'JWT_SECRET nao foi definido.' });
    }

    // O token guarda o id do usuario para autenticar as proximas requisicoes.
    const token = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: '7d',
    });

    return response.json({
      token,
      user: removePassword(user),
    });
  } catch (error) {
    return response.status(500).json({
      message: 'Erro ao fazer login.',
      error,
    });
  }
};

export const me = async (request: Request, response: Response) => {
  return response.json(request.user);
};

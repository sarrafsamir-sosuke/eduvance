import crypto from 'crypto';

import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import User, { IUser } from '../models/User';

const logServerError = (context: string, error: unknown) => {
  if (error instanceof Error) {
    console.error(context, {
      message: error.message,
      stack: error.stack,
    });
    return;
  }

  console.error(context, error);
};

const serverErrorResponse = (message: string) => ({
  message,
  error: process.env.NODE_ENV === 'production' ? undefined : 'Consulte os logs do servidor para detalhes.',
});

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
    logServerError('Erro ao cadastrar usuario:', error);
    return response.status(500).json(serverErrorResponse('Erro ao cadastrar usuario.'));
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
      return response.status(401).json({ message: 'Credenciais invalidas.' });
    }

    const passwordMatches = await bcrypt.compare(senha, user.senha);

    if (!passwordMatches) {
      return response.status(401).json({ message: 'Credenciais invalidas.' });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('Erro no login: JWT_SECRET nao foi definido no ambiente.');
      return response.status(500).json({ message: 'Erro de configuracao do servidor.' });
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
    logServerError('Erro no login:', error);
    return response.status(500).json(serverErrorResponse('Erro ao fazer login.'));
  }
};

export const me = async (request: Request, response: Response) => {
  return response.json(request.user);
};

// Recuperacao de senha simples para o TCC: gera um token temporario.
// Nao envia email real; em desenvolvimento devolve o token no JSON para teste.
export const forgotPassword = async (request: Request, response: Response) => {
  try {
    const { email } = request.body;

    if (!email) {
      return response.status(400).json({ message: 'Email e obrigatorio.' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Resposta neutra: nao revela se o email existe.
    const genericMessage =
      'Se este email existir no EduVance, enviaremos um link de recuperacao.';

    if (!user) {
      return response.json({ message: genericMessage });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos
    await user.save();

    const isProduction = process.env.NODE_ENV === 'production';

    return response.json({
      message: genericMessage,
      // Apenas fora de producao expomos o token para facilitar o teste.
      ...(isProduction ? {} : { token, resetUrl: `/redefinir-senha/${token}` }),
    });
  } catch (error) {
    logServerError('Erro ao solicitar recuperacao de senha:', error);
    return response.status(500).json(serverErrorResponse('Erro ao solicitar recuperacao de senha.'));
  }
};

export const resetPassword = async (request: Request, response: Response) => {
  try {
    const { token, senha } = request.body;

    if (!token || !senha) {
      return response.status(400).json({ message: 'Token e nova senha sao obrigatorios.' });
    }

    if (String(senha).length < 6) {
      return response.status(400).json({ message: 'A nova senha precisa ter pelo menos 6 caracteres.' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return response.status(400).json({ message: 'Token invalido ou expirado.' });
    }

    user.senha = await bcrypt.hash(senha, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return response.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    logServerError('Erro ao redefinir senha:', error);
    return response.status(500).json(serverErrorResponse('Erro ao redefinir senha.'));
  }
};

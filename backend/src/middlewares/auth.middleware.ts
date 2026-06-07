import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import User, { IUser } from '../models/User';

interface AuthTokenPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return response.status(401).json({ message: 'Token nao informado.' });
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
      return response.status(401).json({ message: 'Token nao informado.' });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return response.status(500).json({ message: 'JWT_SECRET nao foi definido.' });
    }

    // O Bearer token precisa ser valido para liberar a rota protegida.
    const decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;
    const user = await User.findById(decoded.id);

    if (!user) {
      return response.status(401).json({ message: 'Usuario nao encontrado.' });
    }

    request.user = user;

    return next();
  } catch (error) {
    return response.status(401).json({
      message: 'Token invalido.',
      error,
    });
  }
};

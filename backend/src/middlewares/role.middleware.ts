import { NextFunction, Request, Response } from 'express';

import { UserType } from '../models/User';

export const authorizeRoles = (...roles: UserType[]) => {
  return (request: Request, response: Response, next: NextFunction) => {
    // Este middleware deve ser usado depois do authMiddleware.
    if (!request.user) {
      return response.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    if (!roles.includes(request.user.tipo)) {
      return response.status(403).json({
        message: 'Voce nao tem permissao para acessar este recurso.',
      });
    }

    return next();
  };
};

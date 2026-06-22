import rateLimit from 'express-rate-limit';

// Limite geral moderado para evitar abuso, sem atrapalhar uso normal nem testes locais.
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas requisicoes. Aguarde alguns instantes e tente novamente.' },
});

// Limites mais rigidos para rotas sensiveis (auth, IA, pagamento).
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
});

export const eduaiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas perguntas seguidas. Aguarde um instante para continuar.' },
});

export const paymentsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas de pagamento. Aguarde um instante para continuar.' },
});

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api, TOKEN_KEY, USER_KEY } from '../lib/api';
import type { AuthResponse, EduVanceUser, PlanType, UserType } from '../lib/types';

interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
  tipo: UserType;
  turma?: string;
  matricula?: string;
}

interface AuthContextValue {
  user: EduVanceUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<EduVanceUser>;
  register: (payload: RegisterPayload) => Promise<EduVanceUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: EduVanceUser) => void;
  setPlano: (plano: PlanType) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): EduVanceUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EduVanceUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<EduVanceUser | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState<boolean>(Boolean(localStorage.getItem(TOKEN_KEY)));

  const persistUser = useCallback((nextUser: EduVanceUser) => {
    setUserState(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  // Ao montar, se houver token, revalida o usuario com o backend.
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;

    api
      .get<EduVanceUser>('/auth/me')
      .then((response) => {
        if (active) persistUser(response.data);
      })
      .catch(() => {
        // Token invalido/expirado: limpa a sessao.
        if (active) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUserState(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, senha: string) => {
      const { data } = await api.post<AuthResponse>('/auth/login', {
        email: email.trim().toLowerCase(),
        senha,
      });

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      persistUser(data.user);
      return data.user;
    },
    [persistUser],
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    const { data } = await api.post<EduVanceUser>('/auth/register', {
      ...payload,
      email: payload.email.trim().toLowerCase(),
    });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUserState(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get<EduVanceUser>('/auth/me');
    persistUser(data);
  }, [persistUser]);

  const setPlano = useCallback(
    (plano: PlanType) => {
      setUserState((current) => {
        if (!current) return current;
        const next = { ...current, plano };
        localStorage.setItem(USER_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      refreshUser,
      setUser: persistUser,
      setPlano,
    }),
    [user, token, loading, login, register, logout, refreshUser, persistUser, setPlano],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.');
  }
  return context;
}

// Caminho do painel inicial conforme o tipo do usuario.
export function homePathForUser(user: EduVanceUser | null): string {
  if (!user) return '/login';
  if (user.tipo === 'professor') return '/professor/inicio';
  if (user.tipo === 'admin') return '/admin/inicio';
  return '/aluno/inicio';
}

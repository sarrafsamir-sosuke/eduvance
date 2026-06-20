import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api').replace(/\/$/, '');

// Origem do backend usada para arquivos estaticos, como videos enviados.
export const API_BASE_URL = rawApiUrl.replace(/\/api$/, '');
export const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export const TOKEN_KEY = 'eduvance_token';
export const USER_KEY = 'eduvance_user';

// Instancia unica do axios usada em todo o frontend.
export const api = axios.create({
  baseURL: API_URL,
});

// Antes de cada requisicao, anexa o token JWT salvo no localStorage.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Normaliza mensagens de erro vindas do backend para exibir ao usuario.
export function getApiErrorMessage(error: unknown, fallback = 'Não foi possível concluir a operação.'): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    return message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

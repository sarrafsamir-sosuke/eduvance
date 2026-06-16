import { useCallback, useEffect, useState } from 'react';

import { api, getApiErrorMessage } from './api';
import type { Aula, Disciplina } from './types';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string;
  reload: () => void;
}

// Hook genérico para chamadas GET com estado de loading/erro e recarregamento.
export function useApi<T>(path: string | null, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(path));
  const [error, setError] = useState('');
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    api
      .get<T>(path)
      .then((response) => {
        if (active) setData(response.data);
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, nonce, ...deps]);

  return { data, loading, error, reload };
}

// Catálogo (disciplinas + aulas) usado por várias telas do aluno.
export function useCatalogo() {
  const disciplinas = useApi<Disciplina[]>('/disciplinas');
  const aulas = useApi<Aula[]>('/aulas');

  return {
    disciplinas: disciplinas.data ?? [],
    aulas: aulas.data ?? [],
    loading: disciplinas.loading || aulas.loading,
    error: disciplinas.error || aulas.error,
  };
}

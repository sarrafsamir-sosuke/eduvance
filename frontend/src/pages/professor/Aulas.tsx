import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Badge, Button, EmptyState, Spinner } from '../../components/ui';
import { api, getApiErrorMessage } from '../../lib/api';
import { disciplinaIdOfAula, formatDuration } from '../../lib/helpers';
import { useApi, useCatalogo } from '../../lib/hooks';
import type { Aula } from '../../lib/types';

export function ProfessorAulasPage() {
  const navigate = useNavigate();
  const { disciplinas, aulas, loading } = useCatalogo();
  const aulasReq = useApi<Aula[]>('/aulas');
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [localAulas, setLocalAulas] = useState<Aula[] | null>(null);

  const list = localAulas ?? aulas;

  const byDisciplina = useMemo(() => {
    return disciplinas
      .map((d) => ({ disciplina: d, items: list.filter((a) => disciplinaIdOfAula(a) === d._id) }))
      .filter((g) => g.items.length > 0);
  }, [disciplinas, list]);

  async function handleDelete(id: string) {
    if (!window.confirm('Remover esta aula? Esta ação não pode ser desfeita.')) return;
    setRemoving(id);
    setError('');
    try {
      await api.delete(`/aulas/${id}`);
      setLocalAulas((prev) => (prev ?? aulas).filter((a) => a._id !== id));
      aulasReq.reload();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível remover a aula.'));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <AppLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Minhas aulas</h1>
            <span className="page-subtitle">{list.length} aulas publicadas</span>
          </div>
          <Button onClick={() => navigate('/professor/subir-aula')}>
            <Icon name="upload" size={16} /> Nova aula
          </Button>
        </div>

        {error ? <p className="form-feedback error">{error}</p> : null}

        {loading ? (
          <Spinner label="Carregando aulas..." />
        ) : byDisciplina.length === 0 ? (
          <EmptyState
            title="Nenhuma aula ainda"
            description="Publique sua primeira aula para os alunos."
            action={<Button onClick={() => navigate('/professor/subir-aula')}>Subir aula</Button>}
          />
        ) : (
          byDisciplina.map(({ disciplina, items }) => (
            <section className="discipline-section" key={disciplina._id}>
              <h2 className="discipline-section-title">
                <span aria-hidden="true">{disciplina.emoji ?? '📘'}</span> {disciplina.nome}
              </h2>
              <div className="prof-aula-list">
                {items
                  .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
                  .map((aula) => (
                    <article key={aula._id} className="prof-aula-row">
                      <span className="prof-aula-order">{aula.ordem ?? '-'}</span>
                      <div className="prof-aula-body">
                        <h3>{aula.titulo}</h3>
                        <p>
                          {aula.modulo ?? 'Módulo geral'} · {formatDuration(aula.duracao)} · {aula.xpReward ?? 50} XP
                        </p>
                      </div>
                      {aula.planoMinimo === 'premium' ? <Badge tone="yellow">Premium</Badge> : <Badge tone="green">Grátis</Badge>}
                      <div className="prof-aula-actions">
                        <button
                          type="button"
                          aria-label="Remover aula"
                          className="danger"
                          disabled={removing === aula._id}
                          onClick={() => handleDelete(aula._id)}
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          ))
        )}
      </div>
    </AppLayout>
  );
}

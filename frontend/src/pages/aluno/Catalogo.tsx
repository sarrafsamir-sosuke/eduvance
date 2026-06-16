import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { EmptyState, ProgressBar, Spinner } from '../../components/ui';
import {
  categoryGradient,
  categoryShort,
  disciplinaIdOfAula,
  fallbackProgress,
  normalize,
  professorName,
} from '../../lib/helpers';
import { useCatalogo } from '../../lib/hooks';

const FILTERS = ['Todas', 'Exatas', 'Humanas', 'Linguagens', 'Natureza', 'Técnica'];
const FILTER_MATCH: Record<string, string> = {
  Exatas: 'Matemática',
  Humanas: 'Humanas',
  Linguagens: 'Linguagens',
  Natureza: 'Natureza',
  Técnica: 'Técnica',
};

export function AlunoCatalogoPage() {
  const navigate = useNavigate();
  const { disciplinas, aulas, loading, error } = useCatalogo();
  const [filter, setFilter] = useState('Todas');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const lessonCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const aula of aulas) {
      const id = disciplinaIdOfAula(aula);
      if (id) map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [aulas]);

  const filtered = useMemo(() => {
    return disciplinas.filter((d) => {
      const matchesFilter = filter === 'Todas' || normalize(d.categoria).includes(normalize(FILTER_MATCH[filter] ?? filter));
      const matchesQuery = normalize(d.nome).includes(normalize(query));
      return matchesFilter && matchesQuery;
    });
  }, [disciplinas, filter, query]);

  return (
    <AppLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title display">Catálogo Completo</h1>
            <span className="page-subtitle">Explore todas as disciplinas e trilhe sua jornada de conhecimento.</span>
          </div>
          <label className="page-search">
            <Icon name="search" size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar disciplinas, tópicos..." />
          </label>
        </div>

        <div className="catalog-controls">
          <div className="filter-row">
            {FILTERS.map((item) => (
              <button key={item} type="button" className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>
                {item}
              </button>
            ))}
          </div>
          <div className="view-toggle" role="group" aria-label="Visualização">
            <button type="button" className={view === 'grid' ? 'active' : ''} aria-label="Grade" onClick={() => setView('grid')}>
              <Icon name="grid" size={16} />
            </button>
            <button type="button" className={view === 'list' ? 'active' : ''} aria-label="Lista" onClick={() => setView('list')}>
              <Icon name="list" size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <Spinner label="Carregando catálogo..." />
        ) : error ? (
          <EmptyState title="Não foi possível carregar" description={error} icon="shield" />
        ) : filtered.length === 0 ? (
          <EmptyState title="Nada encontrado" description="Tente outro filtro ou termo de busca." />
        ) : (
          <div className={view === 'grid' ? 'catalog-grid' : 'catalog-list'}>
            {filtered.map((d) => {
              const progress = fallbackProgress(d._id);
              return (
                <article
                  key={d._id}
                  className="catalog-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/aluno/disciplinas/${d._id}/aulas`)}
                >
                  <div className="catalog-card-top" style={{ background: categoryGradient(d.categoria) }}>
                    <span className="catalog-tag">{categoryShort(d.categoria)}</span>
                    <span className="catalog-emoji" aria-hidden="true">
                      {d.emoji ?? '📘'}
                    </span>
                  </div>
                  <div className="catalog-card-body">
                    <h3>{d.nome}</h3>
                    <p>
                      <Icon name="user" size={13} /> {professorName(d.professor)}
                    </p>
                    <div className="catalog-card-foot">
                      <span>{lessonCount.get(d._id) ?? 0} aulas</span>
                      <strong>{progress}%</strong>
                    </div>
                    <ProgressBar value={progress} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

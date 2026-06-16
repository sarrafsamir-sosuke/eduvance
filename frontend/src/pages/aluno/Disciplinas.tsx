import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DisciplineCard } from '../../components/DisciplineCard';
import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { EmptyState, Spinner } from '../../components/ui';
import { disciplinaIdOfAula, fallbackProgress, normalize } from '../../lib/helpers';
import { useCatalogo } from '../../lib/hooks';
import { AREAS } from '../../lib/types';

const FILTERS = ['Todas', ...AREAS.map((a) => a.categoria)];
const FILTER_LABELS: Record<string, string> = {
  Todas: 'Todas',
  'Linguagens e suas Tecnologias': 'Linguagens',
  'Matemática e suas Tecnologias': 'Matemática',
  'Ciências da Natureza e suas Tecnologias': 'C. Natureza',
  'Ciências Humanas e Sociais Aplicadas': 'Humanas',
  'Formação Técnica e Profissional': 'Técnica',
};

export function AlunoDisciplinasPage() {
  const navigate = useNavigate();
  const { disciplinas, aulas, loading, error } = useCatalogo();
  const [filter, setFilter] = useState('Todas');
  const [query, setQuery] = useState('');

  const lessonCountByDiscipline = useMemo(() => {
    const map = new Map<string, number>();
    for (const aula of aulas) {
      const id = disciplinaIdOfAula(aula);
      if (id) map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [aulas]);

  const filtered = useMemo(() => {
    return disciplinas.filter((d) => {
      const matchesFilter = filter === 'Todas' || d.categoria === filter;
      const matchesQuery = normalize(d.nome).includes(normalize(query));
      return matchesFilter && matchesQuery;
    });
  }, [disciplinas, filter, query]);

  // Agrupa por área seguindo a ordem da BNCC.
  const grouped = useMemo(() => {
    return AREAS.map((area) => ({
      area,
      items: filtered.filter((d) => d.categoria === area.categoria),
    })).filter((group) => group.items.length > 0);
  }, [filtered]);

  return (
    <AppLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Disciplinas</h1>
            <span className="page-subtitle">{disciplinas.length} disciplinas disponíveis</span>
          </div>
          <label className="page-search">
            <Icon name="search" size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar disciplina..." />
          </label>
        </div>

        <div className="filter-row" aria-label="Filtros de disciplinas">
          {FILTERS.map((item) => (
            <button key={item} type="button" className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>
              {FILTER_LABELS[item] ?? item}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner label="Carregando disciplinas..." />
        ) : error ? (
          <EmptyState title="Não foi possível carregar" description={error} icon="shield" />
        ) : grouped.length === 0 ? (
          <EmptyState
            title="Nenhuma disciplina encontrada"
            description="Ajuste o filtro ou busque por outro nome de disciplina."
          />
        ) : (
          grouped.map(({ area, items }) => (
            <section className="discipline-section" key={area.slug}>
              <h2 className="discipline-section-title">
                <span aria-hidden="true">{area.emoji}</span> {area.nome}
              </h2>
              <div className="discipline-grid">
                {items.map((d) => (
                  <DisciplineCard
                    key={d._id}
                    disciplina={d}
                    lessons={lessonCountByDiscipline.get(d._id) ?? 0}
                    progress={fallbackProgress(d._id)}
                    onAccess={() => navigate(`/aluno/disciplinas/${d._id}/aulas`)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </AppLayout>
  );
}

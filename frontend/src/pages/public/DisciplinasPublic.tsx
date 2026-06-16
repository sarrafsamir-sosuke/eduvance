import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DisciplineCard } from '../../components/DisciplineCard';
import { Icon } from '../../components/Icon';
import { PublicLayout } from '../../components/layouts/PublicLayout';
import { useAuth } from '../../context/AuthContext';
import { normalize } from '../../lib/helpers';
import { SHOWCASE_DISCIPLINAS } from '../../lib/showcase';
import { AREAS } from '../../lib/types';

const FILTERS = ['Todas', 'Linguagens', 'Matemática', 'Ciências da Natureza', 'Ciências Humanas', 'Formação Técnica'];

export function DisciplinasPublicPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [filter, setFilter] = useState('Todas');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return SHOWCASE_DISCIPLINAS.filter((d) => {
      const matchesFilter = filter === 'Todas' || normalize(d.categoria).includes(normalize(filter));
      const matchesQuery = normalize(d.nome).includes(normalize(query));
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  function handleAccess() {
    if (isAuthenticated && user?.tipo === 'aluno') {
      navigate('/aluno/disciplinas');
    } else if (isAuthenticated) {
      navigate('/aluno/disciplinas');
    } else {
      navigate('/cadastro');
    }
  }

  return (
    <PublicLayout>
      <section className="catalog-hero">
        <span className="eyebrow">
          <Icon name="book" size={15} /> Catálogo BNCC
        </span>
        <h1 className="display">Explore todas as disciplinas</h1>
        <p>Descubra as áreas de conhecimento do EduVance e comece a trilhar sua jornada de estudos.</p>
      </section>

      <section className="area-grid">
        {AREAS.map((area) => (
          <button
            key={area.slug}
            type="button"
            className="area-tile"
            style={{ background: area.gradient }}
            onClick={() => navigate(`/disciplinas/${area.slug}`)}
          >
            <span className="area-emoji" aria-hidden="true">
              {area.emoji}
            </span>
            <strong>{area.nome}</strong>
            <span className="area-go">
              Explorar <Icon name="arrowRight" size={16} />
            </span>
          </button>
        ))}
      </section>

      <section className="catalog-body">
        <div className="catalog-toolbar">
          <h2 className="display">Catálogo Completo</h2>
          <label className="page-search">
            <Icon name="search" size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar disciplina..."
            />
          </label>
        </div>

        <div className="filter-row" aria-label="Filtros">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              className={filter === item ? 'active' : ''}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="discipline-grid">
          {filtered.map((d) => (
            <DisciplineCard
              key={d._id}
              disciplina={d}
              lessons={d.aulas}
              progress={d.progressoDemo}
              onAccess={handleAccess}
              actionLabel={isAuthenticated ? 'Acessar' : 'Estudar grátis'}
            />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

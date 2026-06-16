import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Button, EmptyState, ProgressBar, Spinner } from '../../components/ui';
import { categoryGradient, disciplinaIdOfAula, fallbackProgress, professorName } from '../../lib/helpers';
import { useCatalogo } from '../../lib/hooks';
import { getAreaBySlug } from '../../lib/types';

export function AlunoAreaPage() {
  const { areaSlug } = useParams<{ areaSlug: string }>();
  const navigate = useNavigate();
  const area = getAreaBySlug(areaSlug);
  const { disciplinas, aulas, loading } = useCatalogo();

  const lessonCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const aula of aulas) {
      const id = disciplinaIdOfAula(aula);
      if (id) map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [aulas]);

  if (!area) {
    return (
      <AppLayout>
        <div className="page">
          <EmptyState
            title="Área não encontrada"
            description="Volte para as disciplinas e escolha uma área de conhecimento."
            action={<Button onClick={() => navigate('/aluno/disciplinas')}>Ver disciplinas</Button>}
          />
        </div>
      </AppLayout>
    );
  }

  const items = disciplinas.filter((d) => d.categoria === area.categoria);
  const shortName = area.nome.replace(' e suas Tecnologias', '').replace(' e Sociais Aplicadas', '');

  return (
    <AppLayout>
      <div className="page">
        <section className="area-header" style={{ background: area.gradient }}>
          <button className="area-breadcrumb" type="button" onClick={() => navigate('/aluno/disciplinas')}>
            Disciplinas <Icon name="chevronRight" size={14} /> Áreas de Conhecimento
          </button>
          <h1 className="display">
            <span aria-hidden="true">{area.emoji}</span> {shortName}
          </h1>
          <p>{area.descricao}</p>
          <div className="area-badges">
            <span>
              <Icon name="book" size={15} /> {items.length} Disciplinas
            </span>
            <span>
              <Icon name="play" size={15} /> {items.reduce((sum, d) => sum + (lessonCount.get(d._id) ?? 0), 0)} Aulas
            </span>
          </div>
        </section>

        {loading ? (
          <Spinner label="Carregando área..." />
        ) : items.length === 0 ? (
          <EmptyState title="Sem disciplinas nesta área ainda" description="Em breve novos conteúdos por aqui." />
        ) : (
          <div className="area-disciplines">
            {items.map((d) => {
              const progress = fallbackProgress(d._id);
              return (
                <article key={d._id} className="area-discipline-card">
                  <div className="area-discipline-top">
                    <span className="area-discipline-emoji" style={{ background: categoryGradient(d.categoria) }}>
                      {d.emoji ?? '📘'}
                    </span>
                    <span className="area-discipline-count">{lessonCount.get(d._id) ?? 0} aulas</span>
                  </div>
                  <h3>{d.nome}</h3>
                  <p>{d.descricao ?? 'Conteúdos essenciais desta disciplina.'}</p>
                  <div className="area-discipline-prof">
                    <span className="mini-avatar" aria-hidden="true">
                      <Icon name="user" size={14} />
                    </span>
                    {professorName(d.professor)}
                  </div>
                  <div className="discipline-progress">
                    <div className="discipline-progress-row">
                      <span>Progresso</span>
                      <strong>{progress}%</strong>
                    </div>
                    <ProgressBar value={progress} />
                  </div>
                  <Button full onClick={() => navigate(`/aluno/disciplinas/${d._id}/aulas`)}>
                    Acessar disciplina
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

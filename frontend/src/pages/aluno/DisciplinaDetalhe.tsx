import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Badge, Button, EmptyState, ProgressBar, Spinner } from '../../components/ui';
import {
  categoryGradient,
  disciplinaIdOfAula,
  formatDuration,
  groupAulasByModulo,
  professorName,
} from '../../lib/helpers';
import { useApi } from '../../lib/hooks';
import type { Aula, Disciplina, ProgressoItem } from '../../lib/types';

export function DisciplinaDetalhePage() {
  const { disciplinaId } = useParams<{ disciplinaId: string }>();
  const navigate = useNavigate();

  const disciplinas = useApi<Disciplina[]>('/disciplinas');
  const aulas = useApi<Aula[]>(disciplinaId ? `/aulas?disciplina=${disciplinaId}` : null, [disciplinaId]);
  const progresso = useApi<ProgressoItem[]>('/progresso/me');

  const disciplina = (disciplinas.data ?? []).find((d) => d._id === disciplinaId);
  const lessons = (aulas.data ?? []).filter((a) => disciplinaIdOfAula(a) === disciplinaId);

  const concluidas = useMemo(() => {
    const set = new Set<string>();
    for (const item of progresso.data ?? []) {
      if (item.assistida && item.aula?._id) set.add(item.aula._id);
    }
    return set;
  }, [progresso.data]);

  const modulos = useMemo(() => groupAulasByModulo(lessons), [lessons]);
  const totalLessons = lessons.length;
  const doneLessons = lessons.filter((a) => concluidas.has(a._id)).length;
  const progressPct = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;

  // Próxima aula = primeira não concluída na ordem.
  const ordered = useMemo(() => [...lessons].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)), [lessons]);
  const nextLesson = ordered.find((a) => !concluidas.has(a._id)) ?? ordered[0];

  if (disciplinas.loading || aulas.loading) {
    return (
      <AppLayout>
        <div className="page">
          <Spinner label="Carregando disciplina..." />
        </div>
      </AppLayout>
    );
  }

  if (!disciplina) {
    return (
      <AppLayout>
        <div className="page">
          <EmptyState
            title="Disciplina não encontrada"
            description="Ela pode ter sido removida. Volte e escolha outra disciplina."
            action={<Button onClick={() => navigate('/aluno/disciplinas')}>Ver disciplinas</Button>}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page">
        <button className="back-link" type="button" onClick={() => navigate('/aluno/disciplinas')}>
          <Icon name="arrowLeft" size={16} /> Voltar
        </button>

        <section className="discipline-hero" style={{ background: categoryGradient(disciplina.categoria) }}>
          <div className="discipline-hero-main">
            <span className="discipline-hero-emoji" aria-hidden="true">
              {disciplina.emoji ?? '📘'}
            </span>
            <div>
              <span className="discipline-hero-tag">{disciplina.categoria}</span>
              <h1 className="display">{disciplina.nome}</h1>
              <p>{disciplina.descricao ?? 'Trilha de aprendizado organizada por módulos.'}</p>
              <div className="discipline-hero-meta">
                <span>
                  <Icon name="user" size={15} /> {professorName(disciplina.professor)}
                </span>
                <span>
                  <Icon name="play" size={15} /> {totalLessons} aulas
                </span>
                <span>
                  <Icon name="check" size={15} /> {doneLessons} concluídas
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="discipline-detail-grid">
          <div className="trail">
            <h2 className="section-label">Trilha de aprendizado</h2>
            {totalLessons === 0 ? (
              <EmptyState title="Nenhuma aula publicada" description="Este conteúdo ainda está sendo preparado." />
            ) : (
              modulos.map((modulo, moduleIndex) => (
                <section className="module-block" key={modulo.modulo}>
                  <header className="module-head">
                    <span className="module-index">{moduleIndex + 1}</span>
                    <div>
                      <h3>{modulo.modulo}</h3>
                      <small>{modulo.aulas.length} aulas</small>
                    </div>
                  </header>
                  <div className="module-lessons">
                    {modulo.aulas.map((aula) => {
                      const done = concluidas.has(aula._id);
                      const isNext = nextLesson?._id === aula._id && !done;
                      return (
                        <article
                          key={aula._id}
                          className={`lesson-item${done ? ' is-done' : ''}${isNext ? ' is-next' : ''}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/aluno/aulas/${aula._id}`)}
                        >
                          <span className="lesson-status" aria-hidden="true">
                            <Icon name={done ? 'checkCircle' : isNext ? 'play' : 'lock'} size={18} />
                          </span>
                          <div className="lesson-item-body">
                            <h4>{aula.titulo}</h4>
                            <p>
                              {formatDuration(aula.duracao)} · {aula.xpReward ?? 50} XP
                              {aula.planoMinimo === 'premium' ? ' · Premium' : ''}
                            </p>
                          </div>
                          {done ? <Badge tone="green">Concluída</Badge> : isNext ? <Badge tone="blue">Em progresso</Badge> : null}
                          <Icon name="chevronRight" size={16} className="lesson-chevron" />
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>

          <aside className="discipline-side">
            <div className="progress-card">
              <h3>Seu progresso</h3>
              <div className="progress-ring-label">
                <strong>{progressPct}%</strong>
                <span>concluído</span>
              </div>
              <ProgressBar value={progressPct} />
              <ul className="progress-stats">
                <li>
                  <span>Aulas concluídas</span>
                  <strong>
                    {doneLessons}/{totalLessons}
                  </strong>
                </li>
                <li>
                  <span>XP disponível</span>
                  <strong>{lessons.reduce((sum, a) => sum + (a.xpReward ?? 0), 0)}</strong>
                </li>
                <li>
                  <span>Módulos</span>
                  <strong>{modulos.length}</strong>
                </li>
              </ul>
              {nextLesson ? (
                <Button full onClick={() => navigate(`/aluno/aulas/${nextLesson._id}`)}>
                  {doneLessons > 0 ? 'Continuar aula' : 'Começar agora'} <Icon name="arrowRight" size={16} />
                </Button>
              ) : null}
              <Button variant="outline" full onClick={() => navigate('/aluno/disciplinas')}>
                Ver outras disciplinas
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}

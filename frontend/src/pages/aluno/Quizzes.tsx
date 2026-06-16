import { useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Badge, EmptyState, Spinner } from '../../components/ui';
import { refName } from '../../lib/helpers';
import { useApi } from '../../lib/hooks';
import type { Quiz, ResultadoQuiz } from '../../lib/types';

export function QuizzesPage() {
  const navigate = useNavigate();
  const quizzes = useApi<Quiz[]>('/quizzes');
  const resultados = useApi<ResultadoQuiz[]>('/quizzes/me/resultados');

  const bestByQuiz = new Map<string, ResultadoQuiz>();
  for (const r of resultados.data ?? []) {
    const id = r.quiz?._id;
    if (!id) continue;
    const current = bestByQuiz.get(id);
    if (!current || (r.nota ?? 0) > (current.nota ?? 0)) bestByQuiz.set(id, r);
  }

  return (
    <AppLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Quizzes</h1>
            <span className="page-subtitle">Teste seus conhecimentos e ganhe XP por acerto.</span>
          </div>
        </div>

        {quizzes.loading ? (
          <Spinner label="Carregando quizzes..." />
        ) : quizzes.error ? (
          <EmptyState title="Não foi possível carregar" description={quizzes.error} icon="shield" />
        ) : (quizzes.data ?? []).length === 0 ? (
          <EmptyState title="Nenhum quiz disponível" description="Novos quizzes aparecerão aqui em breve." />
        ) : (
          <div className="quiz-grid">
            {(quizzes.data ?? []).map((quiz) => {
              const best = bestByQuiz.get(quiz._id);
              return (
                <article
                  key={quiz._id}
                  className="quiz-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/aluno/quizzes/${quiz._id}`)}
                >
                  <div className="quiz-card-head">
                    <span className="quiz-icon" aria-hidden="true">
                      <Icon name="check" size={20} />
                    </span>
                    {quiz.planoMinimo === 'premium' ? <Badge tone="yellow">Premium</Badge> : <Badge tone="green">Grátis</Badge>}
                  </div>
                  <h3>{quiz.titulo}</h3>
                  <p>{refName(quiz.disciplina as { nome?: string }, 'Disciplina')}</p>
                  <div className="quiz-card-foot">
                    <span>
                      <Icon name="list" size={14} /> {quiz.questoes?.length ?? 0} questões
                    </span>
                    {best ? (
                      <strong className="quiz-best">
                        <Icon name="star" size={14} /> {Math.round((best.nota ?? 0) * 10)}%
                      </strong>
                    ) : (
                      <span className="quiz-start">
                        Começar <Icon name="arrowRight" size={14} />
                      </span>
                    )}
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

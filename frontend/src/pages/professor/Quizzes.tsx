import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Badge, EmptyState, Spinner } from '../../components/ui';
import { refName } from '../../lib/helpers';
import { useApi } from '../../lib/hooks';
import type { Quiz } from '../../lib/types';

export function ProfessorQuizzesPage() {
  const quizzes = useApi<Quiz[]>('/quizzes');

  return (
    <AppLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Quizzes</h1>
            <span className="page-subtitle">Avaliações disponíveis para os alunos.</span>
          </div>
        </div>

        {quizzes.loading ? (
          <Spinner label="Carregando quizzes..." />
        ) : (quizzes.data ?? []).length === 0 ? (
          <EmptyState title="Nenhum quiz" description="Os quizzes criados aparecerão aqui." />
        ) : (
          <div className="quiz-grid">
            {(quizzes.data ?? []).map((quiz) => (
              <article key={quiz._id} className="quiz-card static">
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
                  <span>{quiz.xpPorAcerto ?? 10} XP/acerto</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

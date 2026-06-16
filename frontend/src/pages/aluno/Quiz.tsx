import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { Button, EmptyState, FullPageLoader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { api, getApiErrorMessage } from '../../lib/api';
import { refName } from '../../lib/helpers';
import { useApi } from '../../lib/hooks';
import type { Quiz } from '../../lib/types';

interface Correcao {
  pergunta: string;
  respostaAluno: number;
  respostaCorreta: number;
  correta: boolean;
  explicacao?: string;
}

interface QuizResultado {
  message: string;
  resultado: { acertos: number; totalQuestoes: number; nota: number; xpGanho: number };
  correcoes: Correcao[];
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const quizReq = useApi<Quiz>(quizId ? `/quizzes/${quizId}` : null, [quizId]);
  const quiz = quizReq.data;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<QuizResultado | null>(null);

  const total = quiz?.questoes?.length ?? 0;
  const answeredCount = Object.keys(answers).length;
  const progressPct = total ? Math.round(((current + 1) / total) * 100) : 0;
  const questao = quiz?.questoes?.[current];

  const disciplinaNome = useMemo(() => refName(quiz?.disciplina as { nome?: string }, 'Quiz'), [quiz]);

  function select(option: number) {
    setAnswers((prev) => ({ ...prev, [current]: option }));
  }

  async function handleSubmit() {
    if (!quizId || !quiz) return;
    setSubmitting(true);
    setError('');
    try {
      const respostas = quiz.questoes.map((_, index) => answers[index] ?? -1);
      const { data } = await api.post<QuizResultado>(`/quizzes/${quizId}/responder`, { respostas });
      setResult(data);
      await refreshUser().catch(() => undefined);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível enviar suas respostas.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (quizReq.loading) return <FullPageLoader />;

  if (!quiz) {
    return (
      <main className="quiz-shell">
        <div className="quiz-empty">
          <EmptyState
            title="Quiz não encontrado"
            description={quizReq.error || 'Este quiz pode estar indisponível para o seu plano.'}
            action={<Button onClick={() => navigate('/aluno/quizzes')}>Ver quizzes</Button>}
          />
        </div>
      </main>
    );
  }

  // Tela de resultado
  if (result) {
    const { resultado, correcoes } = result;
    const percentual = Math.round((resultado.nota ?? 0) * 10);
    const aprovado = percentual >= 60;
    return (
      <main className="quiz-shell">
        <div className="quiz-result">
          <span className={`quiz-result-badge ${aprovado ? 'pass' : 'fail'}`} aria-hidden="true">
            <Icon name={aprovado ? 'trophy' : 'target'} size={36} />
          </span>
          <h1 className="display">{aprovado ? 'Muito bem!' : 'Continue praticando!'}</h1>
          <p>
            Você acertou {resultado.acertos} de {resultado.totalQuestoes} questões.
          </p>

          <div className="quiz-result-stats">
            <div>
              <strong>{percentual}%</strong>
              <span>Aproveitamento</span>
            </div>
            <div>
              <strong>{resultado.acertos}/{resultado.totalQuestoes}</strong>
              <span>Acertos</span>
            </div>
            <div>
              <strong>+{resultado.xpGanho}</strong>
              <span>XP ganho</span>
            </div>
          </div>

          <div className="quiz-corrections">
            {correcoes.map((c, index) => (
              <article key={index} className={`quiz-correction${c.correta ? ' ok' : ' no'}`}>
                <span className="quiz-correction-ic" aria-hidden="true">
                  <Icon name={c.correta ? 'checkCircle' : 'close'} size={18} />
                </span>
                <div>
                  <h4>
                    {index + 1}. {c.pergunta}
                  </h4>
                  <p>
                    Resposta correta: <strong>{LETTERS[c.respostaCorreta]}</strong>
                    {!c.correta ? ` · Você marcou: ${c.respostaAluno >= 0 ? LETTERS[c.respostaAluno] : '—'}` : ''}
                  </p>
                  {c.explicacao ? <small>{c.explicacao}</small> : null}
                </div>
              </article>
            ))}
          </div>

          <div className="quiz-result-actions">
            <Button onClick={() => navigate('/aluno/quizzes')}>Voltar aos quizzes</Button>
            <Button variant="outline" onClick={() => navigate('/aluno/inicio')}>
              Ir para o início
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="quiz-shell">
      <header className="quiz-topbar">
        <button className="quiz-close" type="button" aria-label="Sair do quiz" onClick={() => navigate('/aluno/quizzes')}>
          <Icon name="close" size={20} />
        </button>
        <div className="quiz-topbar-title">
          <strong>{disciplinaNome}</strong>
          <span>{quiz.titulo}</span>
        </div>
        <span className="quiz-counter">
          Questão {current + 1} de {total}
        </span>
        <div className="quiz-topbar-progress">
          <span style={{ width: `${progressPct}%` }} />
        </div>
      </header>

      <div className="quiz-body">
        <aside className="quiz-nav" aria-label="Navegação de questões">
          <span className="quiz-nav-label">Navegação</span>
          <div className="quiz-nav-grid">
            {quiz.questoes.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`${index === current ? 'current' : ''}${answers[index] !== undefined ? ' answered' : ''}`}
                onClick={() => setCurrent(index)}
                aria-label={`Ir para questão ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="quiz-nav-progress">
            {answeredCount}/{total} respondidas
          </div>
        </aside>

        <section className="quiz-question">
          <span className="quiz-question-label">Questão {String(current + 1).padStart(2, '0')}</span>
          <h2>{questao?.pergunta}</h2>

          <div className="quiz-options">
            {questao?.alternativas.map((alt, index) => {
              const selected = answers[current] === index;
              return (
                <button
                  key={index}
                  type="button"
                  className={`quiz-option${selected ? ' selected' : ''}`}
                  onClick={() => select(index)}
                >
                  <span className="quiz-option-letter" aria-hidden="true">
                    {selected ? <Icon name="check" size={15} /> : LETTERS[index]}
                  </span>
                  <span className="quiz-option-text">{alt}</span>
                </button>
              );
            })}
          </div>

          {error ? <p className="form-feedback error">{error}</p> : null}

          <div className="quiz-controls">
            <Button variant="outline" disabled={current === 0} onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
              <Icon name="arrowLeft" size={16} /> Anterior
            </Button>
            {current < total - 1 ? (
              <Button onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}>
                Próxima <Icon name="arrowRight" size={16} />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={submitting} disabled={answeredCount === 0}>
                Finalizar quiz <Icon name="check" size={16} />
              </Button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

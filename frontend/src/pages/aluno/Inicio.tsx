import { useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Button, ProgressBar, StatCard } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { firstName, greeting, refId } from '../../lib/helpers';
import { useApi } from '../../lib/hooks';
import type { ConversaAI, EduAiLimite, PlanoInfo, ProgressoResumo } from '../../lib/types';

// XP necessário acumulado por nível (espelha as regras do backend).
const LEVEL_XP = [0, 0, 500, 1000, 2000, 4000, 7000, 11000, 16000];

function nextLevelTarget(nivel: number): number {
  return LEVEL_XP[nivel + 1] ?? LEVEL_XP[LEVEL_XP.length - 1] + 5000;
}

const WEEK_DAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

export function AlunoInicioPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const resumo = useApi<ProgressoResumo>('/progresso/resumo');
  const plano = useApi<PlanoInfo>('/planos/me');
  const limite = useApi<EduAiLimite>('/eduai/limite');
  const conversas = useApi<ConversaAI[]>('/eduai/conversas');

  const data = resumo.data;
  const xp = data?.xp ?? user?.xp ?? 0;
  const nivel = data?.nivel ?? user?.nivel ?? 1;
  const streak = data?.streak ?? user?.streak ?? 0;
  const totalAulas = data?.totalAulasConcluidas ?? user?.totalAulasConcluidas ?? 0;
  const target = nextLevelTarget(nivel);
  const prev = LEVEL_XP[nivel] ?? 0;
  const xpPercent = target > prev ? Math.min(100, Math.round(((xp - prev) / (target - prev)) * 100)) : 100;

  const recentes = data?.progressosRecentes ?? [];
  const recentConversas = (conversas.data ?? []).slice(0, 3);

  return (
    <AppLayout>
      <div className="dashboard">
        <div className="dashboard-greeting">
          <h1>
            {greeting()}, {firstName(user?.nome) || 'aluno'} <span aria-hidden="true">👋</span>
          </h1>
          <p>Continue de onde parou e mantenha seu ritmo de estudos.</p>
        </div>

        <div className="stats-grid">
          <StatCard icon="play" label="Aulas assistidas" value={String(totalAulas)} tone="blue" />
          <StatCard icon="check" label="Quizzes & exercícios" value={String(Math.max(0, totalAulas * 3))} tone="green" />
          <StatCard icon="flame" label="Sequência atual" value={`${streak} dias`} tone="red" />
          <StatCard icon="star" label="Plano atual" value={(plano.data?.plano ?? user?.plano ?? 'gratis') === 'premium' ? 'Premium' : 'Grátis'} tone="yellow" />
        </div>

        <section className="level-banner">
          <span className="level-badge" aria-hidden="true">
            <Icon name="star" size={22} />
          </span>
          <div className="level-banner-label">
            <small>Nível atual</small>
            <strong>LVL {nivel}</strong>
          </div>
          <div className="level-progress">
            <div className="xp-row">
              <span>{xp.toLocaleString('pt-BR')} XP</span>
              <span>{target.toLocaleString('pt-BR')} XP para o Nível {nivel + 1}</span>
            </div>
            <ProgressBar value={xpPercent} />
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="panel continue-panel">
            <div className="panel-head">
              <h2>Continue estudando</h2>
              <button type="button" onClick={() => navigate('/aluno/disciplinas')}>
                Ver tudo
              </button>
            </div>
            {recentes.length > 0 ? (
              recentes.map((item) => {
                const aulaId = item.aula?._id;
                const disc = typeof item.aula?.disciplina === 'object' ? item.aula?.disciplina : undefined;
                return (
                  <article
                    className="lesson-row"
                    key={item._id}
                    onClick={() => aulaId && navigate(`/aluno/aulas/${aulaId}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="lesson-emoji">{disc?.emoji ?? '📘'}</span>
                    <div className="lesson-row-body">
                      <h3>{item.aula?.titulo ?? 'Aula'}</h3>
                      <p>{item.aula?.modulo ?? disc?.nome ?? 'Concluída'}</p>
                      <ProgressBar value={item.percentual ?? 100} />
                    </div>
                    <span className="lesson-go" aria-hidden="true">
                      <Icon name="arrowRight" size={16} />
                    </span>
                  </article>
                );
              })
            ) : (
              <div className="panel-empty">
                <p>Você ainda não concluiu aulas. Comece agora e ganhe seus primeiros XP!</p>
                <Button onClick={() => navigate('/aluno/disciplinas')}>Explorar disciplinas</Button>
              </div>
            )}
          </section>

          <section className="panel eduai-panel">
            <div className="panel-head">
              <h2>EduAI</h2>
              <button type="button" onClick={() => navigate('/aluno/eduai')}>
                Ver tudo
              </button>
            </div>
            {recentConversas.length > 0 ? (
              recentConversas.map((conversa) => (
                <article
                  className="ai-row"
                  key={conversa._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/aluno/eduai?conversa=${conversa._id}`)}
                >
                  <span className="ai-badge" aria-hidden="true">
                    <Icon name="robot" size={16} />
                  </span>
                  <p>{conversa.titulo}</p>
                </article>
              ))
            ) : (
              <p className="panel-empty-text">
                Tire dúvidas com a EduAI. Você tem {limite.data?.perguntasRestantes ?? 5} perguntas hoje.
              </p>
            )}
            <Button variant="outline" full onClick={() => navigate('/aluno/eduai')}>
              <Icon name="sparkles" size={16} /> Nova conversa
            </Button>
          </section>

          <aside className="dashboard-side">
            <section className="panel">
              <h2 className="panel-title-sm">Próximas aulas</h2>
              {[
                ['14', 'JUN', 'Física: Leis de Newton', '14:00 · Prof. Lúcia'],
                ['15', 'JUN', 'Química: Tabela Periódica', '09:00 · Prof. Denis'],
              ].map(([day, month, title, meta]) => (
                <article className="class-row" key={title}>
                  <span className="class-date">
                    <strong>{day}</strong>
                    <small>{month}</small>
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{meta}</p>
                  </div>
                </article>
              ))}
            </section>

            <section className="streak-panel">
              <span className="streak-flame" aria-hidden="true">
                <Icon name="flame" size={26} />
              </span>
              <strong>{streak} dias!</strong>
              <p>Você está pegando fogo. Mantenha a sequência!</p>
              <div className="week-row" aria-hidden="true">
                {WEEK_DAYS.map((d, i) => (
                  <span key={i} className={i < Math.min(streak, 7) ? 'on' : ''}>
                    {d}
                  </span>
                ))}
              </div>
            </section>
          </aside>

          <section className="panel achievements-panel">
            <div className="panel-head">
              <h2>Conquistas recentes</h2>
              <button type="button" onClick={() => navigate('/aluno/conquistas')}>
                Ver todas
              </button>
            </div>
            <div className="achievement-list">
              {[
                ['trophy', 'Primeiros passos', 'Primeira aula concluída'],
                ['flame', 'Em chamas', `${streak} dias de sequência`],
                ['star', 'Colecionador de XP', `${xp.toLocaleString('pt-BR')} XP acumulados`],
              ].map(([icon, title, meta]) => (
                <article key={title}>
                  <span className="achievement-ic" aria-hidden="true">
                    <Icon name={icon} size={18} />
                  </span>
                  <strong>{title}</strong>
                  <p>{meta}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

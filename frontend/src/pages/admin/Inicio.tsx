import { useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Badge, Spinner, StatCard } from '../../components/ui';
import { useApi } from '../../lib/hooks';
import type { AdminDashboard, Disciplina, EduVanceUser } from '../../lib/types';

// Mini gráfico de área (SVG) para "Acessos nos últimos 30 dias" — visual de apoio.
const ACCESS_POINTS = [12, 18, 16, 22, 28, 24, 30, 34, 30, 40, 38, 46];

function AccessChart() {
  const max = Math.max(...ACCESS_POINTS);
  const width = 640;
  const height = 180;
  const step = width / (ACCESS_POINTS.length - 1);
  const points = ACCESS_POINTS.map((v, i) => [i * step, height - (v / max) * (height - 20)] as const);
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg className="access-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Gráfico de acessos">
      <defs>
        <linearGradient id="accessFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--blue)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#accessFill)" />
      <path d={line} fill="none" stroke="var(--blue)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AdminInicioPage() {
  const navigate = useNavigate();
  const dashboard = useApi<AdminDashboard>('/admin/dashboard');
  const usuarios = useApi<EduVanceUser[]>('/admin/users');
  const disciplinas = useApi<Disciplina[]>('/disciplinas');

  const d = dashboard.data;
  const recentes = (usuarios.data ?? []).slice(0, 5);

  if (dashboard.loading) {
    return (
      <AppLayout>
        <div className="page">
          <Spinner label="Carregando painel..." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title display">Dashboard</h1>
            <span className="page-subtitle">Visão geral da plataforma EduVance.</span>
          </div>
          <div className="admin-badges">
            <Badge tone="slate">Colégio EduVance</Badge>
            <Badge tone="blue">Plano Enterprise</Badge>
          </div>
        </div>

        <div className="admin-stats">
          <StatCard icon="users" label="Total de alunos" value={String(d?.totalAlunos ?? 0)} tone="blue" hint="+12% este mês" hintTone="up" />
          <StatCard icon="user" label="Professores" value={String(d?.totalProfessores ?? 0)} tone="purple" hint="estável" hintTone="flat" />
          <StatCard icon="book" label="Disciplinas" value={String(d?.totalDisciplinas ?? 0)} tone="green" hint={`${d?.totalAulas ?? 0} aulas`} hintTone="flat" />
          <StatCard icon="play" label="Aulas" value={String(d?.totalAulas ?? 0)} tone="yellow" hint={`${d?.totalAulasConcluidas ?? 0} concluídas`} hintTone="up" />
          <StatCard icon="check" label="Quizzes resp." value={String(d?.totalQuizzesRespondidos ?? 0)} tone="blue" hint={`${d?.totalQuizzes ?? 0} quizzes`} hintTone="flat" />
        </div>

        <section className="panel">
          <div className="panel-head">
            <h2>Acessos nos últimos 30 dias</h2>
            <span className="panel-tag">XP médio dos alunos: {d?.mediaXPAlunos ?? 0}</span>
          </div>
          <AccessChart />
        </section>

        <div className="admin-grid">
          <section className="panel">
            <div className="panel-head">
              <h2>Usuários recentes</h2>
              <button type="button" onClick={() => navigate('/admin/usuarios')}>
                Ver todos
              </button>
            </div>
            <div className="admin-table">
              <div className="admin-table-head">
                <span>Usuário</span>
                <span>Papel</span>
                <span>Plano</span>
              </div>
              {recentes.map((u) => (
                <div className="admin-table-row" key={u._id}>
                  <div className="admin-user-cell">
                    <span className="admin-avatar" aria-hidden="true">
                      {(u.nome ?? 'U').slice(0, 1)}
                    </span>
                    <div>
                      <strong>{u.nome}</strong>
                      <small>{u.email}</small>
                    </div>
                  </div>
                  <span className="admin-role">{u.tipo}</span>
                  <span>{u.plano === 'premium' ? <Badge tone="yellow">Premium</Badge> : <Badge tone="slate">Grátis</Badge>}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Disciplinas em alta</h2>
              <button type="button" onClick={() => navigate('/admin/ranking')}>
                Ranking
              </button>
            </div>
            <div className="admin-rank-list">
              {(disciplinas.data ?? []).slice(0, 5).map((disc, index) => (
                <article key={disc._id} className="admin-rank-row">
                  <span className="admin-rank-num">#{index + 1}</span>
                  <span className="admin-rank-emoji">{disc.emoji ?? '📘'}</span>
                  <div>
                    <h4>{disc.nome}</h4>
                    <small>{disc.categoria}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

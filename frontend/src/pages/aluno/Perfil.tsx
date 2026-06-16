import { useMemo } from 'react';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { ProgressBar, Spinner } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { refName } from '../../lib/helpers';
import { useApi } from '../../lib/hooks';
import type { ProgressoItem, ProgressoResumo, ResultadoQuiz } from '../../lib/types';

const LEVEL_XP = [0, 0, 500, 1000, 2000, 4000, 7000, 11000, 16000];

function avatarInitials(name?: string) {
  if (!name) return 'EV';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

export function AlunoPerfilPage() {
  const { user } = useAuth();
  const resumo = useApi<ProgressoResumo>('/progresso/resumo');
  const progresso = useApi<ProgressoItem[]>('/progresso/me');
  const resultados = useApi<ResultadoQuiz[]>('/quizzes/me/resultados');

  const data = resumo.data;
  const xp = data?.xp ?? user?.xp ?? 0;
  const nivel = data?.nivel ?? user?.nivel ?? 1;
  const streak = data?.streak ?? user?.streak ?? 0;
  const totalAulas = data?.totalAulasConcluidas ?? user?.totalAulasConcluidas ?? 0;
  const target = LEVEL_XP[nivel + 1] ?? LEVEL_XP[LEVEL_XP.length - 1] + 5000;
  const prev = LEVEL_XP[nivel] ?? 0;
  const xpPct = target > prev ? Math.min(100, Math.round(((xp - prev) / (target - prev)) * 100)) : 100;

  const quizzes = resultados.data ?? [];
  // nota vem do backend em escala 0–10; convertendo para porcentagem (×10).
  const mediaNota = quizzes.length
    ? Math.round((quizzes.reduce((s, r) => s + (r.nota ?? 0), 0) / quizzes.length) * 10)
    : 0;

  // Top disciplinas por aulas concluídas.
  const topDisciplinas = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of progresso.data ?? []) {
      if (!item.assistida) continue;
      const disc = typeof item.aula?.disciplina === 'object' ? item.aula?.disciplina : undefined;
      const nome = disc?.nome;
      if (nome) map.set(nome, (map.get(nome) ?? 0) + 1);
    }
    const max = Math.max(1, ...Array.from(map.values()));
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nome, count]) => ({ nome, count, pct: Math.round((count / max) * 100) }));
  }, [progresso.data]);

  // Atividade recente combinando aulas e quizzes.
  const atividade = useMemo(() => {
    const aulasAtiv = (progresso.data ?? [])
      .filter((p) => p.assistida)
      .slice(0, 4)
      .map((p) => ({ icon: 'play', text: `Aula concluída: ${p.aula?.titulo ?? 'Aula'}`, xp: p.xpGanho ?? 0 }));
    const quizAtiv = quizzes.slice(0, 4).map((q) => ({
      icon: 'check',
      text: `Quiz: ${refName(q.quiz?.disciplina as { nome?: string }, q.quiz?.titulo ?? 'Quiz')} · ${Math.round((q.nota ?? 0) * 10)}%`,
      xp: q.xpGanho ?? 0,
    }));
    return [...quizAtiv, ...aulasAtiv].slice(0, 6);
  }, [progresso.data, quizzes]);

  if (resumo.loading) {
    return (
      <AppLayout>
        <div className="page">
          <Spinner label="Carregando perfil..." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page">
        <section className="profile-header">
          <span className="profile-avatar">{avatarInitials(user?.nome)}</span>
          <div className="profile-id">
            <h1>{user?.nome}</h1>
            <p>{user?.email}</p>
            <div className="profile-level">
              <span className="level-chip">LVL {nivel}</span>
              <div className="profile-level-bar">
                <div className="xp-row">
                  <span>{xp.toLocaleString('pt-BR')} XP</span>
                  <span>{target.toLocaleString('pt-BR')} XP</span>
                </div>
                <ProgressBar value={xpPct} />
              </div>
            </div>
          </div>
        </section>

        <div className="profile-stats">
          {[
            ['play', 'Aulas', String(totalAulas)],
            ['check', 'Quizzes', String(quizzes.length)],
            ['flame', 'Sequência', `${streak} dias`],
            ['star', 'Média', quizzes.length ? `${mediaNota}%` : '—'],
            ['trophy', 'Nível', String(nivel)],
            ['chart', 'XP total', xp.toLocaleString('pt-BR')],
          ].map(([icon, label, value]) => (
            <article key={label} className="profile-stat">
              <span aria-hidden="true">
                <Icon name={icon} size={18} />
              </span>
              <strong>{value}</strong>
              <small>{label}</small>
            </article>
          ))}
        </div>

        <div className="profile-grid">
          <section className="panel">
            <h2 className="panel-title-sm">Top disciplinas</h2>
            {topDisciplinas.length === 0 ? (
              <p className="panel-empty-text">Conclua aulas para ver seu ranking de disciplinas.</p>
            ) : (
              <div className="top-list">
                {topDisciplinas.map((d) => (
                  <div key={d.nome} className="top-item">
                    <div className="top-item-head">
                      <span>{d.nome}</span>
                      <strong>{d.count} aulas</strong>
                    </div>
                    <ProgressBar value={d.pct} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <h2 className="panel-title-sm">Atividade recente</h2>
            {atividade.length === 0 ? (
              <p className="panel-empty-text">Suas atividades aparecerão aqui conforme você estuda.</p>
            ) : (
              <div className="activity-list">
                {atividade.map((item, index) => (
                  <article key={index} className="activity-row">
                    <span className="activity-ic" aria-hidden="true">
                      <Icon name={item.icon} size={16} />
                    </span>
                    <p>{item.text}</p>
                    {item.xp ? <span className="activity-xp">+{item.xp} XP</span> : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

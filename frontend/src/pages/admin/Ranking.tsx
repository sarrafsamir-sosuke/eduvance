import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { EmptyState, Spinner } from '../../components/ui';
import { useApi } from '../../lib/hooks';
import type { EduVanceUser } from '../../lib/types';

function initials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

export function AdminRankingPage() {
  const ranking = useApi<EduVanceUser[]>('/admin/ranking?limit=20');

  return (
    <AppLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Ranking de alunos</h1>
            <span className="page-subtitle">Top alunos por XP acumulado.</span>
          </div>
        </div>

        {ranking.loading ? (
          <Spinner label="Carregando ranking..." />
        ) : (ranking.data ?? []).length === 0 ? (
          <EmptyState title="Sem dados de ranking" description="Quando os alunos ganharem XP, eles aparecerão aqui." />
        ) : (
          <div className="ranking-list">
            {(ranking.data ?? []).map((u, index) => (
              <article key={u._id} className={`ranking-row${index < 3 ? ' top' : ''}`}>
                <span className={`ranking-pos pos-${index + 1}`}>
                  {index < 3 ? <Icon name="trophy" size={18} /> : index + 1}
                </span>
                <span className="ranking-avatar" aria-hidden="true">
                  {initials(u.nome)}
                </span>
                <div className="ranking-id">
                  <strong>{u.nome}</strong>
                  <small>Nível {u.nivel ?? 1} · {u.streak ?? 0} dias de streak</small>
                </div>
                <div className="ranking-meta">
                  <span className="ranking-aulas">{u.totalAulasConcluidas ?? 0} aulas</span>
                  <strong className="ranking-xp">
                    <Icon name="star" size={14} /> {(u.xp ?? 0).toLocaleString('pt-BR')} XP
                  </strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

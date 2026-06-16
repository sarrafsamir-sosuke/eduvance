import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { ProgressBar, Spinner } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../lib/hooks';
import type { ProgressoResumo } from '../../lib/types';

interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  xp: number;
  target: number;
  current: number;
}

export function AlunoConquistasPage() {
  const { user } = useAuth();
  const resumo = useApi<ProgressoResumo>('/progresso/resumo');

  const data = resumo.data;
  const xp = data?.xp ?? user?.xp ?? 0;
  const streak = data?.streak ?? user?.streak ?? 0;
  const aulas = data?.totalAulasConcluidas ?? user?.totalAulasConcluidas ?? 0;
  const nivel = data?.nivel ?? user?.nivel ?? 1;

  const achievements: Achievement[] = [
    { id: 'first', title: 'Primeiros passos', desc: 'Conclua sua primeira aula.', icon: 'play', xp: 50, target: 1, current: aulas },
    { id: 'biblio', title: 'Rato de biblioteca', desc: 'Conclua 10 aulas.', icon: 'book', xp: 150, target: 10, current: aulas },
    { id: 'scholar', title: 'Estudante dedicado', desc: 'Conclua 25 aulas.', icon: 'trophy', xp: 300, target: 25, current: aulas },
    { id: 'streak3', title: 'Pegando o ritmo', desc: 'Mantenha 3 dias de sequência.', icon: 'flame', xp: 100, target: 3, current: streak },
    { id: 'streak7', title: '7 dias seguidos', desc: 'Mantenha uma semana de sequência.', icon: 'flame', xp: 200, target: 7, current: streak },
    { id: 'xp1000', title: 'Colecionador de XP', desc: 'Acumule 1.000 XP.', icon: 'star', xp: 250, target: 1000, current: xp },
    { id: 'level5', title: 'Veterano', desc: 'Alcance o nível 5.', icon: 'shield', xp: 400, target: 5, current: nivel },
    { id: 'xp5000', title: 'Lenda EduVance', desc: 'Acumule 5.000 XP.', icon: 'sparkles', xp: 500, target: 5000, current: xp },
  ];

  const unlocked = achievements.filter((a) => a.current >= a.target);

  if (resumo.loading) {
    return (
      <AppLayout>
        <div className="page">
          <Spinner label="Carregando conquistas..." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Mural de Conquistas</h1>
            <span className="page-subtitle">Cada passo de estudo vira recompensa.</span>
          </div>
          <span className="xp-total-badge">
            <Icon name="star" size={16} /> {xp.toLocaleString('pt-BR')} XP
          </span>
        </div>

        <section className="streak-banner">
          <span className="streak-banner-flame" aria-hidden="true">
            <Icon name="flame" size={40} />
          </span>
          <h2>{streak} dias seguidos</h2>
          <p>Você acessou a plataforma com consistência. A constância é a chave para o aprendizado acelerado.</p>
          <span className="streak-banner-xp">+200 XP por semana completa</span>
        </section>

        <div className="page-header">
          <h2 className="page-title sm">Desafios e conquistas</h2>
          <span className="page-subtitle">
            {unlocked.length}/{achievements.length} desbloqueadas
          </span>
        </div>

        <div className="achievements-grid">
          {achievements.map((a) => {
            const done = a.current >= a.target;
            const pct = Math.min(100, Math.round((a.current / a.target) * 100));
            return (
              <article key={a.id} className={`achievement-card-full${done ? ' unlocked' : ' locked'}`}>
                <span className="achievement-full-icon" aria-hidden="true">
                  <Icon name={done ? a.icon : 'lock'} size={22} />
                </span>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
                {done ? (
                  <span className="achievement-xp-pill">+{a.xp} XP</span>
                ) : (
                  <div className="achievement-progress">
                    <div className="xp-row">
                      <span>Progresso</span>
                      <span>
                        {Math.min(a.current, a.target).toLocaleString('pt-BR')}/{a.target.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <ProgressBar value={pct} />
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <section className="journey-bar">
          <div className="journey-bar-head">
            <strong>Jornada do Conhecimento</strong>
            <span>
              {unlocked.length}/{achievements.length} conquistas
            </span>
          </div>
          <ProgressBar value={Math.round((unlocked.length / achievements.length) * 100)} />
        </section>
      </div>
    </AppLayout>
  );
}

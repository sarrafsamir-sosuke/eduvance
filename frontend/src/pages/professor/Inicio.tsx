import { useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Button, Spinner, StatCard } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { disciplinaIdOfAula, fallbackProgress, firstName, greeting } from '../../lib/helpers';
import { useApi, useCatalogo } from '../../lib/hooks';
import type { Quiz } from '../../lib/types';

const PERFORMANCE = [
  { faixa: '9–10', pct: 35, tone: 'strong' },
  { faixa: '7–8', pct: 45, tone: 'mid' },
  { faixa: '5–6', pct: 15, tone: 'low' },
  { faixa: '<5', pct: 5, tone: 'bad' },
];

const ATENCAO = [
  { nome: 'João Pedro Silva', motivo: 'Faltas consecutivas', tag: 'Alerta' },
  { nome: 'Maria Clara', motivo: 'Nota baixa · Matemática', tag: 'Atenção' },
];

export function ProfessorInicioPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { disciplinas, aulas, loading } = useCatalogo();
  const quizzes = useApi<Quiz[]>('/quizzes');

  const minhasDisciplinas = disciplinas.slice(0, 4).map((d) => ({
    ...d,
    aulas: aulas.filter((a) => disciplinaIdOfAula(a) === d._id).length,
    progresso: fallbackProgress(d._id),
  }));

  return (
    <AppLayout>
      <div className="dashboard">
        <div className="dashboard-greeting">
          <h1>
            {greeting()}, Prof. {firstName(user?.nome) || 'EduVance'} <span aria-hidden="true">👋</span>
          </h1>
          <p>Acompanhe suas turmas, aulas e o desempenho dos alunos.</p>
        </div>

        <div className="stats-grid">
          <StatCard icon="users" label="Alunos ativos" value="47" tone="blue" hint="+2 esta semana" hintTone="up" />
          <StatCard icon="play" label="Aulas publicadas" value={String(aulas.length)} tone="green" hint={`${disciplinas.length} disciplinas`} hintTone="flat" />
          <StatCard icon="star" label="Média da turma" value="7.8" tone="yellow" hint="+0.4 vs mês anterior" hintTone="up" />
          <StatCard icon="check" label="Quizzes" value={String((quizzes.data ?? []).length)} tone="purple" hint="ativos" hintTone="flat" />
        </div>

        <div className="prof-grid">
          <section className="panel">
            <div className="panel-head">
              <h2>Minhas disciplinas</h2>
              <button type="button" onClick={() => navigate('/professor/aulas')}>
                Ver aulas
              </button>
            </div>
            {loading ? (
              <Spinner label="Carregando..." />
            ) : minhasDisciplinas.length === 0 ? (
              <p className="panel-empty-text">Nenhuma disciplina ainda.</p>
            ) : (
              minhasDisciplinas.map((d) => (
                <article key={d._id} className="prof-discipline-row">
                  <span className="prof-discipline-emoji">{d.emoji ?? '📘'}</span>
                  <div className="prof-discipline-body">
                    <h3>{d.nome}</h3>
                    <p>
                      {d.aulas} aulas · {d.progresso}% concluído
                    </p>
                    <div className="progress-track sm">
                      <span className="progress-fill" style={{ width: `${d.progresso}%` }} />
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/professor/aulas')}>
                    Gerenciar
                  </Button>
                </article>
              ))
            )}
          </section>

          <section className="panel">
            <h2 className="panel-title-sm">Desempenho da turma</h2>
            <div className="perf-bars">
              {PERFORMANCE.map((p) => (
                <div key={p.faixa} className="perf-bar-row">
                  <span className="perf-faixa">{p.faixa}</span>
                  <div className="perf-bar-track">
                    <span className={`perf-bar-fill perf-${p.tone}`} style={{ width: `${p.pct}%` }} />
                  </div>
                  <strong>{p.pct}%</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2 className="panel-title-sm">Alunos que precisam de atenção</h2>
            <div className="atencao-list">
              {ATENCAO.map((a) => (
                <article key={a.nome} className="atencao-row">
                  <span className="atencao-avatar" aria-hidden="true">
                    {a.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                  <div>
                    <h4>{a.nome}</h4>
                    <p>{a.motivo}</p>
                  </div>
                  <span className={`atencao-tag ${a.tag === 'Alerta' ? 'alert' : ''}`}>{a.tag}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Ações rápidas</h2>
            </div>
            <div className="prof-quick">
              <button type="button" onClick={() => navigate('/professor/subir-aula')}>
                <Icon name="upload" size={20} />
                Subir nova aula
              </button>
              <button type="button" onClick={() => navigate('/professor/aulas')}>
                <Icon name="play" size={20} />
                Minhas aulas
              </button>
              <button type="button" onClick={() => navigate('/professor/quizzes')}>
                <Icon name="check" size={20} />
                Quizzes
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

import { categoryGradient, categoryShort, professorName } from '../lib/helpers';
import type { Disciplina } from '../lib/types';
import { Icon } from './Icon';
import { ProgressBar } from './ui';

interface DisciplineCardProps {
  disciplina: Disciplina;
  lessons?: number;
  progress?: number;
  onAccess: () => void;
  actionLabel?: string;
}

export function DisciplineCard({
  disciplina,
  lessons,
  progress,
  onAccess,
  actionLabel = 'Acessar',
}: DisciplineCardProps) {
  return (
    <article className="discipline-card">
      <div className="discipline-card-top" style={{ background: categoryGradient(disciplina.categoria) }}>
        <span className="discipline-emoji" aria-hidden="true">
          {disciplina.emoji ?? '📘'}
        </span>
        <span className="discipline-tag">{categoryShort(disciplina.categoria)}</span>
      </div>
      <div className="discipline-card-body">
        <h3>{disciplina.nome}</h3>
        <p className="discipline-prof">
          <Icon name="user" size={14} /> {professorName(disciplina.professor)}
        </p>
        {typeof lessons === 'number' ? (
          <small className="discipline-meta">{lessons} aulas</small>
        ) : null}
        {typeof progress === 'number' ? (
          <div className="discipline-progress">
            <div className="discipline-progress-row">
              <span>Progresso</span>
              <strong>{progress}%</strong>
            </div>
            <ProgressBar value={progress} />
          </div>
        ) : null}
        <button className="button button-outline button-full" type="button" onClick={onAccess}>
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

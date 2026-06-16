import type {
  ButtonHTMLAttributes,
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
} from 'react';

import { BrandLogo } from './components/brand/BrandLogo';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  full?: boolean;
};

export function Button({
  children,
  className = '',
  variant = 'primary',
  full = false,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button-${variant}${full ? ' button-full' : ''} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: string;
  helper?: string;
};

export function Input({ label, icon, helper, className = '', ...props }: InputProps) {
  return (
    <label className="input-group">
      <span className="input-label">{label}</span>
      <span className="input-shell">
        {icon ? <span className="input-icon" aria-hidden="true">{icon}</span> : null}
        <input className={`input-field ${className}`} {...props} />
      </span>
      {helper ? <span className="input-helper">{helper}</span> : null}
    </label>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const style = { '--progress': `${safeValue}%` } as CSSProperties;

  return (
    <div className="progress-track" aria-label={`Progresso ${safeValue}%`}>
      <span className="progress-fill" style={style} />
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  icon: string;
  tone?: 'blue' | 'green' | 'red' | 'yellow' | 'slate';
};

export function StatCard({ label, value, icon, tone = 'blue' }: StatCardProps) {
  return (
    <article className="stat-card">
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
      <span className={`stat-icon stat-${tone}`} aria-hidden="true">{icon}</span>
    </article>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <BrandLogo compact size="md" />
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="auth-page">
      <section className="auth-brand" aria-label="EduVance">
        <button className="brand-mark auth-brand-link" type="button" onClick={() => window.location.assign('/')}>
          <BrandLogo inverted size="lg" />
        </button>
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <div className="auth-quote">
          <strong>"</strong>
          <p>
            O EduVance transforma rotina de estudos em progresso visível,
            recompensas e acompanhamento de verdade.
          </p>
          <small>Maria Clara, aluna do 9 ano</small>
        </div>
      </section>
      <section className="auth-content">{children}</section>
    </main>
  );
}

export function LandingHeader({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <header className="landing-header">
      <button className="brand-mark" type="button" onClick={() => onNavigate('/')}>
        <BrandLogo size="md" />
      </button>
      <nav className="landing-nav" aria-label="Navegação principal">
        <a href="#disciplinas">Disciplinas</a>
        <a href="#como-funciona">Como funciona</a>
        <a href="#planos">Planos</a>
        <a href="#sobre">Sobre</a>
      </nav>
      <div className="landing-actions">
        <Button variant="ghost" onClick={() => onNavigate('/login')}>Entrar</Button>
        <Button onClick={() => onNavigate('/cadastro')}>Cadastrar</Button>
      </div>
    </header>
  );
}

const sidebarItems = [
  { label: 'Início', path: '/aluno/inicio', icon: '⌂', activePath: '/aluno/inicio' },
  { label: 'Disciplinas', path: '/aluno/disciplinas', icon: '▣', activePath: '/aluno/disciplinas' },
  { label: 'EduAI', path: '/aluno/inicio', icon: 'AI', activePath: '/aluno/eduai' },
  { label: 'Conquistas', path: '/aluno/inicio', icon: '★', activePath: '/aluno/conquistas' },
  { label: 'Perfil', path: '/aluno/inicio', icon: '●', activePath: '/aluno/perfil' },
  { label: 'Configurações', path: '/aluno/inicio', icon: '⚙', activePath: '/aluno/configuracoes' },
  { label: 'Planos', path: '/aluno/inicio', icon: '▤', activePath: '/aluno/planos' },
];

export function StudentSidebar({
  activePath,
  onNavigate,
}: {
  activePath: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <aside className="student-sidebar">
      <button className="student-logo" type="button" onClick={() => onNavigate('/aluno/inicio')}>
        <BrandLogo size="lg" />
      </button>

      <nav className="student-menu" aria-label="Menu do aluno">
        {sidebarItems.map((item) => (
          <button
            className={activePath === item.activePath ? 'active' : ''}
            key={item.label}
            type="button"
            onClick={() => onNavigate(item.path)}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <Button full onClick={() => onNavigate('/aluno/inicio')}>Ver progresso</Button>
        <button className="logout-button" type="button" onClick={() => onNavigate('/')}>Sair</button>
      </div>
    </aside>
  );
}

export function StudentLayout({
  activePath,
  children,
  isDarkMode,
  onNavigate,
  onToggleTheme,
}: {
  activePath: string;
  children: ReactNode;
  isDarkMode: boolean;
  onNavigate: (path: string) => void;
  onToggleTheme: () => void;
}) {
  return (
    <main className="student-shell">
      <StudentSidebar activePath={activePath} onNavigate={onNavigate} />
      <section className="student-main">
        <header className="student-topbar">
          <div className="mobile-brand">
            <BrandLogo size="sm" />
          </div>
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input placeholder="Buscar..." />
          </label>
          <div className="topbar-actions">
            <button
              aria-label={isDarkMode ? 'Ativar tema claro' : 'Ativar tema escuro'}
              className={`theme-toggle ${isDarkMode ? 'is-dark' : 'is-light'}`}
              type="button"
              onClick={onToggleTheme}
            >
              <span className="theme-icon" aria-hidden="true" />
            </button>
            <button aria-label="Notificacoes" className="notification-button" type="button">
              <span className="notification-icon" aria-hidden="true" />
              <span className="notification-dot" aria-hidden="true" />
            </button>
            <span className="avatar" aria-hidden="true">JS</span>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}

type DisciplineCardProps = {
  name: string;
  category: string;
  categoryShort: string;
  professor: string;
  lessons: number;
  progress: number;
  icon: string;
  onAccess?: () => void;
};

export function DisciplineCard({
  name,
  category,
  categoryShort,
  professor,
  lessons,
  progress,
  icon,
  onAccess,
}: DisciplineCardProps) {
  return (
    <article className="discipline-card">
      <div className="discipline-head">
        <span className="discipline-icon" aria-hidden="true">{icon}</span>
        <span className="discipline-tag">{categoryShort}</span>
      </div>
      <h3>{name}</h3>
      <p>{professor}</p>
      <small>{lessons} aulas • {category}</small>
      <Button variant="outline" full onClick={onAccess}>Acessar</Button>
      <ProgressBar value={progress} />
    </article>
  );
}

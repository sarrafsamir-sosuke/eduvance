import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import type { UserType } from '../../lib/types';
import { BrandLogo } from '../brand/BrandLogo';
import { Icon } from '../Icon';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_BY_ROLE: Record<UserType, NavItem[]> = {
  aluno: [
    { to: '/aluno/inicio', label: 'Início', icon: 'home' },
    { to: '/aluno/disciplinas', label: 'Disciplinas', icon: 'book' },
    { to: '/aluno/eduai', label: 'EduAI', icon: 'robot' },
    { to: '/aluno/conquistas', label: 'Conquistas', icon: 'trophy' },
    { to: '/aluno/perfil', label: 'Perfil', icon: 'user' },
    { to: '/aluno/configuracoes', label: 'Configurações', icon: 'gear' },
    { to: '/aluno/planos', label: 'Planos', icon: 'card' },
  ],
  professor: [
    { to: '/professor/inicio', label: 'Início', icon: 'home' },
    { to: '/professor/aulas', label: 'Minhas Aulas', icon: 'play' },
    { to: '/professor/subir-aula', label: 'Subir Aula', icon: 'upload' },
    { to: '/professor/quizzes', label: 'Quizzes', icon: 'check' },
    { to: '/professor/configuracoes', label: 'Configurações', icon: 'gear' },
  ],
  admin: [
    { to: '/admin/inicio', label: 'Visão Geral', icon: 'chart' },
    { to: '/admin/usuarios', label: 'Usuários', icon: 'users' },
    { to: '/admin/ranking', label: 'Ranking', icon: 'trophy' },
    { to: '/admin/configuracoes', label: 'Configurações', icon: 'gear' },
  ],
};

const THEME_KEY = 'eduvance_theme';

function useTheme() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem(THEME_KEY) === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((value) => !value) };
}

function initials(name?: string) {
  if (!name) return 'EV';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AppLayout({ children, title }: { children: ReactNode; title?: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const role: UserType = user?.tipo ?? 'aluno';
  const items = NAV_BY_ROLE[role];
  const homePath = items[0]?.to ?? '/';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const sidebar = (
    <aside className={`app-sidebar${drawerOpen ? ' is-open' : ''}`}>
      <Link to={homePath} className="app-logo" onClick={() => setDrawerOpen(false)}>
        <BrandLogo size="md" />
      </Link>

      <nav className="app-menu" aria-label="Menu principal">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="app-menu-icon" aria-hidden="true">
              <Icon name={item.icon} size={20} />
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="app-sidebar-bottom">
        {role === 'aluno' ? (
          <Link to="/aluno/perfil" className="button button-primary button-full" onClick={() => setDrawerOpen(false)}>
            <Icon name="chart" size={18} /> Ver progresso
          </Link>
        ) : null}
        <button className="app-logout" type="button" onClick={handleLogout}>
          <Icon name="logout" size={18} /> Sair
        </button>
      </div>
    </aside>
  );

  return (
    <div className="app-shell">
      {drawerOpen ? <div className="app-overlay" onClick={() => setDrawerOpen(false)} aria-hidden="true" /> : null}
      {sidebar}

      <div className="app-main">
        <header className="app-topbar">
          <button
            className="app-menu-toggle"
            type="button"
            aria-label="Abrir menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Icon name="menu" />
          </button>

          <div className="app-mobile-brand">
            <BrandLogo size="sm" />
          </div>

          {title ? <h1 className="app-topbar-title">{title}</h1> : <span className="app-topbar-spacer" />}

          <div className="app-topbar-actions">
            <button
              className={`icon-button theme-toggle ${isDark ? 'is-dark' : ''}`}
              type="button"
              aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
              onClick={toggle}
            >
              <Icon name={isDark ? 'sun' : 'moon'} size={18} />
            </button>
            <button className="icon-button" type="button" aria-label="Notificações">
              <Icon name="bell" size={18} />
              <span className="notification-dot" aria-hidden="true" />
            </button>
            <Link to={`/${role}/perfil`.replace('/admin/perfil', '/admin/inicio').replace('/professor/perfil', '/professor/inicio')} className="app-avatar" aria-label="Perfil">
              {initials(user?.nome)}
            </Link>
          </div>
        </header>

        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}

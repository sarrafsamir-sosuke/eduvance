import { useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth, homePathForUser } from '../../context/AuthContext';
import { BrandLogo } from '../brand/BrandLogo';
import { Icon } from '../Icon';
import { Button } from '../ui';

const navLinks = [
  { to: '/disciplinas', label: 'Disciplinas' },
  { to: '/professores', label: 'Professores' },
  { to: '/planos', label: 'Planos' },
  { to: '/como-funciona', label: 'Como funciona' },
  { to: '/sobre', label: 'Sobre' },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="public-shell">
      <header className="public-header">
        <Link to="/" className="brand-mark" aria-label="EduVance início">
          <BrandLogo size="md" />
        </Link>

        <nav className="public-nav" aria-label="Navegação principal">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="public-actions">
          {isAuthenticated ? (
            <Button onClick={() => navigate(homePathForUser(user))}>Meu painel</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Entrar
              </Button>
              <Button onClick={() => navigate('/cadastro')}>Cadastrar</Button>
            </>
          )}
        </div>

        <button
          className="public-menu-toggle"
          type="button"
          aria-label="Abrir menu"
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </header>

      {open ? (
        <div className="public-mobile-menu">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="public-mobile-actions">
            {isAuthenticated ? (
              <Button full onClick={() => navigate(homePathForUser(user))}>
                Meu painel
              </Button>
            ) : (
              <>
                <Button variant="outline" full onClick={() => navigate('/login')}>
                  Entrar
                </Button>
                <Button full onClick={() => navigate('/cadastro')}>
                  Cadastrar
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}

      <main className="public-main">{children}</main>

      <footer className="public-footer">
        <div className="public-footer-top">
          <div className="public-footer-brand">
            <BrandLogo size="md" />
            <p>Aprenda, evolua e acompanhe seu progresso com uma plataforma gamificada.</p>
          </div>
          <div className="public-footer-cols">
            <div>
              <strong>Plataforma</strong>
              <Link to="/disciplinas">Disciplinas</Link>
              <Link to="/planos">Planos</Link>
              <Link to="/como-funciona">Como funciona</Link>
            </div>
            <div>
              <strong>Para escolas</strong>
              <Link to="/professores">Professores</Link>
              <Link to="/sobre">Sobre</Link>
              <Link to="/cadastro">Criar conta</Link>
            </div>
            <div>
              <strong>Acesso</strong>
              <Link to="/login">Entrar</Link>
              <Link to="/login-professor">Login professor</Link>
              <Link to="/recuperar-senha">Recuperar senha</Link>
            </div>
          </div>
        </div>
        <div className="public-footer-bottom">
          <span>© {new Date().getFullYear()} EduVance. Projeto educacional.</span>
          <span>Feito para aprender melhor.</span>
        </div>
      </footer>
    </div>
  );
}

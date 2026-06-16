import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { BrandLogo } from '../brand/BrandLogo';
import { Icon } from '../Icon';

const highlights = [
  { icon: 'play', text: 'Aulas organizadas por área de conhecimento' },
  { icon: 'sparkles', text: 'EduAI para tirar dúvidas a qualquer hora' },
  { icon: 'trophy', text: 'XP, níveis e conquistas a cada passo' },
];

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
        <Link to="/" className="brand-mark auth-brand-link">
          <BrandLogo inverted size="lg" />
        </Link>
        <div className="auth-brand-copy">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <ul className="auth-highlights">
          {highlights.map((item) => (
            <li key={item.text}>
              <span aria-hidden="true">
                <Icon name={item.icon} size={18} />
              </span>
              {item.text}
            </li>
          ))}
        </ul>

        <div className="auth-quote">
          <p>“O EduVance transforma rotina de estudos em progresso visível, recompensas e acompanhamento de verdade.”</p>
          <small>Maria Clara · aluna do 9º ano</small>
        </div>
      </section>
      <section className="auth-content">{children}</section>
    </main>
  );
}

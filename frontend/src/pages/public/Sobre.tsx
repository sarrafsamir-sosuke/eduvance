import { useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { PublicLayout } from '../../components/layouts/PublicLayout';
import { Button } from '../../components/ui';

const values = [
  { icon: 'target', title: 'Foco no aluno', text: 'Cada recurso existe para tornar o aprendizado mais claro, motivador e mensurável.' },
  { icon: 'sparkles', title: 'Tecnologia com propósito', text: 'Usamos IA e dados para apoiar o estudo, não para substituir o professor.' },
  { icon: 'users', title: 'Educação acessível', text: 'Um plano gratuito robusto para que ninguém fique de fora da jornada.' },
];

const stats = [
  { value: '12+', label: 'Disciplinas' },
  { value: '500+', label: 'Alunos ativos' },
  { value: '98%', label: 'Aprovação' },
  { value: '4', label: 'Áreas da BNCC' },
];

export function SobrePage() {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <section className="catalog-hero">
        <span className="eyebrow">
          <Icon name="shield" size={15} /> Sobre o EduVance
        </span>
        <h1 className="display">Educação que vira conquista.</h1>
        <p>
          O EduVance nasceu para transformar a rotina de estudos em uma jornada gamificada: com progresso
          visível, recompensas e apoio inteligente em cada etapa.
        </p>
      </section>

      <section className="about-stats">
        {stats.map((stat) => (
          <article key={stat.label}>
            <strong className="display">{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <h2 className="display">Nossos valores</h2>
        </div>
        <div className="benefit-grid">
          {values.map((item) => (
            <article key={item.title} className="benefit-card">
              <span className="benefit-icon" aria-hidden="true">
                <Icon name={item.icon} size={22} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <h2 className="display">Faça parte dessa jornada.</h2>
          <p>Comece agora ou converse com nosso time sobre o uso na sua escola.</p>
        </div>
        <div className="landing-cta-actions">
          <Button onClick={() => navigate('/cadastro')}>Começar agora</Button>
          <Button variant="outline" onClick={() => navigate('/professores')}>
            Solicitar demonstração
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}

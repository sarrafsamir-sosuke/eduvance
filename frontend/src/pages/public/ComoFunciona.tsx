import { useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { PublicLayout } from '../../components/layouts/PublicLayout';
import { Button } from '../../components/ui';

const steps = [
  { icon: 'user', title: '1. Crie sua conta', text: 'Cadastre-se como aluno ou professor. Você entra direto no ambiente certo para o seu perfil.' },
  { icon: 'book', title: '2. Escolha as disciplinas', text: 'Navegue pelas áreas da BNCC e abra as disciplinas. Aulas gratuitas liberadas na hora.' },
  { icon: 'play', title: '3. Assista e pratique', text: 'Veja as aulas, baixe materiais e responda quizzes para fixar o conteúdo.' },
  { icon: 'robot', title: '4. Tire dúvidas com a EduAI', text: 'Pergunte a qualquer momento. A EduAI explica passo a passo dentro do contexto da matéria.' },
  { icon: 'trophy', title: '5. Ganhe XP e conquistas', text: 'Cada aula concluída e quiz respondido rende XP, sobe seu nível e mantém o streak.' },
  { icon: 'chart', title: '6. Acompanhe a evolução', text: 'Veja seu progresso por disciplina, ranking e histórico no painel de perfil.' },
];

export function ComoFuncionaPage() {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <section className="catalog-hero">
        <span className="eyebrow">
          <Icon name="sparkles" size={15} /> Como funciona
        </span>
        <h1 className="display">Do primeiro acesso ao acompanhamento.</h1>
        <p>Entenda em poucos passos como o EduVance transforma sua rotina de estudos em progresso real.</p>
      </section>

      <section className="how-steps">
        {steps.map((step) => (
          <article key={step.title} className="how-step-card">
            <span className="benefit-icon" aria-hidden="true">
              <Icon name={step.icon} size={22} />
            </span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </section>

      <section className="landing-cta">
        <div>
          <h2 className="display">Comece agora, é grátis.</h2>
          <p>Crie sua conta e desbloqueie sua primeira aula em menos de um minuto.</p>
        </div>
        <div className="landing-cta-actions">
          <Button onClick={() => navigate('/cadastro')}>Começar agora grátis</Button>
          <Button variant="outline" onClick={() => navigate('/professores')}>
            Agendar demo para escolas
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}

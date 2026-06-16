import { useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { PublicLayout } from '../../components/layouts/PublicLayout';
import { Button, ProgressBar } from '../../components/ui';

const benefits = [
  {
    icon: 'chart',
    title: 'Progresso visível',
    text: 'Acompanhe aulas concluídas, nível, streak e evolução geral em tempo real.',
  },
  {
    icon: 'robot',
    title: 'Apoio inteligente',
    text: 'A EduAI ajuda com dúvidas e resumos dentro do seu fluxo de estudos.',
  },
  {
    icon: 'book',
    title: 'Conteúdo organizado',
    text: 'Disciplinas, aulas e quizzes separados por áreas de conhecimento da BNCC.',
  },
];

const steps = [
  { n: '01', title: 'Crie sua conta', text: 'Aluno ou professor entra no ambiente certo desde o cadastro.' },
  { n: '02', title: 'Escolha as disciplinas', text: 'Acesse aulas gratuitas ou premium conforme o seu plano.' },
  { n: '03', title: 'Evolua com dados', text: 'Ganhe XP em aulas e quizzes enquanto acompanha seu desempenho.' },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <Icon name="sparkles" size={15} /> Plataforma educacional gamificada
          </span>
          <h1 className="display">
            Aprenda, Evolua, <span className="text-blue">Vença.</span>
          </h1>
          <p>
            Transforme o estudo em uma jornada épica. Conquiste níveis, ganhe recompensas e aprenda de
            forma divertida e eficiente.
          </p>

          <div className="hero-actions">
            <Button onClick={() => navigate('/cadastro')}>
              Começar agora <Icon name="arrowRight" size={18} />
            </Button>
            <Button variant="ghost" onClick={() => navigate('/como-funciona')}>
              <Icon name="play" size={16} /> Ver como funciona
            </Button>
          </div>

          <div className="hero-metrics" aria-label="Métricas do EduVance">
            <div>
              <strong>12+</strong>
              <span>Disciplinas</span>
            </div>
            <div>
              <strong>500+</strong>
              <span>Alunos</span>
            </div>
            <div>
              <strong>98%</strong>
              <span>Aprovação</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Resumo de progresso do aluno">
          <div className="achievement-card">
            <span className="achievement-trophy" aria-hidden="true">
              <Icon name="trophy" size={18} />
            </span>
            <div>
              <small>Conquista</small>
              <strong>Mestre das Frações</strong>
            </div>
          </div>

          <article className="student-preview-card">
            <div className="student-preview-top">
              <span className="student-avatar">JS</span>
              <div className="student-preview-id">
                <h2>João Silva</h2>
                <p>3º Ano B</p>
              </div>
              <span className="streak-pill">
                <Icon name="flame" size={13} /> 7 dias
              </span>
            </div>

            <div className="xp-row">
              <span>Progresso para LVL 8</span>
              <strong>850/1000 XP</strong>
            </div>
            <ProgressBar value={85} />

            <div className="subject-row">
              <span className="subject-emoji">📐</span>
              <p>Matemática</p>
              <strong>92%</strong>
            </div>
            <div className="subject-row">
              <span className="subject-emoji">🧪</span>
              <p>Química</p>
              <strong>78%</strong>
            </div>
          </article>

          <div className="xp-chip">+50 XP</div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <span className="eyebrow">Benefícios</span>
          <h2 className="display">Uma rotina de estudos com clareza.</h2>
        </div>
        <div className="benefit-grid">
          {benefits.map((item) => (
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

      <section className="landing-section how-section">
        <div className="section-heading">
          <span className="eyebrow">Como funciona</span>
          <h2 className="display">Do primeiro acesso ao acompanhamento.</h2>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <article key={step.n} className="step-card">
              <strong>{step.n}</strong>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <span className="eyebrow eyebrow-light">Planos</span>
          <h2 className="display">Grátis para começar, premium para ir mais longe.</h2>
          <p>Comece sem cartão e desbloqueie todo o potencial quando quiser.</p>
        </div>
        <div className="landing-cta-actions">
          <Button onClick={() => navigate('/cadastro')}>Começar agora</Button>
          <Button variant="outline" onClick={() => navigate('/planos')}>
            Ver planos
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}

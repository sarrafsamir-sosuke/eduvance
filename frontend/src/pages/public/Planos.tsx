import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { PublicLayout } from '../../components/layouts/PublicLayout';
import { Button } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

const PLANOS = [
  {
    id: 'gratis',
    nome: 'Grátis',
    preco: 'R$ 0',
    tagline: 'Para estudantes curiosos.',
    destaque: false,
    cta: 'Começar grátis',
    features: ['Acesso às disciplinas gratuitas', 'Missões diárias básicas', '5 perguntas/dia na EduAI', 'Progresso e conquistas'],
  },
  {
    id: 'premium',
    nome: 'Premium',
    preco: 'R$ 49',
    tagline: 'A experiência completa de gamificação.',
    destaque: true,
    cta: 'Assinar Premium',
    features: ['Todas as disciplinas e aulas premium', 'Missões e eventos exclusivos', '100 perguntas/dia na EduAI', 'Quizzes premium e certificados'],
  },
  {
    id: 'max',
    nome: 'Max',
    preco: 'R$ 89',
    tagline: 'Para quem quer ir além.',
    destaque: false,
    cta: 'Em breve',
    soon: true,
    features: ['Tudo do plano Premium', 'EduAI ilimitada', 'Mentoria 1x ao mês', 'Acesso antecipado a novidades'],
  },
];

const FAQ = [
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim. Você pode voltar para o plano grátis quando quiser, sem multa, direto no seu painel em Planos.',
  },
  {
    q: 'Como funciona o desconto anual?',
    a: 'No plano anual você paga 12 meses de uma vez com 20% de desconto em relação ao valor mensal, com acesso liberado por um ano inteiro.',
  },
  {
    q: 'O plano grátis tem prazo de validade?',
    a: 'Não. O plano grátis é para sempre e dá acesso às disciplinas e aulas gratuitas da plataforma.',
  },
];

export function PlanosPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(1);

  function handleSelect(planoId: string, soon?: boolean) {
    if (soon) return;
    if (planoId === 'gratis') {
      navigate(isAuthenticated ? '/aluno/planos' : '/cadastro');
      return;
    }
    // Premium → checkout (ou painel de planos se já logado)
    navigate(isAuthenticated && user ? '/checkout' : '/checkout');
  }

  return (
    <PublicLayout>
      <section className="planos-hero">
        <h1 className="display">Escolha seu plano</h1>
        <p>Desbloqueie todo o potencial da gamificação na aprendizagem com nossos planos flexíveis.</p>

        <div className="billing-toggle" role="group" aria-label="Periodicidade">
          <button type="button" className={!annual ? 'active' : ''} onClick={() => setAnnual(false)}>
            Mensal
          </button>
          <button type="button" className={annual ? 'active' : ''} onClick={() => setAnnual(true)}>
            Anual <span className="billing-badge">-20%</span>
          </button>
        </div>
      </section>

      <section className="planos-grid">
        {PLANOS.map((plano) => (
          <article key={plano.id} className={`plano-card${plano.destaque ? ' is-featured' : ''}`}>
            {plano.destaque ? <span className="plano-badge">Mais popular</span> : null}
            <h2>{plano.nome}</h2>
            <p className="plano-tagline">{plano.tagline}</p>
            <div className="plano-price">
              <strong>{plano.preco}</strong>
              <span>/mês</span>
            </div>
            <Button
              full
              variant={plano.destaque ? 'primary' : 'outline'}
              disabled={plano.soon}
              onClick={() => handleSelect(plano.id, plano.soon)}
            >
              {plano.cta}
            </Button>
            <ul className="plano-features">
              {plano.features.map((f) => (
                <li key={f}>
                  <Icon name="checkCircle" size={17} /> {f}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="faq-section">
        <h2 className="display">Perguntas Frequentes</h2>
        <div className="faq-list">
          {FAQ.map((item, index) => (
            <article key={item.q} className={`faq-item${openFaq === index ? ' is-open' : ''}`}>
              <button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                {item.q}
                <Icon name="chevronDown" size={18} />
              </button>
              {openFaq === index ? <p>{item.a}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

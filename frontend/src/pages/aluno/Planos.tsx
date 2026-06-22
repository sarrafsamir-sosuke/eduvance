import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Badge, Button, Spinner } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { api, getApiErrorMessage } from '../../lib/api';
import type { PlanoInfo } from '../../lib/types';
import { createPremiumCheckout, simulatePaymentApproved } from '../../services/paymentService';

export function AlunoPlanosPage() {
  const navigate = useNavigate();
  const { setPlano, refreshUser } = useAuth();
  const [plano, setPlanoInfo] = useState<PlanoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    api
      .get<PlanoInfo>('/planos/me')
      .then((r) => setPlanoInfo(r.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const isPremium = plano?.plano === 'premium';

  async function downgradePlan() {
    setWorking(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.patch<{ message: string; user: { plano: 'gratis' | 'premium' } }>('/planos/downgrade');
      setPlano('premium');
      setMessage(data.message);
      await refreshUser().catch(() => undefined);
      load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel atualizar o plano.'));
    } finally {
      setWorking(false);
    }
  }

  async function startPremiumCheckout() {
    setWorking(true);
    setError('');
    setMessage('');
    try {
      const data = await createPremiumCheckout();
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel iniciar o pagamento. Use a simulacao para apresentacao do TCC.'));
    } finally {
      setWorking(false);
    }
  }

  async function simulatePremium() {
    setWorking(true);
    setError('');
    setMessage('');
    try {
      const data = await simulatePaymentApproved();
      setPlano('premium');
      setMessage(data.message);
      await refreshUser().catch(() => undefined);
      load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel ativar o Premium simulado.'));
    } finally {
      setWorking(false);
    }
  }

  return (
    <AppLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Meu plano</h1>
            <span className="page-subtitle">Gerencie sua assinatura e desbloqueie recursos premium.</span>
          </div>
        </div>

        {loading ? (
          <Spinner label="Carregando plano..." />
        ) : (
          <>
            <section className="plan-current">
              <div>
                <span className="plan-current-label">Plano atual</span>
                <h2>
                  EduVance {isPremium ? 'Premium' : 'Gratis'} {isPremium ? <Badge tone="yellow">Premium</Badge> : <Badge tone="slate">Gratis</Badge>}
                </h2>
                <p>
                  EduAI: {plano?.aiPerguntasUsadas ?? 0}/{plano?.aiLimitePerguntas ?? 5} perguntas usadas hoje.
                </p>
              </div>
              <span className="plan-current-icon" aria-hidden="true">
                <Icon name={isPremium ? 'star' : 'card'} size={26} />
              </span>
            </section>

            {message ? <p className="form-feedback success">{message}</p> : null}
            {error ? <p className="form-feedback error">{error}</p> : null}

            <div className="planos-grid two">
              <article className={`plano-card${!isPremium ? ' is-current' : ''}`}>
                {!isPremium ? <span className="plano-badge slate">Seu plano</span> : null}
                <h2>Gratis</h2>
                <p className="plano-tagline">Para comecar a estudar.</p>
                <div className="plano-price">
                  <strong>R$ 0</strong>
                  <span>/mes</span>
                </div>
                <ul className="plano-features">
                  <li><Icon name="checkCircle" size={17} /> Disciplinas e aulas gratuitas</li>
                  <li><Icon name="checkCircle" size={17} /> 5 perguntas/dia na EduAI</li>
                  <li><Icon name="checkCircle" size={17} /> Progresso e conquistas</li>
                </ul>
                {isPremium ? (
                  <Button variant="outline" full loading={working} onClick={downgradePlan}>
                    Voltar para o gratis
                  </Button>
                ) : (
                  <Button variant="outline" full disabled>
                    Plano atual
                  </Button>
                )}
              </article>

              <article className={`plano-card is-featured${isPremium ? ' is-current' : ''}`}>
                <span className="plano-badge">{isPremium ? 'Seu plano' : 'Mais popular'}</span>
                <h2>Premium</h2>
                <p className="plano-tagline">A experiencia completa.</p>
                <div className="plano-price">
                  <strong>R$ 5</strong>
                  <span>/mes</span>
                </div>
                <ul className="plano-features">
                  <li><Icon name="checkCircle" size={17} /> Todas as disciplinas e aulas premium</li>
                  <li><Icon name="checkCircle" size={17} /> 100 perguntas/dia na EduAI</li>
                  <li><Icon name="checkCircle" size={17} /> Quizzes premium e certificados</li>
                </ul>
                {isPremium ? (
                  <Button full disabled>
                    Plano atual
                  </Button>
                ) : (
                  <Button full loading={working} onClick={startPremiumCheckout}>
                    Assinar Premium
                  </Button>
                )}
                {!isPremium ? (
                  <p style={{ fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>
                    Pix e cartão via Mercado Pago
                  </p>
                ) : null}
              </article>
            </div>

            {!isPremium ? (
              <p className="plan-quick">
                Prefere revisar antes?{' '}
                <button type="button" className="text-link inline" onClick={() => navigate('/checkout')} disabled={working}>
                  Abrir checkout
                </button>
                {' '}ou{' '}
                <button type="button" className="text-link inline" onClick={simulatePremium} disabled={working}>
                  Ativar Premium direto (simulado)
                </button>
              </p>
            ) : null}
          </>
        )}
      </div>
    </AppLayout>
  );
}

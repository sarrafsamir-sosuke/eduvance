import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { BrandLogo } from '../../components/brand/BrandLogo';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../lib/api';
import { createPremiumCheckout, simulatePaymentApproved } from '../../services/paymentService';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser, setPlano, user } = useAuth();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [error, setError] = useState('');

  const isPremium = user?.plano === 'premium';

  function requireLogin() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout', message: 'Entre para concluir a assinatura Premium.' } });
      return false;
    }

    return true;
  }

  async function handleMercadoPagoCheckout() {
    setError('');
    if (!requireLogin() || isPremium) return;

    setLoadingCheckout(true);
    try {
      const data = await createPremiumCheckout();
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel iniciar o pagamento pelo Mercado Pago.'));
    } finally {
      setLoadingCheckout(false);
    }
  }

  async function handleSimulation() {
    setError('');
    if (!requireLogin() || isPremium) return;

    setLoadingSimulation(true);
    try {
      const data = await simulatePaymentApproved();
      setPlano('premium');
      await refreshUser().catch(() => undefined);
      navigate('/pagamento-efetuado', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel ativar o Premium simulado.'));
    } finally {
      setLoadingSimulation(false);
    }
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <Link to="/" className="brand-mark">
          <BrandLogo size="md" />
        </Link>
        <span className="checkout-secure">
          <Icon name="lock" size={15} /> Pagamento Mercado Pago
        </span>
      </header>

      <div className="checkout-body">
        <div className="checkout-main">
          <h1 className="display">Finalizar assinatura</h1>

          <section className="checkout-block">
            <h2>EduVance Premium</h2>
            <p className="checkout-alt">
              Pagamento seguro via Mercado Pago. Pix e cartão disponíveis conforme sua conta Mercado Pago. O EduVance não coleta nem armazena dados de pagamento.
            </p>
          </section>

          <section className="checkout-block">
            <h2>Beneficios incluidos</h2>
            <div className="success-perks">
              <span><Icon name="checkCircle" size={16} /> Todas as disciplinas e aulas premium</span>
              <span><Icon name="checkCircle" size={16} /> EduAI ampliada com 100 perguntas por dia</span>
              <span><Icon name="checkCircle" size={16} /> Quizzes premium, progresso e conquistas</span>
            </div>
          </section>

          {error ? <p className="form-feedback error">{error}</p> : null}
        </div>

        <aside className="checkout-summary">
          <h2>Resumo do pedido</h2>
          <div className="checkout-plan-card">
            <span className="checkout-plan-label">Plano</span>
            <strong>EduVance Premium</strong>
            <span className="checkout-plan-price">R$ 5/mes</span>
            <ul>
              <li><Icon name="check" size={15} /> Acesso completo</li>
              <li><Icon name="check" size={15} /> Pagamento seguro fora da plataforma</li>
              <li><Icon name="check" size={15} /> Ativacao apos confirmacao do webhook</li>
            </ul>
          </div>

          <div className="checkout-line">
            <span>Subtotal</span>
            <span>R$ 5,00</span>
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <strong>R$ 5,00</strong>
          </div>

          <Button full loading={loadingCheckout} disabled={isPremium || loadingSimulation} onClick={handleMercadoPagoCheckout}>
            {isPremium ? 'Premium ativo' : 'Pagar com Mercado Pago'} <Icon name="arrowRight" size={18} />
          </Button>
          <Button full variant="outline" loading={loadingSimulation} disabled={isPremium || loadingCheckout} onClick={handleSimulation}>
            Ativar Premium direto (simulado)
          </Button>
          <p className="checkout-guarantee">
            <Icon name="shield" size={14} /> Pix e cartão via Mercado Pago
          </p>
        </aside>
      </div>
    </main>
  );
}

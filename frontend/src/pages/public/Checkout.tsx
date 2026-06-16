import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { BrandLogo } from '../../components/brand/BrandLogo';
import { Icon } from '../../components/Icon';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { api, getApiErrorMessage } from '../../lib/api';

type Metodo = 'cartao' | 'pix' | 'boleto';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser, setPlano } = useAuth();
  const [metodo, setMetodo] = useState<Metodo>('cartao');
  const [form, setForm] = useState({ nome: '', email: '', cpf: '', cartao: '', titular: '', validade: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    // Sem login não dá para aplicar o upgrade: leva ao login e volta ao checkout.
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout', message: 'Entre para concluir a assinatura Premium.' } });
      return;
    }

    setLoading(true);
    try {
      // Pagamento simulado (TCC): aplica o upgrade real no backend.
      await api.patch('/planos/upgrade');
      setPlano('premium');
      await refreshUser().catch(() => undefined);
      navigate('/pagamento-efetuado', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível concluir a assinatura.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <Link to="/" className="brand-mark">
          <BrandLogo size="md" />
        </Link>
        <span className="checkout-secure">
          <Icon name="lock" size={15} /> Ambiente seguro
        </span>
      </header>

      <form className="checkout-body" onSubmit={handleSubmit}>
        <div className="checkout-main">
          <h1 className="display">Finalizar assinatura</h1>

          <section className="checkout-block">
            <h2>Dados pessoais</h2>
            <Input label="Nome completo" placeholder="João da Silva" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <div className="checkout-row">
              <Input label="E-mail" type="email" placeholder="joao@exemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
            </div>
          </section>

          <section className="checkout-block">
            <h2>Forma de pagamento</h2>
            <div className="pay-methods" role="group" aria-label="Forma de pagamento">
              {(['cartao', 'pix', 'boleto'] as Metodo[]).map((m) => (
                <button key={m} type="button" className={metodo === m ? 'active' : ''} onClick={() => setMetodo(m)}>
                  <Icon name={m === 'cartao' ? 'card' : m === 'pix' ? 'grid' : 'doc'} size={16} />
                  {m === 'cartao' ? 'Cartão de Crédito' : m === 'pix' ? 'PIX' : 'Boleto'}
                </button>
              ))}
            </div>

            {metodo === 'cartao' ? (
              <div className="checkout-card-form">
                <Input label="Número do cartão" placeholder="0000 0000 0000 0000" value={form.cartao} onChange={(e) => setForm({ ...form, cartao: e.target.value })} />
                <Input label="Nome no cartão" placeholder="JOÃO M SILVA" value={form.titular} onChange={(e) => setForm({ ...form, titular: e.target.value })} />
                <div className="checkout-row">
                  <Input label="Validade (MM/AA)" placeholder="12/28" value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} />
                  <Input label="CVV" placeholder="123" value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value })} />
                </div>
              </div>
            ) : (
              <p className="checkout-alt">
                {metodo === 'pix'
                  ? 'Um código PIX seria gerado aqui. Neste TCC o pagamento é simulado: clique em Assinar Agora para concluir.'
                  : 'Um boleto seria gerado aqui. Neste TCC o pagamento é simulado: clique em Assinar Agora para concluir.'}
              </p>
            )}
          </section>

          {error ? <p className="form-feedback error">{error}</p> : null}
        </div>

        <aside className="checkout-summary">
          <h2>Resumo do pedido</h2>
          <div className="checkout-plan-card">
            <span className="checkout-plan-label">Plano</span>
            <strong>EduVance Premium</strong>
            <span className="checkout-plan-price">R$ 19/mês</span>
            <ul>
              <li><Icon name="check" size={15} /> Acesso a todas as disciplinas</li>
              <li><Icon name="check" size={15} /> EduAI ampliada (100/dia)</li>
              <li><Icon name="check" size={15} /> Quizzes e conquistas premium</li>
            </ul>
          </div>

          <div className="checkout-line">
            <span>Subtotal</span>
            <span>R$ 29,00</span>
          </div>
          <div className="checkout-line">
            <span>Desconto promocional</span>
            <span className="text-green">- R$ 10,00</span>
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <strong>R$ 19,00</strong>
          </div>

          <Button full type="submit" loading={loading}>
            {loading ? 'Processando...' : 'Assinar agora'} <Icon name="arrowRight" size={18} />
          </Button>
          <p className="checkout-guarantee">
            <Icon name="shield" size={14} /> Garantia de 7 dias ou seu dinheiro de volta
          </p>
        </aside>
      </form>
    </main>
  );
}

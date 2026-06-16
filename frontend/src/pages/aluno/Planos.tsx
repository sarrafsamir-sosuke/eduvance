import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Badge, Button, Spinner } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { api, getApiErrorMessage } from '../../lib/api';
import type { PlanoInfo } from '../../lib/types';

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

  async function changePlan(action: 'upgrade' | 'downgrade') {
    setWorking(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.patch<{ message: string; user: { plano: 'gratis' | 'premium' } }>(`/planos/${action}`);
      setPlano(data.user.plano);
      setMessage(data.message);
      await refreshUser().catch(() => undefined);
      load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível atualizar o plano.'));
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
                  EduVance {isPremium ? 'Premium' : 'Grátis'} {isPremium ? <Badge tone="yellow">Premium</Badge> : <Badge tone="slate">Grátis</Badge>}
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
                <h2>Grátis</h2>
                <p className="plano-tagline">Para começar a estudar.</p>
                <div className="plano-price">
                  <strong>R$ 0</strong>
                  <span>/mês</span>
                </div>
                <ul className="plano-features">
                  <li><Icon name="checkCircle" size={17} /> Disciplinas e aulas gratuitas</li>
                  <li><Icon name="checkCircle" size={17} /> 5 perguntas/dia na EduAI</li>
                  <li><Icon name="checkCircle" size={17} /> Progresso e conquistas</li>
                </ul>
                {isPremium ? (
                  <Button variant="outline" full loading={working} onClick={() => changePlan('downgrade')}>
                    Voltar para o grátis
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
                <p className="plano-tagline">A experiência completa.</p>
                <div className="plano-price">
                  <strong>R$ 49</strong>
                  <span>/mês</span>
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
                  <Button full loading={working} onClick={() => navigate('/checkout')}>
                    Assinar Premium
                  </Button>
                )}
              </article>
            </div>

            {!isPremium ? (
              <p className="plan-quick">
                Quer testar agora?{' '}
                <button type="button" className="text-link inline" onClick={() => changePlan('upgrade')} disabled={working}>
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

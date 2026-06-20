import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { BrandLogo } from '../../components/brand/BrandLogo';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/ui';
import { homePathForUser, useAuth } from '../../context/AuthContext';
import { api, getApiErrorMessage } from '../../lib/api';
import type { PlanoInfo } from '../../lib/types';

export function PagamentoEfetuadoPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [plano, setPlano] = useState<PlanoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPremium = plano?.plano === 'premium' || user?.plano === 'premium';

  async function refreshStatus() {
    if (!isAuthenticated) return;

    setLoading(true);
    setError('');
    try {
      const { data } = await api.get<PlanoInfo>('/planos/me');
      setPlano(data);
      await refreshUser().catch(() => undefined);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel atualizar o status do plano.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <main className="success-page">
      <Link to="/" className="brand-mark success-brand">
        <BrandLogo size="md" />
      </Link>

      <div className="success-card">
        <span className="success-check" aria-hidden="true">
          <Icon name={isPremium ? 'check' : 'clock'} size={36} />
        </span>
        <h1 className="display">Pagamento recebido</h1>
        <p>
          {isPremium
            ? 'Sua assinatura EduVance Premium esta ativa.'
            : 'Seu pagamento pode levar alguns segundos para atualizar.'}
        </p>

        <div className="success-perks">
          <span><Icon name="checkCircle" size={16} /> Plano atual: {isPremium ? 'Premium' : 'aguardando confirmacao'}</span>
          <span><Icon name="checkCircle" size={16} /> Confirmacao feita pelo webhook do Mercado Pago</span>
          <span><Icon name="checkCircle" size={16} /> Seus acessos sao liberados automaticamente apos aprovacao</span>
        </div>

        {error ? <p className="form-feedback error">{error}</p> : null}

        <Button full variant="outline" loading={loading} onClick={refreshStatus}>
          Atualizar status
        </Button>
        <Button full onClick={() => navigate(isAuthenticated ? homePathForUser(user) : '/login')}>
          Ir para o dashboard <Icon name="arrowRight" size={18} />
        </Button>
        <Link className="text-link" to="/aluno/planos">
          Ver meu plano
        </Link>
      </div>
    </main>
  );
}

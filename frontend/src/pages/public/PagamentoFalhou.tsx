import { Link, useNavigate } from 'react-router-dom';

import { BrandLogo } from '../../components/brand/BrandLogo';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/ui';

export function PagamentoFalhouPage() {
  const navigate = useNavigate();

  return (
    <main className="success-page">
      <Link to="/" className="brand-mark success-brand">
        <BrandLogo size="md" />
      </Link>

      <div className="success-card">
        <span className="recover-lock" aria-hidden="true">
          <Icon name="close" size={34} />
        </span>
        <h1 className="display">Pagamento nao concluido</h1>
        <p>Nao foi possivel concluir sua assinatura pelo Mercado Pago. Voce pode tentar novamente quando quiser.</p>
        <Button full onClick={() => navigate('/checkout')}>
          Tentar novamente
        </Button>
        <Link className="text-link" to="/aluno/planos">
          Voltar aos planos
        </Link>
      </div>
    </main>
  );
}

import { Link, useNavigate } from 'react-router-dom';

import { BrandLogo } from '../../components/brand/BrandLogo';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/ui';

export function PagamentoPendentePage() {
  const navigate = useNavigate();

  return (
    <main className="success-page">
      <Link to="/" className="brand-mark success-brand">
        <BrandLogo size="md" />
      </Link>

      <div className="success-card">
        <span className="recover-lock" aria-hidden="true">
          <Icon name="clock" size={34} />
        </span>
        <h1 className="display">Pagamento pendente</h1>
        <p>O Mercado Pago ainda esta processando sua assinatura. Assim que o pagamento for aprovado, o Premium sera ativado automaticamente.</p>
        <Button full onClick={() => navigate('/aluno/planos')}>
          Voltar aos planos
        </Button>
      </div>
    </main>
  );
}

import { Link, useNavigate } from 'react-router-dom';

import { BrandLogo } from '../../components/brand/BrandLogo';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/ui';
import { homePathForUser, useAuth } from '../../context/AuthContext';

export function PagamentoEfetuadoPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  return (
    <main className="success-page">
      <Link to="/" className="brand-mark success-brand">
        <BrandLogo size="md" />
      </Link>

      <div className="success-card">
        <span className="success-check" aria-hidden="true">
          <Icon name="check" size={36} />
        </span>
        <h1 className="display">Pagamento efetuado!</h1>
        <p>
          Sua assinatura <strong>EduVance Premium</strong> está ativa. Agora você tem acesso a todas as
          disciplinas, aulas premium e à EduAI ampliada.
        </p>

        <div className="success-perks">
          <span><Icon name="checkCircle" size={16} /> Disciplinas premium liberadas</span>
          <span><Icon name="checkCircle" size={16} /> EduAI com 100 perguntas/dia</span>
          <span><Icon name="checkCircle" size={16} /> Conquistas exclusivas</span>
        </div>

        <Button full onClick={() => navigate(isAuthenticated ? homePathForUser(user) : '/login')}>
          Ir para o Dashboard <Icon name="arrowRight" size={18} />
        </Button>
        <Link className="text-link" to="/aluno/planos">
          Ver meu plano
        </Link>
      </div>
    </main>
  );
}

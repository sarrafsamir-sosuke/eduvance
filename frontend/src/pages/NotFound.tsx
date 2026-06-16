import { useNavigate } from 'react-router-dom';

import { BrandLogo } from '../components/brand/BrandLogo';
import { Button } from '../components/ui';
import { homePathForUser, useAuth } from '../context/AuthContext';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <main className="notfound-page">
      <BrandLogo size="lg" />
      <h1 className="display">Página não encontrada</h1>
      <p>O endereço que você tentou acessar não existe ou foi movido.</p>
      <div className="notfound-actions">
        <Button onClick={() => navigate('/')}>Ir para o início</Button>
        {isAuthenticated ? (
          <Button variant="outline" onClick={() => navigate(homePathForUser(user))}>
            Meu painel
          </Button>
        ) : (
          <Button variant="outline" onClick={() => navigate('/login')}>
            Entrar
          </Button>
        )}
      </div>
    </main>
  );
}

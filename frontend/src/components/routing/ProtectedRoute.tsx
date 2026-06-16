import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth, homePathForUser } from '../../context/AuthContext';
import type { UserType } from '../../lib/types';
import { FullPageLoader } from '../ui';

// Exige usuario autenticado. Sem token, redireciona para /login guardando a origem.
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

// Restringe a area por tipo de usuario. Se o tipo nao bater, manda para o painel correto.
export function RoleRoute({ allow }: { allow: UserType[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(user.tipo)) {
    return <Navigate to={homePathForUser(user)} replace />;
  }

  return <Outlet />;
}

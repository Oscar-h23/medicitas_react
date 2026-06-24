import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Rol } from '../types';

interface Props {
  children: React.ReactNode;
  roles?: Rol[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

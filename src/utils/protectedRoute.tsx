import { Navigate } from 'react-router-dom';
import { getCookie } from './cookieFunc';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = getCookie('token');
  const username = getCookie('username');

  if (!token || !username) {
    // Redirigir a /login que es la ruta configurada en tu Router
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
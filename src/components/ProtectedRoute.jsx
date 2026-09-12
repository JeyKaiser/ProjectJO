import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessRole } from '../lib/permissions';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { role, session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessRole(role, allowedRoles)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

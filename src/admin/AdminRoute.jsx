import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import { isStaff } from './permissions';

export default function AdminRoute() {
  const { user, initializing, isAuthenticated } = useAuth();

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading label="Loading..." />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isStaff(user)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

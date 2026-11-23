import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

export default function RoleRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

   if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

   if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

   const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

   if (!user || !roles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

   return children ? children : <Outlet />;
}
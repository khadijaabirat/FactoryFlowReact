import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';
import AdminLayout from './layouts/AdminLayout';
import OperatorLayout from './layouts/OperatorLayout';
import InstallationPage from './pages/auth/InstallationPage';
import LoginPage from './pages/auth/LoginPage';
import AccessDeniedPage from './pages/auth/AccessDeniedPage';
import NotFoundPage from './pages/auth/NotFoundPage';
import DashboardPage from './pages/admin/DashboardPage';
import MaterialsListPage from './pages/admin/MaterialsListPage';
import StockMovementsPage from './pages/admin/StockMovementsPage';
import ProductsListPage from './pages/admin/ProductsListPage';
import OrdersListPage from './pages/admin/OrdersListPage';
export default function App() {
  return (
    <Routes>
       <Route path="/installation" element={<InstallationPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

       <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
<Route path="materials" element={<MaterialsListPage />} />
            <Route path="stock-movements" element={<StockMovementsPage />} />
            <Route path="products" element={<ProductsListPage />} />
            <Route path="orders" element={<OrdersListPage />} />
            <Route path="users" element={<div>Utilisateurs (à venir)</div>} />
          </Route>
        </Route>

         <Route element={<RoleRoute allowedRoles={['OPERATOR']} />}>
          <Route path="/operator" element={<OperatorLayout />}>
            <Route index element={<div>Mes ordres (à venir)</div>} />
          </Route>
        </Route>
      </Route>

       <Route path="/" element={<Navigate to="/login" replace />} />

       <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
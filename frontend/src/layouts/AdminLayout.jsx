import { NavLink, Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import { 
  LayoutDashboard, 
  Boxes, 
  Package, 
  ClipboardList, 
  Users 
} from 'lucide-react';

export default function AdminLayout() {
   const navItems = [
    { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/admin/materials', label: 'Matières premières', icon: Boxes },
    { to: '/admin/products', label: 'Produits & Recettes', icon: Package },
    { to: '/admin/orders', label: 'Ordres de fabrication', icon: ClipboardList },
    { to: '/admin/users', label: 'Utilisateurs', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
       <aside className="w-full md:w-64 bg-slate-800 border-r border-slate-700 flex flex-col shrink-0">
         <div className="p-6 border-b border-slate-700 flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            FF
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">FactoryFlow</h1>
            <span className="text-xs text-blue-400 font-medium">Administration</span>
          </div>
        </div>

         <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

       <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        <Header />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
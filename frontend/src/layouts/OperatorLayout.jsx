import { NavLink, Outlet } from 'react-router-dom';
import { ClipboardList, Factory } from 'lucide-react';

export default function OperatorLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
       <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-base leading-tight">FactoryFlow</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Atelier Production
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Espace d'exécution opérateur</p>
            </div>
          </div>

           <nav className="flex items-center space-x-2">
            <NavLink
              to="/operator"
              end
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`
              }
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>Mes Ordres de Fabrication</span>
            </NavLink>
          </nav>
        </div>
      </header>

       <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { LogOut, User, ShieldAlert } from 'lucide-react';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between shadow-sm">
         <div className="flex items-center space-x-2 text-sm text-slate-400">
          <span>Session active</span>
          <span>•</span>
          <span className="text-slate-200 font-medium">Safi, Maroc</span>
        </div>

         <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="text-left hidden sm:block leading-tight">
              <p className="text-sm font-medium text-white">{user?.name || 'Utilisateur'}</p>
              <p className="text-xs text-slate-400">{user?.email || ''}</p>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                user?.role === 'ADMIN'
                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {user?.role === 'ADMIN' ? 'Admin' : 'Opérateur'}
            </span>
          </div>

           <button
            onClick={() => setShowConfirm(true)}
            title="Se déconnecter"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition duration-150 border border-transparent hover:border-rose-500/30"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

       {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Confirmer la déconnexion</h3>
            <p className="text-sm text-slate-400 mb-6">
              Êtes-vous sûr de vouloir quitter votre session FactoryFlow ?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition"
              >
                Annuler
              </button>
              <button
                onClick={logout}
                className="flex-1 py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition shadow-lg shadow-rose-600/30"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
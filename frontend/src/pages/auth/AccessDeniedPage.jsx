import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleReturn = () => {
    if (user?.role === 'ADMIN') {
      navigate('/admin');
    } else if (user?.role === 'OPERATOR') {
      navigate('/operator');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full mx-auto flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">403</h1>
        <h2 className="text-xl font-bold text-slate-200 mb-2">Accès Refusé</h2>
        <p className="text-sm text-slate-400 mb-6">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette section industrielle.
        </p>

        <button
          onClick={handleReturn}
          className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition duration-150 border border-slate-600"
        >
          Retourner à mon espace
        </button>
      </div>
    </div>
  );
}
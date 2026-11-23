import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full mx-auto flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-200 mb-2">Page Introuvable</h2>
        <p className="text-sm text-slate-400 mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <button
          onClick={() => navigate('/login')}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 shadow-lg shadow-blue-600/30"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
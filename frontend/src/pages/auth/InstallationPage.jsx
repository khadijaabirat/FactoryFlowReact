import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import installationService from '../../services/installationService';

export default function InstallationPage() {
  const navigate = useNavigate();
 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
 
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function checkInstallation() {
      try {
        const data = await installationService.getStatus();
        if (data.installed) { 
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Erreur vérification installation:', err);
      } finally {
        setChecking(false);
      }
    }
    checkInstallation();
  }, [navigate]);
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');  
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
 
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Tous les champs sont obligatoires.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      await installationService.install({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccess('Administrateur initialisé avec succès ! Redirection...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) { 
      const message =
        err.response?.data?.message ||
        "Une erreur est survenue lors de l'installation.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };
 
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <p className="animate-pulse">Vérification de l'état du système...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto flex items-center justify-center mb-3 font-bold text-white shadow-lg shadow-blue-500/20">
            FF
          </div>
          <h1 className="text-2xl font-bold text-white">Installation Initiale</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configurez le premier compte Administrateur de FactoryFlow
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Nom complet
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="ex: Administrateur Principal"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Adresse Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@factoryflow.com"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition duration-150 shadow-lg shadow-blue-600/30 mt-2"
          >
            {loading ? 'Création en cours...' : 'Initialiser FactoryFlow'}
          </button>
        </form>
      </div>
    </div>
  );
}
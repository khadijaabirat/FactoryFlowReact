import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useContext(AuthContext);

   const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

   const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

   const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      console.error('Erreur de connexion :', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
         <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto flex items-center justify-center mb-3 font-bold text-white shadow-lg shadow-blue-500/20">
            FF
          </div>
          <h1 className="text-2xl font-bold text-white">Connexion</h1>
          <p className="text-sm text-slate-400 mt-1">
            Accédez à la plateforme de gestion FactoryFlow
          </p>
        </div>

         <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Adresse Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ex: operateur@factoryflow.com"
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

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 shadow-lg shadow-blue-600/30 mt-2"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
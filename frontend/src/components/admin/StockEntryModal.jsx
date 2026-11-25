import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import materialService from '../../services/materialService';
import stockMovementService from '../../services/stockMovementService';

export default function StockEntryModal({ onClose, onSaved }) {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({
    material: '',
    type: 'IN',
    quantity: '',
    reason: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loadingMats, setLoadingMats] = useState(true);

  useEffect(() => {
    materialService.getAll()
      .then((res) => setMaterials(res.data.data || res.data))
      .catch(() => setApiError('Impossible de charger les matières.'))
      .finally(() => setLoadingMats(false));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.material) errs.material = 'Sélectionnez une matière.';
    if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = 'La quantité doit être supérieure à 0.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');
    try {
      await stockMovementService.create({
        material: form.material,
        type: form.type,
        quantity: Number(form.quantity),
        reason: form.reason || undefined,
      });
      onSaved();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Nouveau mouvement de stock</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {apiError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm">
              {apiError}
            </div>
          )}

          {/* Matière */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Matière première *</label>
            {loadingMats ? (
              <div className="text-sm text-slate-500">Chargement...</div>
            ) : (
              <select
                name="material"
                value={form.material}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 bg-slate-900 border rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  errors.material ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                }`}
              >
                <option value="">-- Sélectionner --</option>
                {materials.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.quantity} {m.unit})
                  </option>
                ))}
              </select>
            )}
            {errors.material && <p className="text-xs text-rose-400 mt-1">{errors.material}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, type: 'IN' }))}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition ${
                  form.type === 'IN'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                ↓ Entrée (IN)
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, type: 'OUT' }))}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition ${
                  form.type === 'OUT'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                ↑ Sortie (OUT)
              </button>
            </div>
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Quantité *</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min="1"
              placeholder="Ex: 50"
              className={`w-full px-3 py-2.5 bg-slate-900 border rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                errors.quantity ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
              }`}
            />
            {errors.quantity && <p className="text-xs text-rose-400 mt-1">{errors.quantity}</p>}
          </div>

          {/* Motif */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Motif (optionnel)</label>
            <input
              type="text"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Ex: Réception fournisseur"
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </div>

          {/* Boutons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition shadow-lg shadow-blue-600/20"
            >
              {loading ? 'En cours...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

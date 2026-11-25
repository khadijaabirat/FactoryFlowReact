import { useState } from 'react';
import { X } from 'lucide-react';
import materialService from '../../services/materialService';

export default function MaterialForm({ material, onClose, onSaved }) {
  const isEdit = Boolean(material?._id);

  const [form, setForm] = useState({
    name: material?.name || '',
    unit: material?.unit || '',
    quantity: material?.quantity ?? 0,
    alertThreshold: material?.alertThreshold ?? 0,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Le nom est obligatoire.';
    if (!form.unit.trim()) errs.unit = "L'unité est obligatoire.";
    if (form.quantity < 0) errs.quantity = 'La quantité ne peut pas être négative.';
    if (form.alertThreshold < 0) errs.alertThreshold = 'Le seuil ne peut pas être négatif.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');
    try {
      if (isEdit) {
        await materialService.update(material._id, form);
      } else {
        await materialService.create(form);
      }
      onSaved();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">
            {isEdit ? 'Modifier la matière' : 'Nouvelle matière première'}
          </h2>
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

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nom *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ex: Acier inoxydable"
              className={`w-full px-3 py-2.5 bg-slate-900 border rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                errors.name ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
          </div>

          {/* Unité */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Unité *</label>
            <input
              type="text"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder="Ex: kg, litres, pièces"
              className={`w-full px-3 py-2.5 bg-slate-900 border rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                errors.unit ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
              }`}
            />
            {errors.unit && <p className="text-xs text-rose-400 mt-1">{errors.unit}</p>}
          </div>

          {/* Quantité & Seuil côte à côte */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Quantité</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2.5 bg-slate-900 border rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  errors.quantity ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                }`}
              />
              {errors.quantity && <p className="text-xs text-rose-400 mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Seuil d'alerte</label>
              <input
                type="number"
                name="alertThreshold"
                value={form.alertThreshold}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2.5 bg-slate-900 border rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  errors.alertThreshold ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                }`}
              />
              {errors.alertThreshold && <p className="text-xs text-rose-400 mt-1">{errors.alertThreshold}</p>}
            </div>
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
              {loading ? 'En cours...' : isEdit ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

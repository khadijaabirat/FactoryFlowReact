import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import materialService from '../../services/materialService';
import productService from '../../services/productService';

export default function ProductForm({ product, onClose, onSaved }) {
  const isEdit = Boolean(product?._id);

  const [materials, setMaterials] = useState([]);
  const [loadingMats, setLoadingMats] = useState(true);

  const [reference, setReference] = useState(product?.reference || '');
  const [name, setName] = useState(product?.name || '');
  const [composition, setComposition] = useState(() =>
    (product?.composition || []).map((item) => ({
      materialId: typeof item.materialId === 'object' ? item.materialId._id : item.materialId,
      quantity: item.quantity ?? 1,
    }))
  );

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    materialService
      .getAll()
      .then((res) => setMaterials(res.data.data || res.data.materials || res.data || []))
      .catch(() => setApiError('Impossible de charger les matières premières.'))
      .finally(() => setLoadingMats(false));
  }, []);

  const selectedIds = composition.map((c) => c.materialId).filter(Boolean);

  const handleAddRow = () => {
    setComposition((prev) => [...prev, { materialId: '', quantity: 1 }]);
    if (errors.composition) setErrors((prev) => ({ ...prev, composition: '' }));
  };

  const handleRemoveRow = (index) => {
    setComposition((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, value) => {
    setComposition((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: field === 'quantity' ? value : value } : row
      )
    );
    if (errors.composition) setErrors((prev) => ({ ...prev, composition: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!reference.trim()) errs.reference = 'La référence est obligatoire.';
    if (!name.trim()) errs.name = 'Le nom est obligatoire.';

    const seen = new Set();
    for (let i = 0; i < composition.length; i++) {
      const row = composition[i];
      if (!row.materialId) {
        errs.composition = 'Chaque ligne doit avoir une matière sélectionnée.';
        break;
      }
      if (seen.has(row.materialId)) {
        errs.composition = 'Les doublons de matière ne sont pas autorisés.';
        break;
      }
      seen.add(row.materialId);
      if (!row.quantity || Number(row.quantity) <= 0) {
        errs.composition = 'Toutes les quantités doivent être strictement supérieures à 0.';
        break;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    const cleanComposition = composition.map((c) => ({
      materialId: c.materialId,
      quantity: Number(c.quantity),
    }));

    try {
      if (isEdit) {
        await productService.update(product._id, {
          reference: reference.trim().toUpperCase(),
          name: name.trim(),
        });
        await productService.updateBOM(product._id, cleanComposition);
      } else {
        await productService.create({
          reference: reference.trim().toUpperCase(),
          name: name.trim(),
          composition: cleanComposition,
        });
      }
      onSaved();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erreur lors de la sauvegarde du produit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-xl shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">
            {isEdit ? 'Modifier le produit & BOM' : 'Nouveau produit fini'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {apiError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Référence */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Référence *</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => {
                  setReference(e.target.value);
                  if (errors.reference) setErrors((p) => ({ ...p, reference: '' }));
                }}
                placeholder="Ex: PRD-001"
                className={`w-full px-3 py-2.5 bg-slate-900 border rounded-lg text-sm text-slate-200 uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  errors.reference ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                }`}
              />
              {errors.reference && <p className="text-xs text-rose-400 mt-1">{errors.reference}</p>}
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nom du produit *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                }}
                placeholder="Ex: Boîtier industriel"
                className={`w-full px-3 py-2.5 bg-slate-900 border rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  errors.name ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Composition dynamique (BOM) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">
                Composition (Nomenclature BOM)
              </label>
              <button
                type="button"
                onClick={handleAddRow}
                disabled={loadingMats || selectedIds.length >= materials.length}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 disabled:opacity-40 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter un ingrédient
              </button>
            </div>

            {errors.composition && (
              <p className="text-xs text-rose-400 mb-2">{errors.composition}</p>
            )}

            {composition.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-900/50 border border-slate-700/60 rounded-lg p-3 text-center">
                Aucun ingrédient ajouté. Cliquez sur « Ajouter un ingrédient ».
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {composition.map((row, index) => {
                  const availableMaterials = materials.filter(
                    (m) => m._id === row.materialId || !selectedIds.includes(m._id)
                  );
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={row.materialId}
                        onChange={(e) => handleRowChange(index, 'materialId', e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- Matière --</option>
                        {availableMaterials.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name} ({m.unit})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        step="any"
                        min="0.001"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                        placeholder="Qté"
                        className="w-24 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Retirer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-3 border-t border-slate-700">
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
              {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

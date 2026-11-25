import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import userService from '../../services/userService';
import productService from '../../services/productService';
import materialService from '../../services/materialService';
import orderService from '../../services/orderService';

export default function OrderForm({ onClose, onSaved }) {
  const [operators, setOperators] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [assignedTo, setAssignedTo] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [usersRes, prodsRes, matsRes] = await Promise.all([
          userService.getAll(),
          productService.getAll(),
          materialService.getAll(),
        ]);
        const usersList = usersRes.data.data || usersRes.data.users || usersRes.data || [];
        setOperators(usersList.filter((u) => u.role === 'OPERATOR'));
        setProducts(prodsRes.data.Products || prodsRes.data.data || prodsRes.data || []);
        setMaterials(matsRes.data.data || matsRes.data.materials || matsRes.data || []);
      } catch (err) {
        setApiError('Impossible de charger les données (opérateurs, produits ou matières).');
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchAll();
  }, []);

  const selectedProductIds = items.map((i) => i.productId).filter(Boolean);

  const handleAddRow = () => {
    setItems((prev) => [...prev, { productId: '', quantity: 1 }]);
    if (errors.items) setErrors((prev) => ({ ...prev, items: '' }));
  };

  const handleRemoveRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
    if (errors.items) setErrors((prev) => ({ ...prev, items: '' }));
  };

  // Calcul agrégé des besoins matières avec useMemo (FCTRFLWRCT-77)
  const aggregatedNeeds = useMemo(() => {
    const needsMap = new Map();

    for (const item of items) {
      if (!item.productId || !item.quantity || Number(item.quantity) <= 0) continue;
      const product = products.find((p) => p._id === item.productId);
      if (!product || !product.composition) continue;

      const qtyMultiplier = Number(item.quantity);
      for (const comp of product.composition) {
        const matId = typeof comp.materialId === 'object' ? comp.materialId._id : comp.materialId;
        const matInfo = materials.find((m) => m._id === matId) || (typeof comp.materialId === 'object' ? comp.materialId : null);
        const needed = comp.quantity * qtyMultiplier;

        if (needsMap.has(matId)) {
          needsMap.get(matId).required += needed;
        } else {
          needsMap.set(matId, {
            materialId: matId,
            name: matInfo?.name || 'Matière inconnue',
            unit: matInfo?.unit || '',
            available: matInfo?.quantity ?? 0,
            required: needed,
          });
        }
      }
    }

    return Array.from(needsMap.values()).map((entry) => ({
      ...entry,
      sufficient: entry.available >= entry.required,
    }));
  }, [items, products, materials]);

  const validate = () => {
    const errs = {};
    if (!assignedTo) errs.assignedTo = 'Veuillez sélectionner un opérateur.';
    if (items.length === 0) {
      errs.items = 'Ajoutez au moins un produit.';
    } else {
      const seen = new Set();
      for (const item of items) {
        if (!item.productId) {
          errs.items = 'Chaque ligne doit contenir un produit.';
          break;
        }
        if (seen.has(item.productId)) {
          errs.items = 'Les doublons de produit ne sont pas autorisés.';
          break;
        }
        seen.add(item.productId);
        if (!item.quantity || Number(item.quantity) < 1) {
          errs.items = 'Chaque quantité doit être au moins 1.';
          break;
        }
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
    try {
      await orderService.create({
        assignedTo,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
        })),
      });
      onSaved();
    } catch (err) {
      setApiError(err.response?.data?.message || "Erreur lors de la création de l'ordre.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Nouvel ordre de fabrication</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {apiError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm">
              {apiError}
            </div>
          )}

          {loadingData ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Sélecteur d'opérateur */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Opérateur assigné *
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => {
                    setAssignedTo(e.target.value);
                    if (errors.assignedTo) setErrors((p) => ({ ...p, assignedTo: '' }));
                  }}
                  className={`w-full px-3 py-2.5 bg-slate-900 border rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    errors.assignedTo ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                  }`}
                >
                  <option value="">-- Sélectionner un opérateur --</option>
                  {operators.map((op) => (
                    <option key={op._id} value={op._id}>
                      {op.name} ({op.email})
                    </option>
                  ))}
                </select>
                {errors.assignedTo && (
                  <p className="text-xs text-rose-400 mt-1">{errors.assignedTo}</p>
                )}
              </div>

              {/* Lignes produits dynamiques */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">
                    Produits à fabriquer *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    disabled={selectedProductIds.length >= products.length}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 disabled:opacity-40 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter un produit
                  </button>
                </div>

                {errors.items && <p className="text-xs text-rose-400 mb-2">{errors.items}</p>}

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((row, index) => {
                    const availableProducts = products.filter(
                      (p) => p._id === row.productId || !selectedProductIds.includes(p._id)
                    );
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <select
                          value={row.productId}
                          onChange={(e) => handleRowChange(index, 'productId', e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        >
                          <option value="">-- Produit --</option>
                          {availableProducts.map((p) => (
                            <option key={p._id} value={p._id}>
                              [{p.reference}] {p.name}
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                          className="w-24 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        />

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(index)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Retirer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tableau récapitulatif des besoins vs stocks (FCTRFLWRCT-78) */}
              {aggregatedNeeds.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white">
                    Besoins agrégés en matières premières vs Stocks disponibles
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-700 text-slate-400 uppercase">
                          <th className="py-2 px-3">Matière</th>
                          <th className="py-2 px-3 text-right">Besoin total</th>
                          <th className="py-2 px-3 text-right">Stock dispo</th>
                          <th className="py-2 px-3 text-center">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aggregatedNeeds.map((need) => (
                          <tr key={need.materialId} className="border-b border-slate-800 last:border-0">
                            <td className="py-2 px-3 text-slate-200 font-medium">{need.name}</td>
                            <td className="py-2 px-3 text-right text-slate-200 font-semibold">
                              {need.required} {need.unit}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-400">
                              {need.available} {need.unit}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {need.sufficient ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Suffisant
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                  <AlertTriangle className="w-3 h-3" />
                                  Insuffisant
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Boutons */}
          <div className="flex space-x-3 pt-2 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || loadingData}
              className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition shadow-lg shadow-blue-600/20"
            >
              {loading ? 'Création...' : "Créer l'ordre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { X, Package, Layers } from 'lucide-react';

export default function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  const composition = product.composition || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{product.name}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                {product.reference}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Nomenclature (BOM) — {composition.length} composant(s)
          </h3>

          {composition.length === 0 ? (
            <p className="text-sm text-slate-400 bg-slate-900/50 border border-slate-700/60 rounded-lg p-4 text-center">
              Aucune matière première associée à ce produit.
            </p>
          ) : (
            <div className="bg-slate-900/60 border border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                    <th className="py-2.5 px-4">Matière première</th>
                    <th className="py-2.5 px-4 text-right">Quantité unitaire</th>
                  </tr>
                </thead>
                <tbody>
                  {composition.map((item, idx) => {
                    const mat = item.materialId;
                    const matName = typeof mat === 'object' && mat !== null ? mat.name : mat;
                    const matUnit = typeof mat === 'object' && mat !== null ? mat.unit : '';
                    return (
                      <tr key={item._id || idx} className="border-b border-slate-800 last:border-0">
                        <td className="py-2.5 px-4 text-slate-200 font-medium">{matName || 'Inconnue'}</td>
                        <td className="py-2.5 px-4 text-right text-blue-400 font-semibold">
                          {item.quantity} {matUnit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

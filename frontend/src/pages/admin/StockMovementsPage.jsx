import { useState, useEffect } from 'react';
import { Plus, ArrowDownCircle, ArrowUpCircle, History } from 'lucide-react';
import stockMovementService from '../../services/stockMovementService';
import StockEntryModal from '../../components/admin/StockEntryModal';
import { formatDate } from '../../utils/formatters';

export default function StockMovementsPage() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const res = await stockMovementService.getAll();
      setMovements(res.data.data || res.data);
    } catch (err) {
      setError('Erreur lors du chargement des mouvements.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <History className="w-7 h-7 text-violet-400" />
          Mouvements de stock
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          Nouveau mouvement
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tableau */}
      {movements.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun mouvement de stock enregistré.</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Matière</th>
                  <th className="py-3 px-4">Quantité</th>
                  <th className="py-3 px-4">Motif</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((mv) => (
                  <tr key={mv._id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                    <td className="py-3 px-4">
                      {mv.type === 'IN' ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                          <ArrowDownCircle className="w-3 h-3" />
                          Entrée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-semibold bg-rose-500/10 text-rose-400 border-rose-500/30">
                          <ArrowUpCircle className="w-3 h-3" />
                          Sortie
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">
                      {mv.material?.name || 'N/A'}
                    </td>
                    <td className={`py-3 px-4 font-semibold ${mv.type === 'IN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {mv.type === 'IN' ? '+' : '-'}{mv.quantity} {mv.material?.unit || ''}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {mv.reason || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {formatDate(mv.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <StockEntryModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            fetchMovements();
          }}
        />
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Package,
} from 'lucide-react';
import orderService from '../../services/orderService';
import { formatDate, getStatusBadge } from '../../utils/formatters';

export default function OperatorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [startModalOrder, setStartModalOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [stockError, setStockError] = useState('');

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await orderService.getMyOrders();
      setOrders(res.data.orders || res.data.data || res.data || []);
    } catch (err) {
      setError('Erreur lors du chargement de vos ordres de fabrication.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'ALL') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  // Calcul des quantités totales requises à partir du snapshot figé (FCTRFLWRCT-91)
  const requiredMaterials = useMemo(() => {
    if (!startModalOrder) return [];
    const map = new Map();
    for (const item of startModalOrder.items || []) {
      for (const mat of item.snapshot || []) {
        const key = String(mat.materialId);
        const total = item.quantity * mat.quantityPerUnit;
        if (map.has(key)) {
          map.get(key).total += total;
        } else {
          map.set(key, {
            materialId: key,
            reference: mat.reference,
            name: mat.name,
            unit: mat.unit,
            total,
          });
        }
      }
    }
    return Array.from(map.values());
  }, [startModalOrder]);

  const handleConfirmStart = async () => {
    if (!startModalOrder) return;
    setActionLoading(true);
    setStockError('');
    try {
      await orderService.start(startModalOrder._id);
      setStartModalOrder(null);
      await fetchMyOrders();
    } catch (err) {
      // Traitement erreur stock insuffisant avec affichage de la matière manquante (FCTRFLWRCT-92)
      const msg =
        err.response?.data?.message ||
        "Impossible de démarrer l'ordre (vérifiez les stocks disponibles).";
      setStockError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishOrder = async (orderId) => {
    setActionLoading(true);
    setError('');
    try {
      await orderService.finish(orderId);
      await fetchMyOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la clôture de l'ordre.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête + Filtre */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-emerald-400" />
          Mes ordres de fabrication
        </h1>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="PLANIFIE">Planifiés</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINE">Terminés</option>
          <option value="ANNULE">Annulés</option>
        </select>
      </div>

      {/* Erreur globale */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Liste des ordres */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-800/50 border border-slate-700/60 rounded-xl">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun ordre de fabrication assigné pour ce filtre.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div
                key={order._id}
                className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top row: Date & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      Assigné le {formatDate(order.createdAt)}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Produits de l'ordre */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-emerald-400" />
                      Produits à fabriquer
                    </h3>
                    <div className="bg-slate-900/60 border border-slate-700/60 rounded-lg divide-y divide-slate-800">
                      {(order.items || []).map((item, idx) => (
                        <div key={item._id || idx} className="px-3 py-2 flex items-center justify-between text-sm">
                          <span className="text-slate-200 font-medium">
                            {item.productId?.name || 'Produit'}
                            {item.productId?.reference && (
                              <span className="ml-2 text-xs font-mono text-slate-400">
                                ({item.productId.reference})
                              </span>
                            )}
                          </span>
                          <span className="font-bold text-emerald-400">× {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Horodatage cycle de vie (startedAt / endedAt) */}
                  {(order.startedAt || order.endedAt) && (
                    <div className="text-xs text-slate-400 space-y-1 pt-1">
                      {order.startedAt && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Démarré : {formatDate(order.startedAt)}</span>
                        </div>
                      )}
                      {order.endedAt && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Clôturé : {formatDate(order.endedAt)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions selon statut */}
                <div className="pt-3 border-t border-slate-700/70 flex justify-end gap-2">
                  {order.status === 'PLANIFIE' && (
                    <button
                      onClick={() => {
                        setStockError('');
                        setStartModalOrder(order);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition shadow-lg shadow-blue-600/20"
                    >
                      <Play className="w-4 h-4" />
                      Démarrer la fabrication
                    </button>
                  )}

                  {order.status === 'EN_COURS' && (
                    <button
                      onClick={() => handleFinishOrder(order._id)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium transition shadow-lg shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {actionLoading ? 'Clôture...' : 'Clôturer la fabrication'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale confirmation démarrage + rappel quantités + erreur stock insuffisant (FCTRFLWRCT-91, 92) */}
      {startModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Démarrer la fabrication ?</h3>
                <p className="text-xs text-slate-400">
                  Les matières premières ci-dessous seront déduites du stock.
                </p>
              </div>
            </div>

            {/* Erreur de stock insuffisant */}
            {stockError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-lg text-sm flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-400">Stock insuffisant</p>
                  <p className="text-xs mt-0.5">{stockError}</p>
                </div>
              </div>
            )}

            {/* Rappel quantités requises */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase">
                    <th className="py-2 px-3">Matière</th>
                    <th className="py-2 px-3 text-right">Quantité requise</th>
                  </tr>
                </thead>
                <tbody>
                  {requiredMaterials.map((m) => (
                    <tr key={m.materialId} className="border-b border-slate-800 last:border-0">
                      <td className="py-2 px-3 text-slate-200 font-medium">{m.name}</td>
                      <td className="py-2 px-3 text-right text-blue-400 font-semibold">
                        {m.total} {m.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setStartModalOrder(null)}
                disabled={actionLoading}
                className="flex-1 py-2 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmStart}
                disabled={actionLoading}
                className="flex-1 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition shadow-lg shadow-blue-600/20"
              >
                {actionLoading ? 'Démarrage...' : 'Confirmer et démarrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

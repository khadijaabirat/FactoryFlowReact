import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, ClipboardList, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import orderService from '../../services/orderService';
import OrderForm from '../../components/admin/OrderForm';
import { formatDate, getStatusBadge } from '../../utils/formatters';

const ITEMS_PER_PAGE = 8;

export default function OrdersListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAll();
      setOrders(res.data.orders || res.data.data || res.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des ordres de fabrication.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const operatorName = order.assignedTo?.name?.toLowerCase() || '';
      const productMatch = (order.items || []).some((it) =>
        (it.productId?.name || '').toLowerCase().includes(q) ||
        (it.productId?.reference || '').toLowerCase().includes(q)
      );
      return operatorName.includes(q) || productMatch || order._id.toLowerCase().includes(q);
    });
  }, [orders, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page, totalPages]);

  const handleCancelOrder = async () => {
    if (!cancelConfirm) return;
    setCancelling(true);
    try {
      await orderService.cancel(cancelConfirm._id);
      setCancelConfirm(null);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'annulation de l'ordre.");
      setCancelConfirm(null);
    } finally {
      setCancelling(false);
    }
  };

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
          <ClipboardList className="w-7 h-7 text-violet-400" />
          Ordres de fabrication
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          Nouvel ordre
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Barre de filtrage */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par opérateur ou produit..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="PLANIFIE">Planifié</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINE">Terminé</option>
          <option value="ANNULE">Annulé</option>
        </select>
      </div>

      {/* Tableau */}
      {paginated.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun ordre de fabrication trouvé.</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Opérateur</th>
                  <th className="py-3 px-4">Produits</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Date création</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((order) => {
                  const badge = getStatusBadge(order.status);
                  return (
                    <tr key={order._id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                      <td className="py-3 px-4 text-white font-medium">
                        {order.assignedTo?.name || 'Non assigné'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(order.items || []).map((item, i) => (
                            <span
                              key={item._id || i}
                              className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300"
                            >
                              {item.productId?.name || 'Produit'} × {item.quantity}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-4 text-right">
                        {order.status === 'PLANIFIE' && (
                          <button
                            onClick={() => setCancelConfirm(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 rounded-lg transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Annuler
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700 bg-slate-900/30 text-sm text-slate-400">
              <span>
                Page {Math.min(page, totalPages)} sur {totalPages} ({filtered.length} ordres)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal création ordre */}
      {showCreate && (
        <OrderForm
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            fetchOrders();
          }}
        />
      )}

      {/* Modale confirmation annulation obligatoire (FCTRFLWRCT-83) */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Annuler cet ordre ?</h3>
            <p className="text-sm text-slate-400 mb-6">
              L'ordre assigné à <span className="text-white font-medium">{cancelConfirm.assignedTo?.name}</span> passera au statut <span className="text-rose-400 font-semibold">ANNULE</span>. Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setCancelConfirm(null)}
                disabled={cancelling}
                className="flex-1 py-2 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition"
              >
                Retour
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-medium transition shadow-lg shadow-rose-600/30"
              >
                {cancelling ? 'Annulation...' : "Confirmer l'annulation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

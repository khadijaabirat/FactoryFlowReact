import { useState, useEffect, useMemo } from 'react';
import { Package, Boxes, ClipboardList, AlertTriangle } from 'lucide-react';
import materialService from '../../services/materialService';
import productService from '../../services/productService';
import orderService from '../../services/orderService';

export default function DashboardPage() {
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matRes, prodRes, ordRes, alertRes] = await Promise.all([
          materialService.getAll(),
          productService.getAll(),
          orderService.getAll(),
          materialService.getLowStockAlerts(),
        ]);
        setMaterials(matRes.data.data || matRes.data);
        setProducts(prodRes.data.data || prodRes.data);
        setOrders(ordRes.data.data || ordRes.data);
        setLowStock(alertRes.data.data || alertRes.data);
      } catch (err) {
        setError('Erreur lors du chargement des données du tableau de bord.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const orderStats = useMemo(() => {
    const total = orders.length;
    if (total === 0) return { PLANIFIE: 0, EN_COURS: 0, TERMINE: 0, ANNULE: 0 };
    const counts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    return {
      PLANIFIE: counts['PLANIFIE'] || 0,
      EN_COURS: counts['EN_COURS'] || 0,
      TERMINE: counts['TERMINE'] || 0,
      ANNULE: counts['ANNULE'] || 0,
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  const kpis = [
    { label: 'Matières premières', value: materials.length, icon: Boxes, color: 'blue' },
    { label: 'Produits finis', value: products.length, icon: Package, color: 'emerald' },
    { label: 'Ordres de fabrication', value: orders.length, icon: ClipboardList, color: 'violet' },
    { label: 'Alertes stock bas', value: lowStock.length, icon: AlertTriangle, color: 'amber' },
  ];

  const statusConfig = [
    { key: 'PLANIFIE', label: 'Planifié', color: 'blue' },
    { key: 'EN_COURS', label: 'En cours', color: 'amber' },
    { key: 'TERMINE', label: 'Terminé', color: 'emerald' },
    { key: 'ANNULE', label: 'Annulé', color: 'rose' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">{kpi.label}</span>
              <div className={`w-10 h-10 rounded-lg bg-${kpi.color}-500/10 border border-${kpi.color}-500/30 flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 text-${kpi.color}-400`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

       <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-white mb-4">Répartition des ordres par statut</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statusConfig.map((s) => (
            <div
              key={s.key}
              className={`bg-${s.color}-500/10 border border-${s.color}-500/20 rounded-lg p-4 text-center`}
            >
              <p className={`text-2xl font-bold text-${s.color}-400`}>{orderStats[s.key]}</p>
              <p className="text-sm text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

       <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Alertes de stock bas
        </h2>
        {lowStock.length === 0 ? (
          <p className="text-slate-400 text-sm">Aucune alerte — tous les stocks sont suffisants.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="py-3 px-4">Matière</th>
                  <th className="py-3 px-4">Stock actuel</th>
                  <th className="py-3 px-4">Seuil d'alerte</th>
                  <th className="py-3 px-4">Criticité</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((mat) => {
                  const ratio = mat.quantity / mat.alertThreshold;
                  let badge = { text: 'Critique', css: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
                  if (ratio > 0.5) badge = { text: 'Attention', css: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };

                  return (
                    <tr key={mat._id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-3 px-4 text-white font-medium">{mat.name}</td>
                      <td className="py-3 px-4 text-slate-300">{mat.quantity} {mat.unit}</td>
                      <td className="py-3 px-4 text-slate-300">{mat.alertThreshold} {mat.unit}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${badge.css}`}>
                          {badge.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
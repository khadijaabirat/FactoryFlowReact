export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getStatusBadge(status) {
  switch (status) {
    case 'PLANIFIE':
      return { label: 'Planifié', className: 'bg-blue-100 text-blue-800 border-blue-300' };
    case 'EN_COURS':
      return { label: 'En cours', className: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'TERMINE':
      return { label: 'Terminé', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'ANNULE':
      return { label: 'Annulé', className: 'bg-rose-100 text-rose-800 border-rose-300' };
    default:
      return { label: status || 'Inconnu', className: 'bg-slate-100 text-slate-800 border-slate-300' };
  }
}

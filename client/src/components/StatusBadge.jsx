const statusStyles = {
  New: {
    badge: 'bg-blue-50 text-blue-700 ring-blue-700/20',
    dot: 'bg-blue-500',
  },
  Contacted: {
    badge: 'bg-amber-50 text-amber-700 ring-amber-700/20',
    dot: 'bg-amber-500',
  },
  Qualified: {
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-700/20',
    dot: 'bg-emerald-500',
  },
  Lost: {
    badge: 'bg-rose-50 text-rose-700 ring-rose-700/20',
    dot: 'bg-rose-500',
  },
};

const StatusBadge = ({ status }) => {
  const config = statusStyles[status] || {
    badge: 'bg-slate-100 text-slate-700 ring-slate-600/20',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${config.badge}`}
    >
      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;


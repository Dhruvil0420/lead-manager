const cardConfigs = [
  {
    key: 'total',
    label: 'Total Leads',
    status: '', // All
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    activeRing: 'ring-slate-500 border-slate-400',
    countColor: 'text-slate-900',
    dotColor: 'bg-slate-500',
  },
  {
    key: 'New',
    label: 'New',
    status: 'New',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    activeRing: 'ring-blue-600 border-blue-400',
    countColor: 'text-blue-700',
    dotColor: 'bg-blue-500',
  },
  {
    key: 'Contacted',
    label: 'Contacted',
    status: 'Contacted',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    activeRing: 'ring-amber-500 border-amber-400',
    countColor: 'text-amber-700',
    dotColor: 'bg-amber-500',
  },
  {
    key: 'Qualified',
    label: 'Qualified',
    status: 'Qualified',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeRing: 'ring-emerald-600 border-emerald-400',
    countColor: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  {
    key: 'Lost',
    label: 'Lost',
    status: 'Lost',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    activeRing: 'ring-rose-600 border-rose-400',
    countColor: 'text-rose-700',
    dotColor: 'bg-rose-500',
  },
];

const StatCards = ({ stats, activeFilter, onSelectFilter, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-pulse"
          >
            <div className="h-4 w-20 bg-slate-200 rounded mb-3"></div>
            <div className="h-8 w-12 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cardConfigs.map((card) => {
        const isSelected = activeFilter === card.status;
        const count = stats?.[card.key] ?? 0;

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelectFilter(card.status)}
            className={`flex flex-col justify-between p-5 text-left rounded-xl border transition-all duration-150 bg-white hover:shadow-md cursor-pointer ${
              isSelected
                ? `ring-2 ${card.activeRing} shadow-sm`
                : 'border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <span className={`w-2 h-2 rounded-full ${card.dotColor}`} />
            </div>

            <div className="flex items-baseline justify-between w-full">
              <span className={`text-3xl font-bold tracking-tight ${card.countColor}`}>
                {count}
              </span>
              {isSelected && (
                <span className="text-[10px] font-semibold text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default StatCards;


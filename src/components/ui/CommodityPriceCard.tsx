import { type Commodity, formatRupiah, getPriceChange, CATEGORY_COLORS } from '@/lib/constants';

interface CommodityPriceCardProps {
  commodity: Commodity;
  variant?: 'card' | 'compact';
}

function CommodityIcon({ commodity, size = 'md' }: { commodity: Commodity; size?: 'sm' | 'md' }) {
  const categoryColor = CATEGORY_COLORS[commodity.category];
  const containerClass = size === 'md'
    ? `w-14 h-14 rounded-2xl`
    : `w-12 h-12 rounded-xl`;

  if (commodity.image) {
    return (
      <div className={`flex items-center justify-center ${containerClass} ${categoryColor.light} overflow-hidden`}>
        <img
          src={commodity.image}
          alt={commodity.name}
          className={size === 'md' ? 'w-10 h-10 object-contain' : 'w-8 h-8 object-contain'}
        />
      </div>
    );
  }

  // Fallback to Material icon
  return (
    <div className={`flex items-center justify-center ${containerClass} ${categoryColor.light}`}>
      <span
        className={`material-symbols-outlined ${categoryColor.text}`}
        style={{ fontSize: size === 'md' ? '32px' : '24px' }}
      >
        {commodity.icon}
      </span>
    </div>
  );
}

export default function CommodityPriceCard({ commodity, variant = 'card' }: CommodityPriceCardProps) {
  const { percentage, direction } = getPriceChange(commodity.currentPrice, commodity.previousPrice);
  const categoryColor = CATEGORY_COLORS[commodity.category];

  if (variant === 'compact') {
    return (
      <div className="group flex items-center gap-4 bg-white rounded-lg border border-[var(--border-light)] px-4 py-3 hover:shadow-md transition-all duration-200 hover:border-[var(--primary)] cursor-default">
        <CommodityIcon commodity={commodity} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{commodity.name}</p>
          <p className="text-xs text-[var(--text-tertiary)]">{commodity.quality}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-[var(--text-primary)]">{formatRupiah(commodity.currentPrice)}</p>
          <div className="flex items-center justify-end gap-1">
            {direction !== 'stable' && (
              <span className={`text-xs font-semibold ${direction === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                {direction === 'up' ? '↑' : '↓'} {percentage}%
              </span>
            )}
            {direction === 'stable' && (
              <span className="text-xs text-[var(--text-tertiary)]">— stabil</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-xl border border-[var(--border-light)] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default">
      {/* Top accent bar */}
      <div className={`h-1.5 ${categoryColor.bg} w-full`} />

      <div className="p-5">
        {/* Header — icon only, no badge */}
        <div className="mb-5">
          <div className="transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md inline-flex rounded-2xl">
            <CommodityIcon commodity={commodity} size="md" />
          </div>
        </div>

        {/* Name & Quality */}
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-0.5">{commodity.name}</h3>
        <p className="text-xs text-[var(--text-tertiary)] mb-4">{commodity.quality}</p>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {formatRupiah(commodity.currentPrice)}
              <span className="text-xs font-normal text-[var(--text-tertiary)] ml-1">/{commodity.unit}</span>
            </p>
          </div>

          {/* Change indicator */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
            direction === 'up'
              ? 'bg-emerald-50 text-emerald-600'
              : direction === 'down'
              ? 'bg-red-50 text-red-500'
              : 'bg-gray-50 text-gray-500'
          }`}>
            {direction !== 'stable' && (
              <>
                <span className="material-symbols-outlined text-sm">
                  {direction === 'up' ? 'arrow_upward' : 'arrow_downward'}
                </span>
                {percentage}%
              </>
            )}
            {direction === 'stable' && (
              <>
                <span className="material-symbols-outlined text-sm">remove</span>
                Stabil
              </>
            )}
          </div>
        </div>

        {/* Previous price */}
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Sebelumnya: <span className="line-through">{formatRupiah(commodity.previousPrice)}</span>
        </p>
      </div>
    </div>
  );
}

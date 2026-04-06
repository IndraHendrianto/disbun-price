interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: string;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'danger';
  iconSize?: 'md' | 'lg';
}

const COLOR_MAP = {
  primary: {
    iconBg: 'bg-gradient-to-br from-emerald-400 to-green-600',
    iconText: 'text-white',
    ring: 'ring-emerald-100',
  },
  success: {
    iconBg: 'bg-gradient-to-br from-green-400 to-emerald-600',
    iconText: 'text-white',
    ring: 'ring-green-100',
  },
  warning: {
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    iconText: 'text-white',
    ring: 'ring-amber-100',
  },
  info: {
    iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    iconText: 'text-white',
    ring: 'ring-blue-100',
  },
  danger: {
    iconBg: 'bg-gradient-to-br from-red-400 to-rose-600',
    iconText: 'text-white',
    ring: 'ring-red-100',
  },
};

export default function StatCard({ title, value, subtitle, change, icon, color = 'primary', iconSize = 'md' }: StatCardProps) {
  const colors = COLOR_MAP[color];
  const containerSize = iconSize === 'lg' ? 'w-16 h-16 rounded-2xl' : 'w-14 h-14 rounded-2xl';
  const iconFontSize = iconSize === 'lg' ? '36px' : '28px';

  return (
    <div className="group relative bg-white rounded-xl border border-[var(--border-light)] p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--primary-lightest)] opacity-0 group-hover:opacity-40 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--text-tertiary)] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] animate-count-up">{value}</p>
          {(subtitle || change !== undefined) && (
            <div className="flex items-center gap-1.5 mt-2">
              {change !== undefined && change !== 0 && (
                <span className={`inline-flex items-center text-xs font-semibold ${change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  <span className="material-symbols-outlined text-sm">
                    {change > 0 ? 'trending_up' : 'trending_down'}
                  </span>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-[var(--text-tertiary)]">{subtitle}</span>
              )}
            </div>
          )}
        </div>

        <div className={`flex items-center justify-center ${containerSize} ${colors.iconBg} ${colors.iconText} shadow-md ring-4 ${colors.ring} transition-transform duration-300 group-hover:scale-110`}>
          <span className="material-symbols-outlined" style={{ fontSize: iconFontSize }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

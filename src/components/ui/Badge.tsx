import { type CommodityCategory, type CommoditySubcategory, SUBCATEGORY_COLORS } from '@/lib/constants';

interface BadgeProps {
  label: string;
  variant?: 'category' | 'subcategory' | 'status';
  subcategory?: CommoditySubcategory;
  category?: CommodityCategory;
  color?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
}

const STATUS_COLORS = {
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-100 text-gray-600',
};

const CATEGORY_BADGE_COLORS: Record<CommodityCategory, string> = {
  'Hortikultura': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'Perkebunan': 'bg-amber-100 text-amber-700 border border-amber-200',
  'Bibit Tanaman': 'bg-sky-100 text-sky-700 border border-sky-200',
};

export default function Badge({ label, variant = 'status', subcategory, category, color = 'neutral' }: BadgeProps) {
  let classes = '';

  if (variant === 'subcategory' && subcategory) {
    const sc = SUBCATEGORY_COLORS[subcategory];
    classes = `${sc.bg} ${sc.text}`;
  } else if (variant === 'category' && category) {
    classes = CATEGORY_BADGE_COLORS[category];
  } else {
    classes = STATUS_COLORS[color];
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${classes} transition-all duration-200`}>
      {label}
    </span>
  );
}

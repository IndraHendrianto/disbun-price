// ============================================================
// DISBUNHORTI — Static Data Constants
// Commodity categories, prices, and mock data for the dashboard
// ============================================================

export type CommodityCategory = 'Hortikultura' | 'Perkebunan' | 'Bibit Tanaman';
export type CommoditySubcategory = 'Sayuran' | 'Buah' | 'Ekspor' | 'Lokal' | 'Bibit' | 'Biofarmaka';

export interface Commodity {
  id: string;
  name: string;
  category: CommodityCategory;
  subcategory: CommoditySubcategory;
  quality: string;
  unit: string;
  currentPrice: number;
  previousPrice: number;
  lastUpdated: string;
  icon: string;
  image?: string; // URL/path to commodity PNG image (updatable via admin)
}

export interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'info' | 'danger';
}

export interface DailyVisit {
  day: string;
  visits: number;
}

// Category color mappings
export const CATEGORY_COLORS: Record<CommodityCategory, { bg: string; text: string; border: string; light: string }> = {
  'Hortikultura': { bg: 'bg-emerald-600', text: 'text-emerald-700', border: 'border-emerald-200', light: 'bg-emerald-50' },
  'Perkebunan': { bg: 'bg-amber-600', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50' },
  'Bibit Tanaman': { bg: 'bg-sky-600', text: 'text-sky-700', border: 'border-sky-200', light: 'bg-sky-50' },
};

export const SUBCATEGORY_COLORS: Record<CommoditySubcategory, { bg: string; text: string }> = {
  'Sayuran': { bg: 'bg-green-100', text: 'text-green-700' },
  'Buah': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Ekspor': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Lokal': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'Bibit': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'Biofarmaka': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

// ============================================================
// Commodity Data
// ============================================================

export const COMMODITIES: Commodity[] = [
  // Hortikultura - Sayuran
  {
    id: 'cabai-rawit',
    name: 'Cabai Rawit Merah',
    category: 'Hortikultura',
    subcategory: 'Sayuran',
    quality: 'Lokal Sultra',
    unit: 'kg',
    currentPrice: 75000,
    previousPrice: 72500,
    lastUpdated: '2024-05-24',
    icon: 'local_fire_department',
  },
  {
    id: 'bawang-merah',
    name: 'Bawang Merah',
    category: 'Hortikultura',
    subcategory: 'Sayuran',
    quality: 'Brebes Super',
    unit: 'kg',
    currentPrice: 35000,
    previousPrice: 38000,
    lastUpdated: '2024-05-24',
    icon: 'nutrition',
  },
  {
    id: 'tomat-medan',
    name: 'Tomat Medan',
    category: 'Hortikultura',
    subcategory: 'Sayuran',
    quality: 'Grade A',
    unit: 'kg',
    currentPrice: 12000,
    previousPrice: 11500,
    lastUpdated: '2024-05-24',
    icon: 'grocery',
  },
  {
    id: 'kentang',
    name: 'Kentang',
    category: 'Hortikultura',
    subcategory: 'Sayuran',
    quality: 'Granola',
    unit: 'kg',
    currentPrice: 14000,
    previousPrice: 13500,
    lastUpdated: '2024-05-24',
    icon: 'eco',
  },
  // Perkebunan - Ekspor
  {
    id: 'cengkeh-kering',
    name: 'Cengkeh Kering',
    category: 'Perkebunan',
    subcategory: 'Ekspor',
    quality: 'Kualitas Super',
    unit: 'kg',
    currentPrice: 125000,
    previousPrice: 120000,
    lastUpdated: '2024-05-24',
    icon: 'spa',
  },
  {
    id: 'kakao',
    name: 'Biji Kakao',
    category: 'Perkebunan',
    subcategory: 'Ekspor',
    quality: 'Biji Kering Fermentasi',
    unit: 'kg',
    currentPrice: 48500,
    previousPrice: 50000,
    lastUpdated: '2024-05-24',
    icon: 'coffee',
  },
  {
    id: 'kelapa-butiran',
    name: 'Kelapa Butiran',
    category: 'Perkebunan',
    subcategory: 'Lokal',
    quality: 'Lokal',
    unit: 'butir',
    currentPrice: 8500,
    previousPrice: 8000,
    lastUpdated: '2024-05-24',
    icon: 'park',
  },
  {
    id: 'lada-putih',
    name: 'Lada Putih',
    category: 'Perkebunan',
    subcategory: 'Ekspor',
    quality: 'Biji Kering',
    unit: 'kg',
    currentPrice: 92000,
    previousPrice: 92000,
    lastUpdated: '2024-05-24',
    icon: 'grain',
  },
  {
    id: 'lada-hitam',
    name: 'Lada Hitam',
    category: 'Perkebunan',
    subcategory: 'Ekspor',
    quality: 'Grade A',
    unit: 'kg',
    currentPrice: 85000,
    previousPrice: 82000,
    lastUpdated: '2024-05-24',
    icon: 'grain',
  },
  {
    id: 'pala',
    name: 'Pala',
    category: 'Perkebunan',
    subcategory: 'Ekspor',
    quality: 'Biji Kupas',
    unit: 'kg',
    currentPrice: 110000,
    previousPrice: 108000,
    lastUpdated: '2024-05-24',
    icon: 'forest',
  },
  // Bibit Tanaman
  {
    id: 'bibit-kopi',
    name: 'Bibit Kopi',
    category: 'Bibit Tanaman',
    subcategory: 'Bibit',
    quality: 'Arabika',
    unit: 'batang',
    currentPrice: 15000,
    previousPrice: 14000,
    lastUpdated: '2024-05-24',
    icon: 'potted_plant',
  },
  {
    id: 'bibit-durian',
    name: 'Bibit Durian',
    category: 'Bibit Tanaman',
    subcategory: 'Bibit',
    quality: 'Musang King',
    unit: 'batang',
    currentPrice: 85000,
    previousPrice: 80000,
    lastUpdated: '2024-05-24',
    icon: 'potted_plant',
  },
  {
    id: 'bibit-sawit',
    name: 'Bibit Sawit',
    category: 'Bibit Tanaman',
    subcategory: 'Bibit',
    quality: 'Unggul',
    unit: 'batang',
    currentPrice: 35000,
    previousPrice: 35000,
    lastUpdated: '2024-05-24',
    icon: 'potted_plant',
  },
  {
    id: 'bibit-lada',
    name: 'Bibit Lada',
    category: 'Bibit Tanaman',
    subcategory: 'Bibit',
    quality: 'Stek',
    unit: 'batang',
    currentPrice: 12000,
    previousPrice: 11000,
    lastUpdated: '2024-05-24',
    icon: 'potted_plant',
  },
];

// Group commodities by category
export const COMMODITIES_BY_CATEGORY = COMMODITIES.reduce((acc, c) => {
  if (!acc[c.category]) acc[c.category] = [];
  acc[c.category].push(c);
  return acc;
}, {} as Record<CommodityCategory, Commodity[]>);

// ============================================================
// Dashboard Stats
// ============================================================

export const PUBLIC_STATS: StatCard[] = [
  { title: 'Total Komoditas', value: 48, icon: 'inventory_2', color: 'primary' },
  { title: 'Rata-rata Harga', value: 'Rp 42.500', subtitle: '+12.4%', change: 12.4, icon: 'trending_up', color: 'success' },
  { title: 'Puncak Tertinggi', value: 'Rp 48.200', icon: 'arrow_upward', color: 'warning' },
];

export const ADMIN_PRICE_STATS: StatCard[] = [
  { title: 'Total Komoditas', value: 24, icon: 'inventory_2', color: 'primary' },
  { title: 'Terakhir Diperbarui', value: 'Hari Ini', icon: 'schedule', color: 'info' },
  { title: 'Kenaikan Tertinggi', value: 'Cengkeh', subtitle: '+4.2%', change: 4.2, icon: 'trending_up', color: 'success' },
];

export const ADMIN_COMMODITY_STATS: StatCard[] = [
  { title: 'Total Jenis', value: 48, icon: 'category', color: 'primary' },
  { title: 'Hortikultura', value: 12, icon: 'eco', color: 'success' },
  { title: 'Perkebunan', value: 36, icon: 'forest', color: 'warning' },
];

export const VISITOR_STATS: StatCard[] = [
  { title: 'Total Kunjungan', value: '12,842', subtitle: 'Dibandingkan hari sebelumnya', change: 18.5, icon: 'visibility', color: 'primary' },
  { title: 'Pengunjung Unik', value: '8,291', subtitle: '+12.3% dari hari sebelumnya', change: 12.3, icon: 'person', color: 'info' },
  { title: 'Halaman/Sesi', value: '3.42', subtitle: '+5.1%', change: 5.1, icon: 'description', color: 'success' },
  { title: 'Waktu Rata-rata', value: '2m 34s', subtitle: '+8.7%', change: 8.7, icon: 'timer', color: 'warning' },
];

export const DAILY_VISITS: DailyVisit[] = [
  { day: 'Senin', visits: 0 },
  { day: 'Selasa', visits: 0 },
  { day: 'Rabu', visits: 0 },
  { day: 'Kamis', visits: 0 },
  { day: 'Jumat', visits: 0 },
  { day: 'Sabtu', visits: 0 },
  { day: 'Minggu', visits: 0 },
];

// ============================================================
// Helpers
// ============================================================

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getPriceChange(current: number, previous: number): { percentage: number; direction: 'up' | 'down' | 'stable' } {
  if (current === previous) return { percentage: 0, direction: 'stable' };
  const percentage = ((current - previous) / previous) * 100;
  return {
    percentage: Math.abs(parseFloat(percentage.toFixed(1))),
    direction: current > previous ? 'up' : 'down',
  };
}

export const LAST_UPDATE = '24 Mei 2024, 08:30 WITA';
export const APP_NAME = 'DISBUNHORTI';
export const APP_FULL_NAME = 'Dinas Perkebunan dan Hortikultura Sulawesi Tenggara';

'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import CommodityPriceCard from '@/components/ui/CommodityPriceCard';
import StatCard from '@/components/ui/StatCard';
import {
  CATEGORY_COLORS,
  LAST_UPDATE,
  type CommodityCategory,
  type Commodity,
} from '@/lib/constants';

const CATEGORY_ICONS: Record<CommodityCategory, string> = {
  'Hortikultura': 'eco',
  'Perkebunan': 'forest',
  'Bibit Tanaman': 'potted_plant',
};

const CATEGORY_DESCRIPTIONS: Record<CommodityCategory, string> = {
  'Hortikultura': 'Sayuran',
  'Perkebunan': 'Ekspor',
  'Bibit Tanaman': 'Bibit unggulan daerah',
};

export default function DashboardHome() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);

  const fetchCommodities = async () => {
    const { data: items } = await supabase.from('commodities').select('*');
    if (items) {
      const formatted = items.map((d: any) => ({
        ...d,
        currentPrice: d.currentprice,
        previousPrice: d.previousprice,
        lastUpdated: d.lastupdated,
      })) as Commodity[];
      setCommodities(formatted);
    }
  };

  useEffect(() => {
    fetchCommodities();

    // Increment page view count silently
    const incrementView = async () => {
      try {
        await supabase.rpc('increment_page_view');
      } catch (err) {
        // Silently fail if table/rpc is not set up
      }
    };
    incrementView();

    const channel = supabase.channel('realtime:public_home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commodities' }, () => {
        fetchCommodities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalKomoditas = commodities.length;
  const averagePrice = totalKomoditas > 0 ? commodities.reduce((acc, c) => acc + c.currentPrice, 0) / totalKomoditas : 0;
  const highestPrice = totalKomoditas > 0 ? Math.max(...commodities.map(c => c.currentPrice)) : 0;

  const commoditiesByCategory = useMemo(() => {
    return commodities.reduce((acc, c) => {
      if (!acc[c.category]) acc[c.category] = [];
      acc[c.category].push(c);
      return acc;
    }, {} as Record<CommodityCategory, Commodity[]>);
  }, [commodities]);

  const formattedAverage = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(averagePrice);
  const formattedHighest = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(highestPrice);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[var(--primary)]/30 blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0zNiAxNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight">
              Dashboard Harga Komoditas
            </h1>
            <p className="text-base lg:text-lg text-white/80 leading-relaxed max-w-2xl">
              Pantauan real-time harga pasar unggulan sektor Hortikultura, Perkebunan, dan Bibit Tanaman
              di wilayah Sulawesi Tenggara. Data diperbarui secara berkala oleh Dinas Perkebunan dan Hortikultura.
            </p>
          </div>
        </div>
      </section>

      {/* Commodity Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {(Object.keys(commoditiesByCategory) as CommodityCategory[]).map((category) => {
          const categoryCommodities = commoditiesByCategory[category] || [];
          if (categoryCommodities.length === 0) return null;
          
          const colors = CATEGORY_COLORS[category];
          const icon = CATEGORY_ICONS[category];
          const desc = CATEGORY_DESCRIPTIONS[category];

          return (
            <div key={category} className="mb-12 last:mb-0">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${colors.light}`}>
                  <span className={`material-symbols-outlined text-xl ${colors.text}`}>{icon}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">{category}</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">{desc}</p>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-[var(--border)] to-transparent ml-4" />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
                {categoryCommodities.map((commodity) => (
                  <CommodityPriceCard key={commodity.id} commodity={commodity} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

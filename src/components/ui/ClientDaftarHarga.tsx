'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import SearchFilter from '@/components/ui/SearchFilter';
import { formatRupiah, getPriceChange, type Commodity } from '@/lib/constants';

const columns: Column<Commodity>[] = [
  {
    key: 'name',
    header: 'Komoditas',
    render: (item) => (
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-50">
          <span className="material-symbols-outlined text-emerald-600 text-2xl">{item.icon}</span>
        </div>
        <div>
          <p className="font-semibold text-[var(--text-primary)]">{item.name}</p>
          <p className="text-xs text-[var(--text-tertiary)]">{item.quality}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'category',
    header: 'Kategori',
    render: (item) => <Badge label={item.category} variant="category" category={item.category} />,
  },
  {
    key: 'subcategory',
    header: 'Jenis',
    render: (item) => <Badge label={item.subcategory} variant="subcategory" subcategory={item.subcategory} />,
  },
  {
    key: 'currentPrice',
    header: 'Harga Saat Ini',
    render: (item) => (
      <span className="font-bold text-[var(--text-primary)]">
        {formatRupiah(item.currentPrice)}
        <span className="text-xs font-normal text-[var(--text-tertiary)]"> /{item.unit}</span>
      </span>
    ),
    headerClassName: 'text-right',
    className: 'text-right',
  },
  {
    key: 'previousPrice',
    header: 'Harga Sebelumnya',
    render: (item) => (
      <span className="text-[var(--text-tertiary)] line-through">{formatRupiah(item.previousPrice)}</span>
    ),
    headerClassName: 'text-right',
    className: 'text-right',
  },
  {
    key: 'change',
    header: 'Perubahan',
    render: (item) => {
      const { percentage, direction } = getPriceChange(item.currentPrice, item.previousPrice);
      return (
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
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
          {direction === 'stable' && 'Stabil'}
        </div>
      );
    },
    headerClassName: 'text-center',
    className: 'text-center',
  },
];

export default function ClientDaftarHarga() {
  const [data, setData] = useState<Commodity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');

  const fetchCommodities = async () => {
    const { data: items } = await supabase.from('commodities').select('*');
    if (items) {
      const formatted = items.map(d => ({
        ...d,
        currentPrice: d.currentprice,
        previousPrice: d.previousprice,
        lastUpdated: d.lastupdated,
      })) as Commodity[];
      setData(formatted);
    }
  };

  useEffect(() => {
    fetchCommodities();

    const channel = supabase.channel('realtime:public_commodities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commodities' }, () => {
        fetchCommodities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = filterCategory === 'Semua' || c.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [data, searchQuery, filterCategory]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="bg-gradient-to-r from-[var(--surface)] to-[var(--surface-alt)] border-b border-[var(--border-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">
            Daftar Harga Komoditas Lengkap
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl mb-6">
            Akses transparan ke data pasar hortikultura dan perkebunan terbaru di Sulawesi Tenggara.
            Kami menyajikan kurasi harga rata-rata dari pasar tradisional kota Kendari untuk mendukung stabilitas ekonomi daerah.
          </p>

          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <span className="material-symbols-outlined text-sm text-[var(--primary)]">schedule</span>
            Data live dari database
          </div>
        </div>
      </section>

      {/* Price Index Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Indeks Harga Pasar</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          {filteredData.slice(0, 5).map((c) => {
            const { percentage, direction } = getPriceChange(c.currentPrice, c.previousPrice);
            return (
              <div key={c.id} className="bg-white rounded-xl border border-[var(--border-light)] p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-[var(--text-primary)]">{c.name}</p>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mb-2">{c.quality}</p>
                <p className="text-lg font-extrabold text-[var(--text-primary)]">
                  {formatRupiah(c.currentPrice)} <span className="text-xs font-normal text-[var(--text-tertiary)]">/{c.unit}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[var(--text-tertiary)] line-through">{formatRupiah(c.previousPrice)}</span>
                  {direction !== 'stable' && (
                    <span className={`text-xs font-semibold ${direction === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {direction === 'up' ? '↑' : '↓'}{percentage}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Search & Filter */}
        <div className="mb-6">
          <SearchFilter
            searchPlaceholder="Cari komoditas..."
            categories={['Hortikultura', 'Perkebunan', 'Bibit Tanaman']}
            onSearch={setSearchQuery}
            onFilter={setFilterCategory}
          />
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredData}
          totalItems={filteredData.length}
          itemsPerPage={10}
          currentPage={1}
          caption="Daftar harga komoditas unggulan Sulawesi Tenggara"
        />
      </section>
    </div>
  );
}

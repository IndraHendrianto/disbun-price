'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import SearchFilter from '@/components/ui/SearchFilter';
import { COMMODITIES, formatRupiah, getPriceChange, type Commodity } from '@/lib/constants';

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
    key: 'currentPrice',
    header: 'Harga Saat Ini',
    render: (item) => (
      <span className="font-bold text-[var(--text-primary)]">{formatRupiah(item.currentPrice)}</span>
    ),
    headerClassName: 'text-right',
    className: 'text-right',
  },
  {
    key: 'previousPrice',
    header: 'Harga Sebelumnya',
    render: (item) => (
      <span className="text-[var(--text-tertiary)]">{formatRupiah(item.previousPrice)}</span>
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
          direction === 'up' ? 'bg-emerald-50 text-emerald-600' : direction === 'down' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'
        }`}>
          {direction !== 'stable' ? (
            <>
              <span className="material-symbols-outlined text-sm">{direction === 'up' ? 'arrow_upward' : 'arrow_downward'}</span>
              {percentage}%
            </>
          ) : 'Stabil'}
        </div>
      );
    },
    headerClassName: 'text-center',
    className: 'text-center',
  },
  {
    key: 'actions',
    header: 'Aksi',
    render: (item) => (
      <div className="flex items-center gap-2 justify-end">
        <Link
          href={`/admin/kelola-harga/${item.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          Update
        </Link>
      </div>
    ),
    headerClassName: 'text-right',
    className: 'text-right',
  },
];

export default function KelolaHargaPage() {
  const [data, setData] = useState<Commodity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');

  const fetchCommodities = async () => {
    const { data: items } = await supabase.from('commodities').select('*');
    if (items) {
      const formatted = items.map((d: any) => ({
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

    const channel = supabase.channel('realtime:admin_harga')
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
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Kelola Harga Komoditas</h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
          Pantau dan perbarui harga harian komoditas unggulan Sulawesi Tenggara. Data yang Anda masukkan akan
          menjadi referensi utama bagi petani dan pelaku usaha.
        </p>
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
        caption="Kelola harga komoditas"
      />

      {/* Admin Footer */}
      <div className="mt-8 pt-6 border-t border-[var(--border-light)] text-center">
        <p className="text-xs text-[var(--text-tertiary)]">
          <span className="font-semibold">DISBUNHORTI ADMIN</span> — Dinas Perkebunan dan Hortikultura Sulawesi Tenggara
        </p>
      </div>
    </div>
  );
}

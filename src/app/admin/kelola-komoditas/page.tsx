'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import StatCard from '@/components/ui/StatCard';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import SearchFilter from '@/components/ui/SearchFilter';
import { COMMODITIES, type Commodity } from '@/lib/constants';

export default function KelolaKomoditasPage() {
  const [data, setData] = useState<Commodity[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Commodity | null>(null);

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

    const channel = supabase.channel('realtime:admin_komoditas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commodities' }, () => {
        fetchCommodities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMigrasi = async () => {
    try {
      for (const c of COMMODITIES) {
        const newC = {
          id: c.id,
          name: c.name,
          category: c.category,
          subcategory: c.subcategory,
          quality: c.quality,
          unit: c.unit,
          currentprice: c.currentPrice,
          previousprice: c.previousPrice,
          icon: c.icon,
          lastupdated: c.lastUpdated,
        };
        await supabase.from('commodities').upsert(newC);
      }
      alert('Migrasi Selesai!');
    } catch (err) {
      console.error(err);
      alert('Gagal migrasi data');
    }
  };

  const handleDelete = async (commodity: Commodity) => {
    try {
      const { error } = await supabase.from('commodities').delete().eq('id', commodity.id);
      if (error) throw error;
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus komoditas');
    }
  };

  const columns: Column<Commodity>[] = [
    {
      key: 'name',
      header: 'Nama Komoditas',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-50">
            <span className="material-symbols-outlined text-emerald-600 text-2xl">{item.icon}</span>
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)]">{item.name}</p>
            <p className="text-xs text-[var(--text-tertiary)]">ID: {item.id}</p>
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
      header: 'Subkategori',
      render: (item) => <Badge label={item.subcategory} variant="subcategory" subcategory={item.subcategory} />,
    },
    {
      key: 'quality',
      header: 'Kualitas',
      render: (item) => <span className="text-[var(--text-secondary)] text-sm">{item.quality}</span>,
    },
    {
      key: 'unit',
      header: 'Satuan',
      render: (item) => <span className="text-sm text-[var(--text-secondary)] capitalize">{item.unit}</span>,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item) => (
        <div className="flex items-center gap-2 justify-end">
          <Link
            href={`/admin/kelola-komoditas/${item.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--primary-darker)] bg-[var(--primary-lightest)] hover:bg-[var(--primary)] hover:text-white transition-all duration-200"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit
          </Link>
          <button
            onClick={() => setDeleteTarget(item)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Hapus
          </button>
        </div>
      ),
      headerClassName: 'text-right',
      className: 'text-right',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Kelola Jenis Komoditas</h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
            Manajemen basis data komoditas unggulan daerah. Tambahkan kategori baru atau perbarui informasi komoditas yang tersedia.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data.length === 0 && (
            <button
              onClick={handleMigrasi}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-lg">database</span>
              Migrasi Data Awal
            </button>
          )}
          <Link
            href="/admin/kelola-komoditas/tambah"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow-md hover:shadow-lg transition-all duration-200"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Tambah Komoditas
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 stagger-children">
        <StatCard title="Total Jenis" value={data.length} icon="category" color="primary" />
        <StatCard title="Hortikultura" value={data.filter(c => c.category === 'Hortikultura').length} icon="eco" color="success" />
        <StatCard title="Perkebunan" value={data.filter(c => c.category === 'Perkebunan').length} icon="forest" color="warning" />
      </div>

      {/* Search & Filter */}
      <div className="mb-6">
        <SearchFilter
          searchPlaceholder="Cari komoditas..."
          categories={['Hortikultura', 'Perkebunan', 'Bibit Tanaman']}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data}
        totalItems={data.length}
        itemsPerPage={10}
        currentPage={1}
        caption="Kelola jenis komoditas"
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-red-500" style={{ fontSize: '32px' }}>warning</span>
              </div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Hapus Komoditas?</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Anda akan menghapus komoditas:
              </p>
              <p className="font-bold text-[var(--text-primary)] mb-4">
                {deleteTarget.name} — {deleteTarget.quality}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mb-6">
                Tindakan ini tidak dapat dibatalkan. Semua data harga terkait juga akan terhapus.
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteTarget)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 shadow-md transition-all"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

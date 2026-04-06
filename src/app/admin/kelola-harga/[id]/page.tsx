'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatRupiah, type Commodity } from '@/lib/constants';

export default function UpdateHargaPage() {
  const params = useParams();
  const router = useRouter();
  const commodityId = params.id as string;

  const [commodity, setCommodity] = useState<Commodity | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPrice, setNewPrice] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchCommodity() {
      try {
        const { data } = await supabase.from('commodities').select('*').eq('id', commodityId).single();
        if (data) {
          const parsedData = { 
            ...data,
            currentPrice: data.currentprice,
            previousPrice: data.previousprice,
            lastUpdated: data.lastupdated,
          } as Commodity;
          setCommodity(parsedData);
          setNewPrice(parsedData.currentPrice?.toString() || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCommodity();
  }, [commodityId]);

  if (loading) {
    return <div className="text-center py-20 text-[var(--text-tertiary)]">Memuat data harga...</div>;
  }

  if (!commodity) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <span className="material-symbols-outlined text-6xl text-[var(--text-tertiary)] mb-4">error</span>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Komoditas Tidak Ditemukan</h1>
        <p className="text-sm text-[var(--text-tertiary)] mb-6">ID komoditas &quot;{commodityId}&quot; tidak ditemukan.</p>
        <Link href="/admin/kelola-harga" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-all">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Kembali
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const priceNum = parseInt(newPrice, 10);
      const now = new Date();
      const formattedDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(now);

      await supabase.from('commodities').update({
        currentprice: priceNum,
        previousprice: commodity.currentPrice,
        lastupdated: formattedDate,
      }).eq('id', commodityId);

      // Log to price history
      await supabase.from('price_history').insert([{
        commodity_id: commodityId,
        price: priceNum
      }]);

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Gagal mengupdate harga.');
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: '40px' }}>check_circle</span>
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Harga Berhasil Diperbarui!</h1>
        <p className="text-sm text-[var(--text-tertiary)] mb-1">
          <span className="font-semibold text-[var(--text-primary)]">{commodity.name}</span> — {commodity.quality}
        </p>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">
          Harga baru: <span className="font-bold text-emerald-600">{formatRupiah(parseInt(newPrice))}</span>
        </p>
        <Link href="/admin/kelola-harga" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow-md transition-all">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] mb-6">
        <Link href="/admin/kelola-harga" className="hover:text-[var(--primary)] transition-colors">Kelola Harga</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-[var(--text-primary)] font-medium">Update Harga</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Update Harga Komoditas</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Perbarui harga terbaru untuk komoditas ini. Harga sebelumnya akan tersimpan otomatis.
        </p>
      </div>

      {/* Commodity Info Card */}
      <div className="bg-white rounded-xl border border-[var(--border-light)] p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50">
            <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: '32px' }}>{commodity.icon}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{commodity.name}</h2>
            <p className="text-sm text-[var(--text-tertiary)]">{commodity.quality} • {commodity.category}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text-tertiary)]">Harga Saat Ini</p>
            <p className="text-xl font-extrabold text-[var(--text-primary)]">{formatRupiah(commodity.currentPrice)}</p>
            <p className="text-xs text-[var(--text-tertiary)]">per {commodity.unit}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[var(--border-light)] p-6 space-y-6">
        <div>
          <label htmlFor="newPrice" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            Harga Baru (Rp) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--text-tertiary)]">Rp</span>
            <input
              id="newPrice"
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              required
              min="0"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-tertiary)]">per {commodity.unit}</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Harga sebelumnya: <span className="line-through">{formatRupiah(commodity.previousPrice)}</span>
          </p>
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            Catatan (opsional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all resize-none"
            placeholder="Contoh: Harga naik karena musim kemarau..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-lg ${saving ? 'animate-spin' : ''}`}>{saving ? 'autorenew' : 'save'}</span>
            {saving ? 'Menyimpan...' : 'Simpan Harga Baru'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/kelola-harga')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all duration-200"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

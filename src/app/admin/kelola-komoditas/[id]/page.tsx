'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { type Commodity } from '@/lib/constants';
import CommodityForm from '@/components/ui/CommodityForm';

export default function EditKomoditasPage() {
  const params = useParams();
  const commodityId = params.id as string;
  const [commodity, setCommodity] = useState<Commodity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommodity() {
      try {
        const { data } = await supabase.from('commodities').select('*').eq('id', commodityId).single();
        if (data) {
          setCommodity({
            ...data,
            currentPrice: data.currentprice,
            previousPrice: data.previousprice,
            lastUpdated: data.lastupdated,
          } as Commodity);
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
    return <div className="text-center py-20 text-[var(--text-tertiary)]">Memuat data komoditas...</div>;
  }

  if (!commodity) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <span className="material-symbols-outlined text-6xl text-[var(--text-tertiary)] mb-4">error</span>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Komoditas Tidak Ditemukan</h1>
        <p className="text-sm text-[var(--text-tertiary)] mb-6">ID komoditas &quot;{commodityId}&quot; tidak ditemukan.</p>
        <Link href="/admin/kelola-komoditas" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-all">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Kembali
        </Link>
      </div>
    );
  }

  return <CommodityForm mode="edit" commodity={commodity} />;
}

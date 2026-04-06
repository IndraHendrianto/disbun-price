'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { type Commodity, type CommodityCategory, type CommoditySubcategory } from '@/lib/constants';

const CATEGORIES: CommodityCategory[] = ['Hortikultura', 'Perkebunan', 'Bibit Tanaman'];
const SUBCATEGORIES: Record<CommodityCategory, CommoditySubcategory[]> = {
  'Hortikultura': ['Sayuran', 'Buah', 'Biofarmaka'],
  'Perkebunan': ['Ekspor', 'Lokal'],
  'Bibit Tanaman': ['Bibit'],
};

interface CommodityFormProps {
  mode: 'tambah' | 'edit';
  commodity?: Commodity;
}

export default function CommodityForm({ mode, commodity }: CommodityFormProps) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState(commodity?.name || '');
  const [category, setCategory] = useState<CommodityCategory>(commodity?.category || 'Hortikultura');
  const [subcategory, setSubcategory] = useState<CommoditySubcategory>(commodity?.subcategory || 'Sayuran');
  const [quality, setQuality] = useState(commodity?.quality || '');
  const [unit, setUnit] = useState(commodity?.unit || 'kg');
  const [currentPrice, setCurrentPrice] = useState(commodity?.currentPrice?.toString() || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(commodity?.image || null);
  const [imageError, setImageError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(commodity?.image || null);
      return;
    }

    if (file.type !== 'image/png') {
      setImageError('Format gambar harus PNG.');
      return;
    }

    if (file.size > 200 * 1024) {
      setImageError('Ukuran gambar maksimal 200 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== img.height) {
          setImageError('Dimensi gambar harus berskala 1:1 (persegi).');
          setImageFile(null);
          setImagePreview(null);
        } else {
          setImageFile(file);
          setImagePreview(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageError) return;
    setLoading(true);

    const priceNum = parseInt(currentPrice, 10);
    
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(now);

    try {
      let imageUrl = commodity?.image || '';

      // Upload image to Supabase Storage
      if (imageFile) {
        const filePath = `${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('commodities').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage.from('commodities').getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      }

      if (mode === 'tambah') {
        const newCommodity = {
          id: crypto.randomUUID(),
          name,
          category,
          subcategory,
          quality,
          unit,
          currentprice: priceNum,
          previousprice: priceNum,
          icon: 'eco', // Default fallback
          ...(imageUrl && { image: imageUrl }),
          lastupdated: formattedDate,
        };
        const { data: insertedData, error } = await supabase.from('commodities').insert([newCommodity]).select();
        if (error) throw error;
        if (insertedData) {
          await supabase.from('price_history').insert([{ commodity_id: newCommodity.id, price: priceNum }]);
        }
      } else if (commodity) {
        const updatedCommodity = {
          name,
          category,
          subcategory,
          quality,
          unit,
          ...(imageUrl && { image: imageUrl }),
          lastupdated: formattedDate,
          ...(priceNum !== commodity.currentPrice && {
             currentprice: priceNum,
             previousprice: commodity.currentPrice,
          })
        };
        const { error } = await supabase.from('commodities').update(updatedCommodity).eq('id', commodity.id);
        if (error) throw error;
        if (priceNum !== commodity.currentPrice) {
          await supabase.from('price_history').insert([{ commodity_id: commodity.id, price: priceNum }]);
        }
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Error saving document: ', err);
      alert('Gagal menyimpan data komoditas.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: '40px' }}>check_circle</span>
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          {mode === 'tambah' ? 'Komoditas Berhasil Ditambahkan!' : 'Komoditas Berhasil Diperbarui!'}
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">
          <span className="font-semibold text-[var(--text-primary)]">{name}</span> — {quality} ({category})
        </p>
        <Link href="/admin/kelola-komoditas" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow-md transition-all">
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
        <Link href="/admin/kelola-komoditas" className="hover:text-[var(--primary)] transition-colors">Kelola Komoditas</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-[var(--text-primary)] font-medium">{mode === 'tambah' ? 'Tambah Komoditas' : 'Edit Komoditas'}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">
          {mode === 'tambah' ? 'Tambah Komoditas Baru' : `Edit ${commodity?.name || 'Komoditas'}`}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {mode === 'tambah'
            ? 'Tambahkan komoditas baru ke dalam basis data. Isi seluruh informasi dengan lengkap.'
            : 'Perbarui informasi komoditas yang telah terdaftar.'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[var(--border-light)] p-6 space-y-6">
        {/* Nama Komoditas */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            Nama Komoditas <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            placeholder="Contoh: Cabai Rawit Merah"
          />
        </div>

        {/* Kategori & Subkategori */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => {
                const newCat = e.target.value as CommodityCategory;
                setCategory(newCat);
                setSubcategory(SUBCATEGORIES[newCat][0]);
              }}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="subcategory" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
              Subkategori <span className="text-red-500">*</span>
            </label>
            <select
              id="subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value as CommoditySubcategory)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            >
              {(SUBCATEGORIES[category] || []).map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Kualitas & Satuan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quality" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
              Kualitas / Varian <span className="text-red-500">*</span>
            </label>
            <input
              id="quality"
              type="text"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="Contoh: Lokal Sultra"
            />
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
              Satuan <span className="text-red-500">*</span>
            </label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            >
              <option value="kg">Kilogram (kg)</option>
              <option value="butir">Butir</option>
              <option value="batang">Batang</option>
              <option value="ikat">Ikat</option>
              <option value="liter">Liter</option>
            </select>
          </div>
        </div>

        {/* Harga */}
        <div>
          <label htmlFor="currentPrice" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            Harga Saat Ini (Rp) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--text-tertiary)]">Rp</span>
            <input
              id="currentPrice"
              type="number"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              required
              min="0"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
        </div>

        {/* Gambar (Upload placeholder) */}
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            Gambar Komoditas (Wajib PNG, Max 200KB, Rasio 1:1)
          </label>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {imagePreview ? (
              <div className="w-24 h-24 rounded-xl border border-[var(--border-light)] overflow-hidden shrink-0 bg-white">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-gray-400">image</span>
              </div>
            )}
            <div className="flex-1 w-full">
              <input
                type="file"
                accept="image/png"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-lightest)] file:text-[var(--primary-darker)] hover:file:bg-[var(--primary)] hover:file:text-white transition-all cursor-pointer"
              />
              <p className="text-xs text-[var(--text-tertiary)] mt-2">Pastikan dimensi panjang x lebar sama (contoh: 500x500px).</p>
              {imageError && (
                <p className="text-sm text-red-500 font-medium mt-1 animate-fade-in">{imageError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>{loading ? 'autorenew' : (mode === 'tambah' ? 'add' : 'save')}</span>
            {loading ? 'Menyimpan...' : (mode === 'tambah' ? 'Tambah Komoditas' : 'Simpan Perubahan')}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/kelola-komoditas')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all duration-200"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

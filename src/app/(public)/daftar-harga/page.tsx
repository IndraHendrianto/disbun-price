import type { Metadata } from 'next';
import ClientDaftarHarga from '@/components/ui/ClientDaftarHarga';

export const metadata: Metadata = {
  title: 'Daftar Harga Komoditas Lengkap',
  description: 'Akses transparan ke data pasar hortikultura dan perkebunan terbaru di Sulawesi Tenggara.',
};

export default function DaftarHargaPage() {
  return <ClientDaftarHarga />;
}


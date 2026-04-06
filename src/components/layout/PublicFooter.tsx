import { APP_FULL_NAME } from '@/lib/constants';

export default function PublicFooter() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <img src="/logo-sultra.png" alt="Logo Pemprov Sulawesi Tenggara" className="w-10 h-10 object-contain" />
            <div>
              <p className="text-white font-bold text-sm">{APP_FULL_NAME}</p>
              <p className="text-gray-500 text-xs">Transparansi Data Harga Komoditas</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs">
            <a href="/admin/kelola-harga" className="hover:text-white transition-colors duration-200">Admin</a>
          </div>
        </div>

        <div className="border-t border-gray-700/50 mt-8 pt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2024 DISBUNHORTI. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

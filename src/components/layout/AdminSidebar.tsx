'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Cookies from 'js-cookie';
import { useState } from 'react';

const ADMIN_NAV = [
  { href: '/admin/kelola-harga', label: 'Kelola Harga', icon: 'payments' },
  { href: '/admin/kelola-komoditas', label: 'Kelola Komoditas', icon: 'potted_plant' },
  { href: '/admin/statistik', label: 'Statistik Kunjungan', icon: 'leaderboard' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      Cookies.remove('auth-token');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/logo-sultra.png" alt="Logo Pemprov Sulawesi Tenggara" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-sm font-bold tracking-tight">Admin DISBUN</p>
            <p className="text-[10px] text-gray-400 font-medium">Sulawesi Tenggara</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {ADMIN_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-[var(--primary)]/20 text-[var(--primary-light)] shadow-lg shadow-[var(--primary)]/10'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined text-xl transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-[var(--primary)]' : ''}`}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse-glow" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        <Link 
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200 w-full group"
        >
          <span className="material-symbols-outlined text-xl transition-transform duration-200 group-hover:scale-110">
            public
          </span>
          Kembali ke Website
        </Link>
        <button 
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={`material-symbols-outlined text-xl transition-transform duration-200 ${loggingOut ? 'animate-spin' : 'group-hover:scale-110'}`}>
            {loggingOut ? 'pending' : 'logout'}
          </span>
          {loggingOut ? 'Keluar...' : 'Logout'}
        </button>
      </div>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME } from '@/lib/constants';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/daftar-harga', label: 'Daftar Harga', icon: 'payments' },
  { href: '/tren-harga', label: 'Tren Harga', icon: 'trending_up' },
];

export default function PublicNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[var(--border-light)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo-sultra.png" alt="Logo Pemprov Sulawesi Tenggara" className="w-9 h-9 object-contain" />
            <div>
              <span className="text-base font-bold text-[var(--text-primary)] tracking-tight">{APP_NAME}</span>
              <span className="hidden sm:block text-[10px] text-[var(--text-tertiary)] -mt-0.5 font-medium">Sulawesi Tenggara</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--primary-lightest)] text-[var(--primary-darker)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}

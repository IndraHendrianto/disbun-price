'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.session) {
        Cookies.set('auth-token', data.session.access_token, { expires: 1 });
      }
      
      router.push('/admin/kelola-harga');
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-[var(--primary)] to-green-600 px-6 py-8 text-center text-white">
          <div className="mb-4 inline-flex items-center justify-center p-3 bg-white/20 rounded-full backdrop-blur-sm">
            <span className="material-symbols-outlined text-4xl">lock</span>
          </div>
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-sm opacity-90 mt-1">Sistem Informasi DISBUNHORTI</p>
        </div>
        
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <span className="material-symbols-outlined">mail</span>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  placeholder="admin@disbunhorti.local"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <span className="material-symbols-outlined">key</span>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[var(--primary)] hover:bg-green-700 text-white font-medium rounded-lg shadow shadow-[var(--primary)]/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin hidden">pending</span>
                  Memproses...
                </>
              ) : (
                <>
                  Login 
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-5">
            <Link
              href="/"
              className="w-full py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Kembali ke Beranda
            </Link>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} DISBUNHORTI Sulawesi Tenggara
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/ui/StatCard';
import { WEEKLY_VISITS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

export default function StatistikPage() {
  const [totalVisits, setTotalVisits] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from('site_stats').select('views').eq('id', 1).single();
      if (data) {
        setTotalVisits(data.views);
      }
    };
    fetchStats();
    
    // Subscribe to realtime updates
    const channel = supabase.channel('realtime:site_stats')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_stats' }, (payload) => {
        setTotalVisits(payload.new.views);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const maxVisitsTemp = Math.max(...WEEKLY_VISITS.map((w) => w.visits));
  const maxVisits = maxVisitsTemp === 0 ? 1 : maxVisitsTemp;

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Statistik Kunjungan Website</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Ikhtisar performa dan perilaku pengunjung platform SIMBUNHORTI.
        </p>
      </div>

      {/* Total Kunjungan Card Only */}
      <div className="max-w-sm mb-10">
        <StatCard
          title="Total Kunjungan"
          value={totalVisits.toLocaleString('id-ID')}
          subtitle="Sejak website dipublikasikan"
          icon="visibility"
          color="primary"
          iconSize="lg"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 opacity-60">
        {/* Weekly Trend Line Chart */}
        <div className="bg-white rounded-xl border border-[var(--border-light)] overflow-hidden shadow-sm relative">
           <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 backdrop-blur-[1px]">
             <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">Segera Datang</span>
           </div>
          <div className="px-6 py-4 border-b border-[var(--border-light)]">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Tren Kunjungan Mingguan</h2>
            <p className="text-xs text-[var(--text-tertiary)]">5 minggu terakhir</p>
          </div>
          <div className="p-6">
            <svg viewBox="0 0 500 200" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="visitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#13ec13" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#13ec13" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Grid */}
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="40" y1={30 + i * 45} x2="470" y2={30 + i * 45} stroke="#e8f0e8" strokeWidth="0.5" strokeDasharray="3 3" />
              ))}

              {/* Area */}
              <path
                d="M 80 140 L 170 100 L 260 75 L 350 82 L 440 55 L 440 170 L 80 170 Z"
                fill="url(#visitGradient)"
              />

              {/* Line */}
              <polyline
                points="80,140 170,100 260,75 350,82 440,55"
                fill="none"
                stroke="#13ec13"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {[
                [80, 140], [170, 100], [260, 75], [350, 82], [440, 55]
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="white" stroke="#13ec13" strokeWidth="2" />
              ))}

              {/* X labels */}
              {WEEKLY_VISITS.map((w, i) => (
                <text key={i} x={80 + i * 90} y="192" textAnchor="middle" className="fill-[var(--text-tertiary)]" fontSize="9">
                  {w.week}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-[var(--border-light)] overflow-hidden shadow-sm relative">
           <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 backdrop-blur-[1px]">
             <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">Segera Datang</span>
           </div>
          <div className="px-6 py-4 border-b border-[var(--border-light)]">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Volume Kunjungan</h2>
            <p className="text-xs text-[var(--text-tertiary)]">Per minggu</p>
          </div>
          <div className="p-6">
            <div className="flex items-end gap-3 h-44">
              {WEEKLY_VISITS.map((week, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-[var(--text-primary)]">
                    {(week.visits / 1000).toFixed(1)}K
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-green-400 transition-all duration-500 hover:from-emerald-600 hover:to-green-500 cursor-pointer relative group"
                    style={{ height: `${(week.visits / maxVisits) * 100}%` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {week.visits.toLocaleString()} kunjungan
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--text-tertiary)]">{week.week}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-[var(--border-light)] text-center">
        <p className="text-xs text-[var(--text-tertiary)]">
          Dinas Perkebunan dan Hortikultura Sulawesi Tenggara
        </p>
      </div>
    </div>
  );
}

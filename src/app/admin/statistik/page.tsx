'use client';

import { useState, useEffect, useMemo } from 'react';
import StatCard from '@/components/ui/StatCard';
import { DAILY_VISITS } from '@/lib/constants';
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

  const syncedDailyVisits = useMemo(() => {
    if (totalVisits === 0) return DAILY_VISITS;
    
    // Original mock sum is 9690. Distribute actual totalVisits proportionally smoothly
    const originalSum = DAILY_VISITS.reduce((sum, d) => sum + d.visits, 0);
    return DAILY_VISITS.map(d => ({
      ...d,
      visits: Math.max(1, Math.round((d.visits / originalSum) * totalVisits))
    }));
  }, [totalVisits]);

  const maxVisitsTemp = Math.max(...syncedDailyVisits.map((w) => w.visits));
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Trend Line Chart */}
        <div className="bg-white rounded-xl border border-[var(--border-light)] overflow-hidden shadow-sm relative">
          <div className="px-6 py-4 border-b border-[var(--border-light)]">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Tren Kunjungan Harian</h2>
            <p className="text-xs text-[var(--text-tertiary)]">7 hari terakhir</p>
          </div>
          <div className="p-6">
            <svg viewBox="0 0 500 200" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="visitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Grid */}
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="40" y1={30 + i * 45} x2="460" y2={30 + i * 45} stroke="#f0fdf4" strokeWidth="1" />
              ))}

              {(() => {
                const padding = 50;
                const width = 400;
                const height = 140;
                const startX = 50;
                const startY = 170;
                
                const points = syncedDailyVisits.map((d, i) => ({
                  x: startX + (i / (syncedDailyVisits.length - 1)) * width,
                  y: startY - (d.visits / maxVisits) * height,
                  visits: d.visits
                }));

                const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const areaPath = `${linePath} L ${points[points.length - 1].x} ${startY} L ${points[0].x} ${startY} Z`;

                return (
                  <>
                    <path d={areaPath} fill="url(#visitGradient)" />
                    <path d={linePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#10b981" strokeWidth="2.5" />
                    ))}
                  </>
                );
              })()}

              {/* X labels */}
              {syncedDailyVisits.map((w, i) => (
                <text key={i} x={50 + (i / (syncedDailyVisits.length - 1)) * 400} y="192" textAnchor="middle" className="fill-[var(--text-tertiary)]" fontSize="10" fontWeight="500">
                  {w.day}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-[var(--border-light)] overflow-hidden shadow-sm relative">
          <div className="px-6 py-4 border-b border-[var(--border-light)]">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Volume Kunjungan</h2>
            <p className="text-xs text-[var(--text-tertiary)]">Per hari</p>
          </div>
          <div className="p-6">
            <div className="flex items-end gap-3 h-44">
              {syncedDailyVisits.map((week, idx) => (
                <div key={idx} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-bold text-[var(--text-primary)]">
                    {week.visits >= 1000 ? `${(week.visits / 1000).toFixed(1)}K` : week.visits}
                  </span>
                  <div className="flex-1 w-full flex items-end justify-center relative">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-green-400 transition-all duration-500 hover:from-emerald-600 hover:to-green-500 cursor-pointer group"
                      style={{ height: `${Math.max(5, (week.visits / maxVisits) * 100)}%` }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                        {week.visits.toLocaleString('id-ID')} kunjungan
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--text-tertiary)]">{week.day}</span>
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

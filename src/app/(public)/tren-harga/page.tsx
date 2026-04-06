'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/ui/StatCard';
import { supabase } from '@/lib/supabase';
import { formatRupiah, type Commodity } from '@/lib/constants';

export default function TrenHargaPage() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('Semua');
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    const fetchCommodities = async () => {
      const { data } = await supabase.from('commodities').select('*');
      if (data) {
        const mapped = data.map((d: any) => ({
          ...d,
          currentPrice: d.currentprice,
          previousPrice: d.previousprice,
          lastUpdated: d.lastupdated,
        })) as Commodity[];
        setCommodities(mapped);
      }
    };
    fetchCommodities();
    
    const channel = supabase.channel('realtime:tren_harga')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commodities' }, () => {
        fetchCommodities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch history when filter changes
  useEffect(() => {
    if (selectedFilter !== 'Semua') {
      const selectedComm = commodities.find(c => c.name === selectedFilter);
      if (selectedComm) {
        supabase.from('price_history')
          .select('*')
          .eq('commodity_id', selectedComm.id)
          .order('recorded_at', { ascending: true })
          .then(({ data }) => setHistoryData(data || []));
      }
    } else {
      setHistoryData([]);
    }
  }, [selectedFilter, commodities]);

  // Filter
  const uniqueNames = Array.from(new Set(commodities.map(c => c.name)));
  const filteredCommodities = selectedFilter === 'Semua' 
    ? commodities 
    : commodities.filter(c => c.name === selectedFilter);

  let maxPrice = 0, minPrice = 0, avgPrice = 0, changePercent = "0.0";
  let chartW = 800, chartH = 300, padL = 80, padR = 40, padT = 40, padB = 50;
  let plotW = chartW - padL - padR, plotH = chartH - padT - padB;
  let yLabels: number[] = [], yTicks = 5, graphMax = 1;
  let statsData: any[] = [];
  let points: any[] = [];
  let linePath = "", areaPath = "";

  if (selectedFilter === 'Semua') {
    const total = commodities.length;
    const currentPrices = commodities.map((c: Commodity) => c.currentPrice);
    const previousPrices = commodities.map((c: Commodity) => c.previousPrice);

    maxPrice = currentPrices.length > 0 ? Math.max(...currentPrices) : 0;
    minPrice = currentPrices.length > 0 ? Math.min(...currentPrices) : 0;
    avgPrice = currentPrices.length > 0 ? Math.round(currentPrices.reduce((a: number, b: number) => a + b, 0) / total) : 0;

    const prevAvgPrice = previousPrices.length > 0 ? Math.round(previousPrices.reduce((a: number, b: number) => a + b, 0) / total) : 0;
    changePercent = prevAvgPrice > 0 ? ((avgPrice - prevAvgPrice) / prevAvgPrice * 100).toFixed(1) : "0.0";
    
    statsData = [
      { label: 'Terendah', value: minPrice },
      { label: 'Rata-rata', value: avgPrice },
      { label: 'Tertinggi', value: maxPrice }
    ];
    graphMax = maxPrice * 1.2 || 1;
    const yStep = graphMax / (yTicks - 1);
    yLabels = Array.from({ length: yTicks }, (_, i) => Math.round(i * yStep));
  } else {
    // History Mode
    const prices = historyData.length > 0 ? historyData.map(d => d.price) : [0];
    maxPrice = Math.max(...prices);
    minPrice = Math.min(...prices);
    avgPrice = Math.round(prices.reduce((a: number, b: number) => a + b, 0) / (prices.length || 1));
    
    const firstPrice = prices[0] || 0;
    const lastPrice = prices[prices.length - 1] || 0;
    changePercent = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice * 100).toFixed(1) : "0.0";
    
    const pRange = maxPrice - minPrice || 1;
    graphMax = maxPrice + (pRange * 0.2);
    const graphMin = Math.max(0, minPrice - (pRange * 0.2));
    const range = graphMax - graphMin;
    const yStep = range / (yTicks - 1);
    yLabels = Array.from({ length: yTicks }, (_, i) => Math.round(graphMin + i * yStep));
    
    points = historyData.map((d, i) => {
      const dateStr = new Date(d.recorded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      return {
        x: padL + (i / (Math.max(1, historyData.length - 1))) * plotW,
        y: padT + plotH - ((d.price - graphMin) / range) * plotH,
        price: d.price,
        label: dateStr,
      };
    });

    if (points.length > 0) {
      linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      areaPath = `${linePath} L ${points[points.length - 1].x} ${padT + plotH} L ${points[0].x} ${padT + plotH} Z`;
    }
  }

  const barWidth = 80;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-emerald-700 to-green-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <p className="text-emerald-200 text-xs font-semibold tracking-wider uppercase mb-3">
            Analisis Data Perkebunan
          </p>
          <h1 className="text-3xl font-extrabold text-white mb-3">Statistik Harga Komoditas</h1>
          <p className="text-sm text-white/70 max-w-xl">
            Visualisasi data berdasarkan rata-rata, harga tertinggi, dan harga terendah dari seluruh komoditas terdaftar.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
           <StatCard
            title="Rata-rata Harga"
            value={formatRupiah(avgPrice)}
            change={parseFloat(changePercent)}
            icon="trending_up"
            color="success"
          />
          <StatCard title="Harga Tertinggi" value={formatRupiah(maxPrice)} icon="arrow_upward" color="warning" />
          <StatCard title="Harga Terendah" value={formatRupiah(minPrice)} icon="arrow_downward" color="info" />
        </div>

        {/* Chart Area */}
        <div className="bg-white rounded-xl border border-[var(--border-light)] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[var(--border-light)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Grafik Indikator Harga Global</h2>
              <p className="text-xs text-[var(--text-tertiary)]">Perbandingan harga di Sulawesi Tenggara</p>
            </div>
            
            {/* Filter */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all min-w-[200px]"
            >
              <option value="Semua">Semua Komoditas</option>
              {uniqueNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="p-6">
            <div className="relative">
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="barGrad0" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" stopColor="#3b82f6" />
                     <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="barGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" stopColor="#10b981" />
                     <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                  <linearGradient id="barGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" stopColor="#f59e0b" />
                     <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {yLabels.map((_, i) => {
                  const y = padT + plotH - (i / (yTicks - 1)) * plotH;
                  return <line key={i} x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="4 4" />;
                })}

                {/* Y-axis labels */}
                {yLabels.map((val, i) => {
                  const y = padT + plotH - (i / (yTicks - 1)) * plotH;
                  const label = formatRupiah(val);
                  return <text key={i} x={padL - 10} y={y + 4} textAnchor="end" className="fill-slate-400 font-medium" fontSize="11">{label}</text>;
                })}

                {/* Graphic Elements */}
                {selectedFilter === 'Semua' ? (
                  <>
                    {statsData.map((d, i) => {
                      const barH = Math.max(1, (d.value / graphMax) * plotH);
                      const x = padL + (plotW / 3) * i + (plotW / 3 - barWidth) / 2;
                      const y = padT + plotH - barH;
                      
                      return (
                        <g key={i}>
                          <rect 
                            x={x} 
                            y={y} 
                            width={barWidth} 
                            height={barH} 
                            fill={`url(#barGrad${i})`} 
                            rx="6"
                            ry="6"
                            className="transition-all duration-500 hover:opacity-80"
                          />
                          <text x={x + barWidth/2} y={y - 10} textAnchor="middle" className="fill-slate-600 font-bold" fontSize="12">
                            {formatRupiah(d.value)}
                          </text>
                          <text x={x + barWidth/2} y={padT + plotH + 25} textAnchor="middle" className="fill-slate-500 font-semibold uppercase tracking-wider" fontSize="11">
                            {d.label}
                          </text>
                        </g>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {points.length > 0 && (
                      <>
                        <path d={areaPath} fill="url(#trendGradient)" />
                        <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        {points.map((p, i) => (
                          <g key={i}>
                            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#10b981" strokeWidth="2" />
                            {i % Math.ceil(points.length / 5) === 0 && (
                              <text x={p.x} y={padT + plotH + 20} textAnchor="middle" className="fill-slate-500 font-semibold" fontSize="10">
                                {p.label}
                              </text>
                            )}
                          </g>
                        ))}
                      </>
                    )}
                    {points.length === 0 && (
                      <text x={chartW / 2} y={chartH / 2} textAnchor="middle" className="fill-slate-400 font-semibold">
                        Gagal memuat rekam jejak harga historis atau data belum tersedia di tabel price_history.
                      </text>
                    )}
                  </>
                )}
                
                {/* Base Line */}
                <line x1={padL} y1={padT + plotH} x2={chartW - padR} y2={padT + plotH} stroke="#cbd5e1" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

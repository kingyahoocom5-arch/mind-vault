'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const saved = localStorage.getItem('mind_vault_next_data');
    if (saved) {
      const data = JSON.parse(saved);
      setTotal(data.length);

      const counts: { [key: string]: number } = {};
      data.forEach((item: any) => {
        counts[item.category] = (counts[item.category] || 0) + 1;
      });
      setCategories(counts);
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Tombol Kembali */}
        <Link href="/" className="text-amber-400 text-sm hover:underline flex items-center gap-1">
          ← Kembali ke Vault Utama
        </Link>

        <h1 className="text-3xl font-extrabold text-amber-400">📊 Analitik Muhasabah & Insight</h1>
        <p className="text-sm text-slate-400">Ringkasan statistik pemikiran dan perkembangan diri kamu.</p>

        {/* Ringkasan Angka */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs text-slate-400 block">Total Refleksi</span>
            <span className="text-3xl font-bold text-amber-400">{total}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs text-slate-400 block">Kategori Terbanyak</span>
            <span className="text-lg font-bold text-emerald-400">
              {Object.keys(categories).length > 0
                ? Object.keys(categories).reduce((a, b) => (categories[a] > categories[b] ? a : b))
                : '-'}
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs text-slate-400 block">Status Level</span>
            <span className="text-lg font-bold text-amber-300">
              {total > 10 ? '🔥 Thinker Level 2' : '🌱 Novice Thinker'}
            </span>
          </div>
        </div>

        {/* Breakdown per Kategori */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-slate-200">Sebaran Pemikiran per Kategori</h2>
          {Object.keys(categories).length === 0 ? (
            <p className="text-xs text-slate-500">Belum ada data untuk dianalisis.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(categories).map(([cat, count]) => (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>{cat}</span>
                    <span className="font-bold text-amber-400">{count} Kartu</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${Math.min((count / total) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
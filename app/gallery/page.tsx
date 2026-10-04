'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { toPng } from 'html-to-image';

interface InsightCard {
  id: number;
  title: string;
  content: string;
  category: string;
  mood: string;
  date: string;
}

export default function GalleryPage() {
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const saved = localStorage.getItem('mind_vault_next_data');
    if (saved) {
      setInsights(JSON.parse(saved));
    }
  }, []);

  const downloadCardImage = (id: number, title: string) => {
    const node = cardRefs.current[id];
    if (!node) return;

    toPng(node, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `MindVault-${title.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Gagal mengeksport gambar:', err);
        alert('Gagal mengunduh gambar kartu.');
      });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigasi Atas */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <Link href="/" className="text-amber-400 text-sm hover:underline flex items-center gap-1">
            ← Kembali ke Vault Utama
          </Link>
          <span className="text-xs text-slate-400 font-medium">Galeri Kartu Estetik</span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-amber-400">🖼️ Galeri & Export Kartu</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ubah refleksi pilihanmu menjadi gambar kartu berkelas yang siap diunduh atau dibagikan.
          </p>
        </div>

        {insights.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
            Belum ada kartu di dalam Vault. Tuliskan refleksi pertamamu di halaman utama!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {insights.map((card) => (
              <div key={card.id} className="space-y-3">
                {/* Visual Kartu yang Akan Diunduh */}
                <div
                  ref={(el) => {
                    cardRefs.current[card.id] = el;
                  }}
                  className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 p-6 rounded-2xl shadow-2xl flex flex-col justify-between min-h-[220px] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>

                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {card.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{card.date}</span>
                    </div>

                    <h3 className="font-extrabold text-amber-300 text-lg mb-2 leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap italic">
                      "{card.content}"
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">
                      Mood: <strong class="text-slate-200">{card.mood}</strong>
                    </span>
                    <span className="text-[10px] text-amber-400/60 font-semibold tracking-wider">
                      MIND VAULT
                    </span>
                  </div>
                </div>

                {/* Tombol Action Download */}
                <button
                  onClick={() => downloadCardImage(card.id, card.title)}
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md"
                >
                  📸 Download Kartu (PNG)
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
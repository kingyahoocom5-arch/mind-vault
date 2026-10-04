'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AIAssistantPage() {
  const [topic, setTopic] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const askGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setResponse('');
    setSaved(false);

    try {
      // Panggil server lokal internal kita
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();

      if (res.ok && data.text) {
        setResponse(data.text);
      } else {
        setResponse(`Gagal: ${data.error || 'Terjadi kesalahan pada server.'}`);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setResponse(`Detail Error: ${error?.message || 'Gagal terhubung ke jaringan'}`);
    } finally {
      setLoading(false);
    }
  };

  const saveToVault = () => {
    if (!response) return;

    const savedData = localStorage.getItem('mind_vault_next_data');
    const insights = savedData ? JSON.parse(savedData) : [];

    const now = new Date();
    const newCard = {
      id: Date.now(),
      title: `Diskusi AI: ${topic.slice(0, 30)}...`,
      content: `[Topik Diskusi]: ${topic}\n\n[Insight Gemini]:\n${response}`,
      category: 'Pemikiran Kritis',
      mood: 'Kritis 🧠',
      date: now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      rawDate: now.toISOString(),
    };

    const updated = [newCard, ...insights];
    localStorage.setItem('mind_vault_next_data', JSON.stringify(updated));
    setSaved(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Navigasi */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <Link href="/" className="text-amber-400 text-sm hover:underline flex items-center gap-1">
            ← Kembali ke Vault Utama
          </Link>
          <span className="text-xs text-slate-400 font-medium">Gemini Critical Partner</span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-amber-400 flex items-center gap-2">
            🤖 AI Critical Partner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Lemparkan gagasan atau pertanyaan muhasabahmu. Ajak Gemini bedah ide secara mendalam dan kritis.
          </p>
        </div>

        {/* Form Diskusi */}
        <form onSubmit={askGemini} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Apa topik pemikiran/muhasabah yang ingin kamu bedah hari ini?
            </label>
            <textarea
              rows={4}
              placeholder="Contoh: Mengapa kadang kita merasa sudah tidak sombong, tapi di dalam hati kecil masih haus pujian dan validasi?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-amber-400 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">🧠 Sedang Membedah Pemikiran...</span>
            ) : (
              <span>✨ Diskusi Kritis Bersama AI</span>
            )}
          </button>
        </form>

        {/* Hasil Tanggapan Gemini */}
        {response && (
          <div className="bg-slate-900/90 border border-amber-500/30 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                💡 Tanggapan Kritis Gemini
              </span>
              {!saved ? (
                <button
                  onClick={saveToVault}
                  className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                >
                  📥 Simpan Ke Vault
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-bold">✓ Tersimpan di Vault</span>
              )}
            </div>

            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap italic">
              {response}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
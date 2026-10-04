'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface InsightCard {
  id: number;
  title: string;
  content: string;
  category: string;
  mood: string;
  date: string;
  rawDate: string;
}

export default function Home() {
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Pemikiran Kritis');
  const [mood, setMood] = useState('Kritis 🧠');
  const [isRecording, setIsRecording] = useState(false);
  const [flashback, setFlashback] = useState<InsightCard | null>(null);

  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('mind_vault_next_data');
    if (saved) {
      const parsed: InsightCard[] = JSON.parse(saved);
      setInsights(parsed);
      calculateStreakAndXP(parsed);

      if (parsed.length > 1) {
        setFlashback(parsed[Math.floor(Math.random() * parsed.length)]);
      }
    }
  }, []);

  const calculateStreakAndXP = (cards: InsightCard[]) => {
    setXp(cards.length * 50);

    if (cards.length === 0) {
      setStreak(0);
      return;
    }

    const uniqueDates = Array.from(
      new Set(cards.map((c) => new Date(c.rawDate).toDateString()))
    ).map((d) => new Date(d));

    uniqueDates.sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const latestDate = uniqueDates[0];
    latestDate.setHours(0, 0, 0, 0);

    if (latestDate.getTime() !== today.getTime() && latestDate.getTime() !== yesterday.getTime()) {
      setStreak(0);
      return;
    }

    let currentStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const curr = uniqueDates[i];
      const next = uniqueDates[i + 1];
      const diffTime = Math.abs(curr.getTime() - next.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const now = new Date();
    const newCard: InsightCard = {
      id: Date.now(),
      title,
      content,
      category,
      mood,
      date: now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      rawDate: now.toISOString(),
    };

    const updated = [newCard, ...insights];
    setInsights(updated);
    localStorage.setItem('mind_vault_next_data', JSON.stringify(updated));

    calculateStreakAndXP(updated);

    setTitle('');
    setContent('');
    if (updated.length > 1) {
      setFlashback(updated[Math.floor(Math.random() * updated.length)]);
    }
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Browser kamu tidak mendukung fitur rekam suara langsung.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';

    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDelete = (id: number) => {
    const updated = insights.filter((item) => item.id !== id);
    setInsights(updated);
    localStorage.setItem('mind_vault_next_data', JSON.stringify(updated));
    calculateStreakAndXP(updated);
  };

  const level = Math.floor(xp / 200) + 1;
  const currentLevelXp = xp % 200;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Utama dengan Navigasi */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-5 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-amber-400 tracking-tight flex items-center gap-2">
              🧠 Mind Vault
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Collector & Muhasabah Harian
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Indikator Streak */}
            <div className="bg-slate-900 border border-amber-500/30 px-3 py-1.5 rounded-xl text-center shadow-lg flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <div className="text-left">
                <span className="text-[9px] text-slate-400 block font-medium leading-none">Streak</span>
                <span className="text-xs font-bold text-amber-400 leading-none">{streak} Hari</span>
              </div>
            </div>

            {/* Menu Navigasi AI */}
            <Link
              href="/ai-assistant"
              className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 px-3 py-2 rounded-xl text-xs font-bold text-amber-400 transition flex items-center gap-1 shadow-md"
            >
              🤖 Tanya AI
            </Link>

            {/* Menu Navigasi Galeri */}
            <Link
              href="/gallery"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 transition flex items-center gap-1"
            >
              🖼️ Galeri
            </Link>

            {/* Menu Navigasi Analytics */}
            <Link
              href="/analytics"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 transition flex items-center gap-1"
            >
              📊 Analitik
            </Link>
          </div>
        </header>

        {/* Banner Gamifikasi */}
        <section className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl font-black text-amber-400 shadow-inner">
              Lvl {level}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                {level === 1 ? '🌱 Novice Thinker' : level === 2 ? '🧠 Deep Thinker' : '🔥 Master Vault'}
              </h3>
              <p className="text-xs text-slate-400">Kumpulkan {200 - currentLevelXp} XP lagi untuk naik level!</p>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Progress Level</span>
              <span className="font-bold text-amber-400">{currentLevelXp} / 200 XP</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(currentLevelXp / 200) * 100}%` }}
              ></div>
            </div>
          </div>
        </section>

        {/* Section Flashback */}
        {flashback && (
          <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/30 p-4 rounded-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                ⏳ Flashback (Echoes of the Past)
              </span>
              <button
                onClick={() => setFlashback(insights[Math.floor(Math.random() * insights.length)])}
                className="text-xs text-amber-400/80 hover:text-amber-300 transition underline"
              >
                Acak lagi
              </button>
            </div>
            <p className="text-sm italic text-slate-200">"{flashback.content}"</p>
            <div className="text-xs text-amber-400/70 mt-2 font-medium">
              — {flashback.title} ({flashback.date})
            </div>
          </div>
        )}

        {/* Form Input Insight */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-200">Tulis Refleksi / Pemikiran Kritis</h2>
            <button
              type="button"
              onClick={toggleVoice}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                isRecording
                  ? 'bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse'
                  : 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              🎙️ {isRecording ? 'Mendengarkan...' : 'Bicara (Voice)'}
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <input
              type="text"
              placeholder="Judul / Inti Pemikiran..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition"
              required
            />

            <textarea
              rows={3}
              placeholder="Tuliskan pemikiran atau muhasabah kamu..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="Agama">Agama / Spiritualitas</option>
                  <option value="Pengembangan Diri">Pengembangan Diri</option>
                  <option value="Kesehatan">Kesehatan & Habit</option>
                  <option value="Pemikiran Kritis">Pemikiran Kritis</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Kondisi Hati / Mood</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="Tenang 🧘‍♂️">Tenang 🧘‍♂️</option>
                  <option value="Kritis 🧠">Kritis 🧠</option>
                  <option value="Semangat 🔥">Semangat 🔥</option>
                  <option value="Gelisah 💭">Gelisah 💭</option>
                  <option value="Bersyukur 🤲">Bersyukur 🤲</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-amber-500/10 text-sm flex items-center justify-center gap-2"
            >
              <span>+ Simpan ke Vault</span>
              <span className="text-xs bg-slate-950/20 px-2 py-0.5 rounded-md font-semibold">+50 XP</span>
            </button>
          </form>
        </section>

        {/* List Kartu Insight */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200">Koleksi Kartu Insight</h2>

          {insights.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
              Belum ada kartu tersimpan. Tuliskan refleksi pertamamu di atas!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {insights.map((card) => (
                <div
                  key={card.id}
                  className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-amber-500/40 transition shadow-lg group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {card.category}
                      </span>
                      <span className="text-xs text-slate-500">{card.date}</span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-base mb-2 group-hover:text-amber-400 transition">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap">
                      {card.content}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400">
                      Mood: <span className="text-slate-200 font-medium">{card.mood}</span>
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => speakText(card.content)}
                        className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition"
                      >
                        🔊 Baca
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="text-red-400/80 hover:text-red-400 font-medium transition"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
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
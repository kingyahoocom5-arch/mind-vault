import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY belum diisi di .env.local' },
        { status: 500 }
      );
    }

    const prompt = `Kamu adalah seorang kawan akrab yang kritis, bijak, dan diajak berpikir mendalam.
User sedang melakukan muhasabah/refleksi pemikiran berikut:
"${topic}"

Berikan tanggapan singkat, kritis, tajam, namun mendukung perkembangan diri/agama/positif (maksimal 2-3 paragraf ringkas). Hindari bahasa yang terlalu menggurui, berbicaralah sebagai teman diskusi yang setara dan kritis dalam bahasa Indonesia.`;

    // Panggil Endpoint Resmi Gemini secara langsung (Mendukung format kunci AQ.)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Error Gemini API:', data);
      return NextResponse.json(
        { error: data?.error?.message || 'Gagal dari Google Gemini' },
        { status: response.status }
      );
    }

    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Tidak ada tanggapan yang dihasilkan.';

    return NextResponse.json({ text: replyText });
  } catch (error: any) {
    console.error('Error Server Internal:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
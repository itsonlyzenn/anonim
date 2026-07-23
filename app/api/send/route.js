import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

// Daftar kata kasar yang ingin diblokir (Bisa kamu tambah sesuka hati)
const KATA_KASAR = [
  'anjing', 'babi', 'monyet', 'kunyuk', 'bajingan', 'asu',
  'kontol', 'memek', 'goblok', 'tolol', 'bego', 'bangsat',
  'peler', 'itil', 'jancok', 'pantek', 'kampret', 'kntl',
  'mmk', 'bgst', 'gblk', 'fuck', 'shit', 'bitch'
];

// Fungsi penyeleksi kata kasar
function cekKataKasar(teks) {
  if (!teks) return false;
  const teksLower = teks.toLowerCase();
  return KATA_KASAR.some((kata) => teksLower.includes(kata));
}

export async function POST(request) {
  try {
    const { emailSekolah, subjek, pesan } = await request.json();

    if (!emailSekolah || !subjek || !pesan) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi.' },
        { status: 400 }
      );
    }

    // Cek kata kasar di subjek & pesan
    const isSubjekKasar = cekKataKasar(subjek);
    const isPesanKasar = cekKataKasar(pesan);

    if (isSubjekKasar || isPesanKasar) {
      return NextResponse.json(
        { 
          error: 'Pesan kamu mengandung kata-kata kasar / tidak sopan! Mohon gunakan bahasa yang lebih baik.' 
        },
        { status: 400 }
      );
    }

    const senderEmail = process.env.SENDER_EMAIL || 'Laporan Anonim <onboarding@resend.dev>';

    const data = await resend.emails.send({
      from: senderEmail,
      to: [emailSekolah],
      subject: `[Laporan Anonim] ${subjek}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
          <h2 style="color: #2563eb;">Laporan / Keluhan Anonim Siswa</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
          <p><strong>Subjek:</strong> ${subjek}</p>
          <p><strong>Pesan Keluhan:</strong></p>
          <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #2563eb; margin: 10px 0;">
            ${pesan.replace(/\n/g, '<br/>')}
          </blockquote>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #888; line-height: 1.4;">
            Pesan ini dikirimkan otomatis melalui platform perantara pesan anonim.<br/>
            Apabila pesan ini berisi spam/pelanggaran, silakan hubungi admin di <b>abuse@arex.my.id</b>.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import Filter from 'bad-words';

const resend = new Resend(process.env.RESEND_API_KEY);

// Inisialisasi Filter Kata Kasar
const filter = new Filter();

// Daftar kata kasar Bahasa Indonesia
const kataKasarIndo = [
  'anjing', 'babi', 'monyet', 'kunyuk', 'bajingan', 'asu',
  'kontol', 'memek', 'goblok', 'tolol', 'bego', 'bangsat',
  'peler', 'itil', 'jancok', 'pantek', 'kampret', 'kntl',
  'mmk', 'bgst', 'gblk'
];

filter.addWords(...kataKasarIndo);

export async function POST(request) {
  try {
    const { emailSekolah, subjek, pesan } = await request.json();

    // 1. Validasi Input Kosong
    if (!emailSekolah || !subjek || !pesan) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi.' },
        { status: 400 }
      );
    }

    // 2. Filter Kata Kasar
    const isSubjekKasar = filter.isProfane(subjek);
    const isPesanKasar = filter.isProfane(pesan);

    if (isSubjekKasar || isPesanKasar) {
      return NextResponse.json(
        { 
          error: 'Pesan kamu mengandung kata-kata kasar / tidak sopan! Mohon gunakan bahasa yang lebih baik agar dapat diproses.' 
        },
        { status: 400 }
      );
    }

    const senderEmail = process.env.SENDER_EMAIL || 'Laporan Anonim <onboarding@resend.dev>';

    // 3. Kirim Email via Resend
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
            Pesan ini dikirimkan otomatis melalui platform perantara pesan anonim. Identitas pengirim dilindungi.<br/>
            Apabila pesan ini berisi spam atau pelanggaran, silakan laporkan ke admin di <b>abuse@arex.my.id</b>.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
'use client';

import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    emailSekolah: '',
    subjek: '',
    pesan: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({
          type: 'success',
          message: 'Keluhan anonim Anda berhasil terkirim ke pihak sekolah!',
        });
        setFormData({ emailSekolah: '', subjek: '', pesan: '' });
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Gagal mengirim email keluhan.',
        });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'Terjadi kesalahan sistem. Coba lagi nanti.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Lapor Sekolah Anonim</h1>
        <p>Suarakan keluhan dan saranmu secara aman tanpa rasa takut.</p>
      </div>

      {status && (
        <div className={`alert alert-${status.type}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="emailSekolah">Email Sekolah Tujuan</label>
          <input
            type="email"
            id="emailSekolah"
            name="emailSekolah"
            placeholder="contoh: humas@sekolah.sch.id"
            value={formData.emailSekolah}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="subjek">Subjek Keluhan</label>
          <input
            type="text"
            id="subjek"
            name="subjek"
            placeholder="contoh: Fasilitas Toilet Rusak / Pungli"
            value={formData.subjek}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="pesan">Pesan Keluhan Detail</label>
          <textarea
            id="pesan"
            name="pesan"
            rows="6"
            placeholder="Tuliskan keluhanmu secara detail di sini..."
            value={formData.pesan}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Memeriksa & Mengirim...' : 'Kirim Laporan'}
        </button>
      </form>

      <p className="disclaimer">
        Sistem ini otomatis menolak kata kasar, SARA, dan ujaran kebencian.
        Gunakan bahasa yang sopan agar pesan Anda dapat ditanggapi oleh sekolah.
      </p>
    </div>
  );
}
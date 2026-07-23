import './globals.css';

export const metadata = {
  title: 'Lapor Sekolah Anonim',
  description: 'Kirim keluhan dan aspirasi ke sekolah secara aman dan anonim.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
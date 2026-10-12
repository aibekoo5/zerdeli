import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'Zerdeli — NIS, BIL, RFMSH, ҰБТ дайындық | Болашағыңды бүгіннен баста',
  description: 'Zerdeli — NIS, BIL, RFMSH, ҰБТ емтихандарына кәсіби дайындық. Озық білім беру технологиялары, тәжірибелі оқытушылар, интерактивті курстар және толық сынақ жүйесі.',
  openGraph: {
    title: 'Zerdeli — Premium EdTech Platform | Болашағыңды бүгіннен баста',
    description: 'Қазақстандағы озық білім беру платформасы. NIS, BIL, RFMSH, ҰБТ дайындығы - барлығы бір жерде.',
    siteName: 'Zerdeli',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kk" className="scroll-smooth" data-theme="light">
      <body className="antialiased font-sans selection:bg-zerdeli-500 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

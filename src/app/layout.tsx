
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'StudyPro - Master Your Materials',
  description:
    'Alat pelacak progres belajar berbasis kategori untuk membantu Anda menguasai materi secara mendalam.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-slate-950 flex justify-center overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {/* Mobile Frame Container */}
            <div className="relative flex min-h-screen w-full max-w-[480px] flex-col bg-background shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <Header />
              <main className="flex-grow pb-24">
                {children}
              </main>
              <BottomNav />
              <Toaster />
            </div>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

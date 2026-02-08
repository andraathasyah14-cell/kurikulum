import Link from 'next/link';

import { Logo } from '@/components/logo';

const footerNav = {
  'Tentang Konsensus': [
    { label: 'Visi Dasar', href: '/about' },
    { label: 'Prinsip Inti', href: '/about' },
    { label: 'Pendekatan', href: '/treaty' },
    { label: 'Implementasi', href: '/treaty' },
  ],
  'Kerangka Kerja': [
    { label: 'Dokumen Konsensus', href: '/treaty' },
    { label: 'Tata Kelola', href: '/governance' },
    { label: 'Transparansi', href: '/contact' },
  ],
  'Sumber Daya': [
    { label: 'Data & Laporan', href: '/data' },
    { label: 'Berita', href: '/news' },
    { label: 'Hubungi Kami', href: '/contact' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center gap-2">
              <Logo />
              <span className="font-headline text-lg font-bold">
                Werjia Consensus
              </span>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              “Pertumbuhan dengan Keadilan, Pragmatisme dengan Kebebasan”
            </p>
          </div>
          {Object.entries(footerNav).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 font-headline font-semibold">{title}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Uni Mirdiy Modern. Hak cipta
            dilindungi undang-undang.
          </p>
        </div>
      </div>
    </footer>
  );
}

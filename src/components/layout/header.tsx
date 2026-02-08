'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/about', label: 'Tentang UECD' },
  { href: '/treaty', label: 'Traktat & Hukum' },
  { href: '/governance', label: 'Tata Kelola' },
  { href: '/integration', label: 'Integrasi Ekonomi' },
  { href: '/sectors', label: 'Sektor' },
  { href: '/data', label: 'Data & Laporan' },
  { href: '/news', label: 'Berita' },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium transition-colors hover:text-primary',
        pathname === href ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {label}
    </Link>
  );
}

const NavItems = ({ className }: { className?: string }) => (
  <nav className={cn('flex items-center gap-4 lg:gap-6', className)}>
    {navLinks.slice(0, 3).map(link => (
      <NavLink key={link.href} href={link.href} label={link.label} />
    ))}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="px-0 text-sm font-medium text-muted-foreground hover:text-primary focus-visible:ring-0"
        >
          Lainnya
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {navLinks.slice(3).map(link => (
          <DropdownMenuItem key={link.href} asChild>
            <Link href={link.href}>{link.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </nav>
);

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <Logo />
          <span className="hidden font-headline font-bold sm:inline-block">
            UECD
          </span>
        </Link>

        <div className="hidden md:flex md:flex-1">
          <NavItems />
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari..."
              className="pl-8 sm:w-[200px] lg:w-[300px]"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Buka menu navigasi</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link href="/" className="mb-6 flex items-center gap-2">
                <Logo />
                <span className="font-headline font-bold">UECD</span>
              </Link>
              <NavItems className="flex-col items-start gap-4" />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

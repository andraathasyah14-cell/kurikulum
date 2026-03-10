'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LayoutDashboard, ListChecks, TrendingUp, Settings, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/activities', label: 'Checklist', icon: ListChecks },
  { href: '/stats', label: 'Statistik', icon: TrendingUp },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ListChecks className="h-5 w-5" />
          </div>
          <span className="font-headline font-bold text-xl sm:inline-block">
            TrackPro
          </span>
        </Link>

        <nav className="hidden md:flex md:flex-1 items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                pathname === link.href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          {user ? (
             <Button variant="ghost" size="icon" className="rounded-full">
               <User className="h-5 w-5" />
             </Button>
          ) : (
            <Button size="sm">Mulai</Button>
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link href="/" className="mb-8 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ListChecks className="h-5 w-5" />
                </div>
                <span className="font-headline font-bold text-xl">TrackPro</span>
              </Link>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 text-lg font-medium py-2',
                      pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

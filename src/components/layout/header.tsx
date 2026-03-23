
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, Calendar, Trophy, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useAuth } from '@/firebase';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const desktopNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/activities', label: 'Kurikulum', icon: BookOpen },
  { href: '/calendar', label: 'Riwayat', icon: Calendar },
  { href: '/ranking', label: 'Ranking', icon: Trophy },
  { href: '/stats', label: 'Statistik', icon: BarChart3 },
];

export function Header() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogin = () => {
    initiateGoogleSignIn(auth, (error) => {
      toast({
        variant: 'destructive',
        title: 'Gagal Masuk',
        description: error.message,
      });
    });
  };

  const getPageTitle = () => {
    if (pathname === '/') return 'DASHBOARD';
    if (pathname === '/activities') return 'KURIKULUM';
    if (pathname === '/calendar') return 'RIWAYAT';
    if (pathname === '/ranking') return 'RANKING';
    if (pathname === '/goals') return 'TARGET';
    if (pathname === '/journal') return 'JURNAL';
    if (pathname === '/stats') return 'STATISTIK';
    if (pathname === '/watchlist') return 'WATCHLIST';
    if (pathname === '/report') return 'LAPORAN';
    if (pathname === '/settings') return 'PENGATURAN';
    return 'STUDYPRO';
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-muted">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-black text-lg tracking-tighter uppercase md:hidden">
              {getPageTitle()}
            </span>
            <span className="hidden md:block font-black text-xl tracking-tighter uppercase">
              STUDYPRO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {desktopNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className={cn(
                    "rounded-full h-9 px-4 font-black text-[10px] uppercase tracking-widest gap-2",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-[10px] font-black uppercase tracking-tight leading-none mb-0.5">{user.displayName}</p>
                <p className="text-[8px] font-bold text-muted-foreground uppercase leading-none">Scholar Level 1</p>
              </div>
              <Link href="/settings">
                <Avatar className="h-9 w-9 border-2 border-primary/20 hover:scale-105 transition-transform">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                  <AvatarFallback className="font-black">{user.displayName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          ) : (
            <Button size="sm" className="rounded-full px-5 font-black text-[10px] uppercase h-9" onClick={handleLogin}>
              MASUK
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

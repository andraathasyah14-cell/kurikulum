
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useAuth } from '@/firebase';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';

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

  // Get dynamic page title
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
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-black text-lg tracking-tighter uppercase">
            {getPageTitle()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/settings">
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                <AvatarFallback className="font-black">{user.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </Link>
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

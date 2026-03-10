
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LayoutDashboard, ListChecks, TrendingUp, Settings, LogOut, Award } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/activities', label: 'Checklist', icon: ListChecks },
  { href: '/stats', label: 'Statistik', icon: TrendingUp },
  { href: '/review', label: 'Review', icon: Award },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
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
        description: error.code === 'auth/operation-not-allowed' 
          ? 'Metode login Google belum diaktifkan.' 
          : error.message,
      });
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ListChecks className="h-5 w-5" />
          </div>
          <span className="font-headline font-black text-xl tracking-tighter sm:inline-block">
            TRACKPRO
          </span>
        </Link>

        <nav className="hidden md:flex md:flex-1 items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-sm font-bold uppercase tracking-tight transition-colors rounded-full hover:bg-muted',
                pathname === link.href ? 'text-primary bg-primary/5' : 'text-muted-foreground'
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/settings" className="cursor-pointer"><Settings className="mr-2 h-4 w-4" /> Pengaturan</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => signOut(auth)}><LogOut className="mr-2 h-4 w-4" /> Keluar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" className="rounded-full" onClick={handleLogin}>Masuk</Button>
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-6 w-6" /></Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link href="/" className="mb-8 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><ListChecks className="h-5 w-5" /></div><span className="font-headline font-black text-xl">TRACKPRO</span></Link>
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={cn('flex items-center gap-3 text-sm font-bold uppercase py-3 px-4 rounded-xl', pathname === link.href ? 'text-primary bg-primary/5' : 'text-muted-foreground')}>{link.icon && <link.icon className="h-5 w-5" />}{link.label}</Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

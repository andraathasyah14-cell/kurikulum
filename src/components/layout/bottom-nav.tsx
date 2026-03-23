
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Calendar, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/activities', label: 'Kurikulum', icon: BookOpen },
  { href: '/calendar', label: 'Kalender', icon: Calendar },
  { href: '/ranking', label: 'Ranking', icon: Trophy },
  { href: '/settings', label: 'Profil', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 z-50 w-full bg-background/95 backdrop-blur-lg border-t border-muted flex items-center justify-around px-2 py-3 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "p-2 rounded-2xl transition-all",
              isActive ? "bg-primary/10" : ""
            )}>
              <item.icon className={cn("h-6 w-6", isActive && "fill-current")} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

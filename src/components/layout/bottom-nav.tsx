
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Calendar, Trophy, Clock, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/activities', label: 'Materi', icon: BookOpen },
  { href: '/schedule', label: 'Jadwal', icon: Clock },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/calendar', label: 'Riwayat', icon: Calendar },
  { href: '/ranking', label: 'Rank', icon: Trophy },
];

export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="md:hidden fixed bottom-0 z-50 w-full bg-background/95 backdrop-blur-lg border-t border-muted flex items-center justify-around px-1 py-3 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 flex-1",
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-xl transition-all",
              isActive ? "bg-primary/10" : ""
            )}>
              <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

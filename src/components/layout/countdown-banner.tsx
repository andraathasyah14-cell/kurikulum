'use client';

import { useState, useEffect } from 'react';
import { Timer as TimerIcon, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    // Menetapkan target: 41 hari dari sekarang (untuk simulasi)
    // Dalam penggunaan nyata, ini bisa berupa tanggal ujian tetap.
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 41);
    targetDate.setHours(0, 0, 0, 0);

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-[0_-4px_20px_rgba(0,0,0,0.15)] border-t border-white/10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-4 md:gap-8">
        <div className="hidden md:flex items-center gap-2 opacity-80">
          <Zap className="h-5 w-5 fill-current text-yellow-300" />
          <span className="font-black text-xs uppercase tracking-widest">Menuju Target Besar</span>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <TimeUnit value={timeLeft.days} label="Hari" />
          <TimeSeparator />
          <TimeUnit value={timeLeft.hours} label="Jam" />
          <TimeSeparator />
          <TimeUnit value={timeLeft.minutes} label="Menit" />
          <TimeSeparator />
          <TimeUnit value={timeLeft.seconds} label="Detik" isLast />
        </div>

        <div className="hidden md:flex items-center gap-2 opacity-80">
          <TimerIcon className="h-5 w-5" />
          <span className="font-black text-xs uppercase tracking-widest">Jangan Menyerah!</span>
        </div>
      </div>
    </div>
  );
}

function TimeUnit({ value, label, isLast = false }: { value: number; label: string; isLast?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-2xl md:text-4xl font-black font-mono tracking-tighter tabular-nums leading-none">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-[10px] md:text-[12px] font-black uppercase tracking-tighter opacity-70 mt-1">
        {label}
      </div>
    </div>
  );
}

function TimeSeparator() {
  return (
    <div className="text-xl md:text-3xl font-black opacity-30 mb-4">:</div>
  );
}

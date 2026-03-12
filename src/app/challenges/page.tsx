
'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Timer as TimerIcon, 
  Target, 
  CheckCircle2, 
  Users,
  Award,
  ArrowRight,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/avatar';
import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { query, collection, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { format, endOfWeek, differenceInSeconds, startOfWeek } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const CHALLENGES = [
  { 
    id: 'sprint', 
    title: '7 Day Learning Sprint', 
    description: 'Selesaikan minimal 1 materi setiap hari selama seminggu penuh.',
    target: 7,
    unit: 'Lessons',
    icon: Flame,
    color: 'text-orange-500 bg-orange-50'
  },
  { 
    id: 'marathon', 
    title: '100 Hour Marathon', 
    description: 'Akumulasi 100 jam belajar efektif dalam kurikulum Anda.',
    target: 100,
    unit: 'Hours',
    icon: TimerIcon,
    color: 'text-blue-500 bg-blue-50'
  },
  { 
    id: 'mastery', 
    title: '30 Material Challenge', 
    description: 'Tantang dirimu untuk menguasai 30 materi baru bulan ini.',
    target: 30,
    unit: 'Materials',
    icon: Award,
    color: 'text-purple-500 bg-purple-50'
  }
];

// Seeded random for deterministic bots based on current week
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export default function ChallengesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState('');
  const currentWeek = format(new Date(), 'I'); // ISO Week number

  // Season Countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const end = endOfWeek(now, { weekStartsOn: 1 });
      const diff = differenceInSeconds(end, now);
      
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      setTimeLeft(`${days}h ${hours}j ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const logsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'logs'));
  }, [db, user]);

  const { data: logs } = useCollection(logsQuery);

  const stats = useMemo(() => {
    if (!logs) return { count: 0, hours: 0 };
    return {
      count: logs.length,
      hours: Math.round((logs.length * 25) / 60)
    };
  }, [logs]);

  // Algorithmic Challenge Leaderboard (Changes every week)
  const challengeLeaderboard = useMemo(() => {
    const weekSeed = parseInt(currentWeek);
    const bots = Array.from({ length: 10 }).map((_, i) => {
      const seed = weekSeed + i;
      const progressBase = 40 + (pseudoRandom(seed) * 55); // Bots stay between 40-95%
      return {
        id: `bot-challenge-${i}`,
        name: `Scholar_${Math.floor(pseudoRandom(seed * 2) * 900) + 100}`,
        progress: Math.floor(progressBase),
        avatar: `https://picsum.photos/seed/challenge${seed}/100`
      };
    });

    if (user) {
      // Find average progress for current challenges
      const userProgress = Math.min(99, Math.round(((stats.count / 30) + (stats.hours / 100)) / 2 * 100));
      bots.push({
        id: user.uid,
        name: user.displayName || 'Anda',
        progress: userProgress,
        avatar: user.photoURL || ''
      });
    }

    return bots.sort((a, b) => b.progress - a.progress);
  }, [user, stats, currentWeek]);

  const handleJoinChallenge = (title: string) => {
    toast({
      title: "Sprint Dimulai!",
      description: `Anda telah berkomitmen untuk tantangan "${title}". Semangat!`,
    });
  };

  const handleClaimBadge = (title: string) => {
    toast({
      title: "Badge Diklaim! 🏆",
      description: `Luar biasa! Badge "${title}" telah ditambahkan ke profil Anda.`,
    });
  };

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl pb-32">
      {/* Season Header */}
      <div className="mb-12 text-center relative">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
          <Clock className="h-3 w-3" /> Musim {format(new Date(), 'MMMM', { locale: idLocale })}
        </div>
        <h1 className="font-headline text-5xl font-black tracking-tight mb-2">Weekly Sprint</h1>
        <p className="text-muted-foreground font-medium mb-6">Selesaikan tantangan sebelum musim berakhir untuk mendapatkan Badge Langka.</p>
        
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Berakhir Dalam</p>
            <p className="text-xl font-black text-primary font-mono">{timeLeft}</p>
          </div>
          <div className="h-10 w-px bg-muted" />
          <div className="text-center">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Peserta Aktif</p>
            <p className="text-xl font-black text-primary">2,481</p>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid gap-6 mb-16">
        {CHALLENGES.map(challenge => {
          const progressValue = challenge.id === 'marathon' ? stats.hours : stats.count;
          const progress = Math.min(100, (progressValue / challenge.target) * 100);
          
          return (
            <Card key={challenge.id} className="border-none shadow-2xl rounded-[40px] overflow-hidden group hover:scale-[1.01] transition-transform duration-500">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className={cn("p-6 rounded-[28px] transition-transform duration-500 group-hover:rotate-12", challenge.color)}>
                    <challenge.icon className="h-14 w-14" />
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <div>
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <h3 className="text-2xl font-black tracking-tight">{challenge.title}</h3>
                        {progress === 100 && <CheckCircle2 className="h-5 w-5 text-green-500 fill-current" />}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium max-w-md">{challenge.description}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                        <span>Pencapaian Musim Ini</span>
                        <span>{progressValue} / {challenge.target} {challenge.unit}</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => progress === 100 ? handleClaimBadge(challenge.title) : handleJoinChallenge(challenge.title)}
                    className={cn(
                      "rounded-full px-10 h-14 font-black uppercase text-xs tracking-widest shadow-lg transition-all",
                      progress === 100 ? "bg-green-600 hover:bg-green-700" : "bg-primary"
                    )}
                  >
                    {progress === 100 ? "Claim Badge" : "Join Sprint"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dynamic Leaderboard */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <RefreshCw className="h-6 w-6 text-primary animate-spin-slow" /> Peringkat Sprint Live
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Data diperbarui setiap 10 menit</p>
          </div>
          <Trophy className="h-8 w-8 text-yellow-500 opacity-20" />
        </div>

        <div className="grid gap-3">
          {challengeLeaderboard.map((entry, i) => {
            const isUser = entry.id === user?.uid;
            return (
              <div 
                key={entry.id} 
                className={cn(
                  "flex items-center justify-between p-5 rounded-[28px] transition-all duration-300",
                  isUser ? "bg-primary text-primary-foreground shadow-xl scale-105" : "bg-card border border-muted hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-5">
                  <span className={cn(
                    "font-black text-xl min-w-[30px] text-center",
                    !isUser && "text-muted-foreground/30"
                  )}>{i + 1}</span>
                  <Avatar className="h-12 w-12 border-2 border-white/20">
                    <AvatarImage src={entry.avatar} />
                    <AvatarFallback><Users /></AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-black text-sm tracking-tight">{entry.name} {isUser && "(Anda)"}</p>
                    <p className={cn(
                      "text-[9px] font-bold uppercase tracking-widest",
                      isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {entry.progress > 90 ? 'Elite Scholar' : entry.progress > 70 ? 'Rising Star' : 'Sprint Participant'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-lg font-black">{entry.progress}%</p>
                    <p className={cn(
                      "text-[8px] font-black uppercase opacity-60",
                      isUser ? "text-primary-foreground" : "text-muted-foreground"
                    )}>Completion</p>
                  </div>
                  <ArrowRight className={cn("h-5 w-5", isUser ? "text-white" : "text-muted-foreground/30")} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer / Motivation */}
      <div className="mt-16 p-10 border-4 border-dashed rounded-[48px] bg-muted/20 text-center">
        <Zap className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
        <p className="font-bold text-lg mb-2">Ingat: Tantangan ini bersifat mingguan!</p>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Setiap hari Senin pukul 00:00, seluruh progres sprint akan diatur ulang ke nol dan bot akan mendapatkan profil baru. Pastikan Anda menyelesaikan target Anda sebelum waktu habis.
        </p>
      </div>
    </div>
  );
}

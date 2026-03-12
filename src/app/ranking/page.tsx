'use client';

import { useMemo, useState, useEffect } from 'react';
import { Trophy, Zap, Flame, User, Award, Crown, TrendingUp, Info, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { query, collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';

// Cultural Mapping for Realism (Matches Dashboard Feed)
const REGIONS = [
  { location: 'Jakarta', names: ['Budi', 'Siti', 'Fajar', 'Lestari', 'Andi', 'Dewi', 'Rian', 'Maya', 'Joko', 'Putri'] },
  { location: 'Tokyo', names: ['Yuki', 'Kenji', 'Sakura', 'Hiroshi', 'Aiko', 'Takumi', 'Haruki', 'Hina'] },
  { location: 'Delhi', names: ['Arjun', 'Priya', 'Rohan', 'Ananya', 'Vihaan', 'Isha', 'Aarav', 'Saisha'] },
  { location: 'Cairo', names: ['Ahmed', 'Omar', 'Layla', 'Fatimah', 'Zaid', 'Amira', 'Mustafa', 'Nour'] },
  { location: 'London', names: ['James', 'Oliver', 'Emma', 'Charlotte', 'William', 'Sophie', 'Harry', 'Isla'] },
  { location: 'New York', names: ['Michael', 'David', 'Sarah', 'Emily', 'Jackson', 'Chloe', 'Noah', 'Ava'] },
  { location: 'Seoul', names: ['Min-jun', 'Seo-yeon', 'Ji-hoon', 'Ha-eun', 'Kwang-ho', 'Ji-won', 'Ji-soo'] },
  { location: 'Berlin', names: ['Lukas', 'Max', 'Mia', 'Hanna', 'Leon', 'Sophie', 'Felix', 'Emma'] },
  { location: 'Moscow', names: ['Ivan', 'Dmitry', 'Elena', 'Natasha', 'Sergei', 'Yulia', 'Artem', 'Anna'] },
  { location: 'Paris', names: ['Lucas', 'Isabella', 'Thiago', 'Maria', 'Pierre', 'Camille', 'Enzo', 'Lea'] },
];

const BOT_SURNAMES = ['Scholar', 'Pro', 'Learner', 'Focus', 'Ace', 'Genius', 'Master', 'Champion'];

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateBots = (count: number, currentHour: number) => {
  const bots = [];
  const growthFactor = Math.floor(currentHour % 24); 

  for (let i = 0; i < count; i++) {
    const seed = i + 1;
    const region = REGIONS[Math.floor(pseudoRandom(seed * 1.5) * REGIONS.length)];
    const name = region.names[Math.floor(pseudoRandom(seed * 2.5) * region.names.length)];
    const surname = BOT_SURNAMES[Math.floor(pseudoRandom(seed * 3.5) * BOT_SURNAMES.length)];
    
    const username = `${name}_${surname}${pseudoRandom(seed) > 0.8 ? i : ''}`;
    
    const archetypeRoll = pseudoRandom(seed * 4.5);
    let totalActivities = 0;
    let currentStreak = 0;

    const learningSpeed = pseudoRandom(seed * 5.5) * 0.5; 
    const baselineActivities = Math.floor(growthFactor * learningSpeed);

    if (archetypeRoll > 0.92) { 
      totalActivities = baselineActivities + Math.floor(15 + pseudoRandom(seed) * 20);
      currentStreak = Math.floor(3 + pseudoRandom(seed) * 5);
    } else if (archetypeRoll > 0.6) { 
      totalActivities = baselineActivities + Math.floor(5 + pseudoRandom(seed) * 10);
      currentStreak = Math.floor(1 + pseudoRandom(seed) * 3);
    } else { 
      totalActivities = baselineActivities > 5 ? baselineActivities : 2; 
      currentStreak = 0;
    }

    const level = Math.floor(totalActivities / 10) + 1;

    bots.push({
      id: `bot-${i}`,
      username,
      level,
      totalActivities,
      currentStreak,
      isBot: true,
      photoURL: `https://picsum.photos/seed/bot${i}${name}/100`,
      location: region.location
    });
  }
  return bots;
};

export default function RankingPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [showInfo, setShowInfo] = useState(false);
  const [currentHour, setCurrentHour] = useState(0);

  useEffect(() => {
    setCurrentHour(new Date().getHours());
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 1000 * 60 * 5); 
    return () => clearInterval(interval);
  }, []);

  const logsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'logs'));
  }, [db, user]);

  const { data: logs } = useCollection(logsQuery);

  const userStats = useMemo(() => {
    if (!logs) return { level: 1, totalActivities: 0, currentStreak: 0 };
    const total = logs.length;
    const level = Math.floor(total / 10) + 1;
    
    const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort().reverse();
    let streak = uniqueDates.length > 0 ? 1 : 0;
    
    return { level, totalActivities: total, currentStreak: streak };
  }, [logs]);

  const leaderboard = useMemo(() => {
    const bots = generateBots(200, currentHour);
    const currentUserEntry = user ? {
      id: user.uid,
      username: user.displayName || 'Anda',
      photoURL: user.photoURL || '',
      level: userStats.level,
      totalActivities: userStats.totalActivities,
      currentStreak: userStats.currentStreak,
      isBot: false,
      location: 'Local'
    } : null;

    const allEntries = [...bots];
    if (currentUserEntry) {
      allEntries.push(currentUserEntry);
    }

    return allEntries.sort((a, b) => {
      if (b.totalActivities !== a.totalActivities) return b.totalActivities - a.totalActivities;
      if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
      return b.level - a.level;
    });
  }, [user, userStats, currentHour]);

  const userRank = useMemo(() => {
    if (!user) return null;
    const rank = leaderboard.findIndex(entry => entry.id === user.uid) + 1;
    return rank > 0 ? rank : null;
  }, [leaderboard, user]);

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl pb-32">
      <div className="mb-12 text-center relative">
        <div className="inline-flex p-4 rounded-[28px] bg-primary/10 mb-6 animate-bounce">
          <Trophy className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-headline text-5xl font-black tracking-tight mb-2">Global Scholar</h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest bg-muted px-3 py-1 rounded-full">
            Musim Musim {new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date())}
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black text-primary animate-pulse bg-primary/5 px-3 py-1 rounded-full border border-primary/20">
            <RefreshCw className="h-3 w-3" /> LIVE COMPETITION
          </div>
        </div>
        
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="absolute top-0 right-0 p-3 text-muted-foreground hover:text-primary transition-colors bg-muted/20 rounded-full"
        >
          <Info className="h-6 w-6" />
        </button>

        {showInfo && (
          <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-[32px] text-xs text-left leading-relaxed animate-in fade-in slide-in-from-top-4 shadow-xl">
            <p className="font-black uppercase text-primary mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Sistem Kompetisi Real-Time
            </p>
            Leaderboard ini memetakan progres Anda dibandingkan 200 pejuang dari berbagai belahan dunia. Nama dan lokasi disesuaikan secara regional untuk simulasi yang akurat. Para kompetitor ini (AI) memiliki jadwal belajar mereka sendiri—beberapa belajar di pagi hari (Tokyo), beberapa di malam hari (Jakarta). Konsistensi adalah kunci untuk mempertahankan peringkat Anda!
          </div>
        )}
      </div>

      {userRank !== null && (
        <div className="sticky top-20 z-30 mb-10">
          <Card className="bg-primary text-primary-foreground border-none shadow-[0_10px_40px_rgba(var(--primary),0.3)] rounded-[32px] overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="bg-white/20 h-14 w-14 rounded-2xl flex items-center justify-center font-black text-2xl backdrop-blur-sm border border-white/20">
                  #{userRank}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Peringkat Anda</p>
                  <p className="text-xl font-bold leading-none mt-1">Mengungguli {leaderboard.length - userRank} Scholar</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">LVL</p>
                  <p className="text-xl font-black">{userStats.level}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">POIN</p>
                  <p className="text-xl font-black">{userStats.totalActivities}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4">
        {leaderboard.map((entry, index) => {
          const isTop3 = index < 3;
          const isUser = entry.id === user?.uid;
          const levelProgress = (entry.totalActivities % 10) * 10;

          return (
            <div 
              key={entry.id} 
              className={cn(
                "flex flex-col gap-3 p-5 rounded-[32px] transition-all duration-300",
                isUser ? "bg-primary/10 ring-2 ring-primary/30 shadow-xl scale-[1.02]" : "bg-card hover:bg-muted/50 border border-transparent hover:border-muted"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="min-w-[48px] flex flex-col items-center justify-center">
                  {index === 0 && entry.totalActivities > 0 ? <Crown className="h-6 w-6 text-yellow-500 fill-current drop-shadow" /> :
                   index === 1 && entry.totalActivities > 0 ? <Award className="h-6 w-6 text-slate-400 fill-current" /> :
                   index === 2 && entry.totalActivities > 0 ? <Award className="h-6 w-6 text-amber-700 fill-current" /> : null}
                  <span className={cn(
                    "font-black text-2xl tracking-tighter",
                    isTop3 && entry.totalActivities > 0 ? "text-primary" : "text-muted-foreground/20"
                  )}>{index + 1}</span>
                </div>

                <Avatar className={cn(
                  "h-14 w-14 rounded-2xl border-4 transition-transform",
                  isTop3 && entry.totalActivities > 0 ? "border-primary/20" : "border-muted"
                )}>
                  <AvatarImage src={entry.photoURL} />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn("font-black text-lg tracking-tight truncate", isUser && "text-primary")}>
                      {entry.username}
                    </h3>
                    {entry.isBot && <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-muted text-muted-foreground/60 rounded-full">AI Agent</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500 fill-current" /> {entry.totalActivities} Pts
                    </span>
                    <span className="text-[10px] font-black text-muted-foreground flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500 fill-current" /> {entry.currentStreak} Day
                    </span>
                    <span className="text-[10px] font-black text-primary/60 bg-primary/5 px-2 rounded-full border border-primary/10">
                      LVL {entry.level}
                    </span>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                   <p className="text-2xl font-black leading-none">{entry.totalActivities}</p>
                   <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Scholar Score</p>
                </div>
              </div>

              <div className="px-12 md:px-16">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000",
                      isUser ? "bg-primary" : "bg-primary/30"
                    )} 
                    style={{ width: `${levelProgress || 5}%` }} 
                  />
                </div>
                <div className="flex justify-between mt-1">
                   <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{entry.location}</span>
                   <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{levelProgress}% Mastered</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-20 p-12 rounded-[60px] bg-muted/20 border-4 border-dashed text-center">
        <TrendingUp className="h-12 w-12 mx-auto mb-6 text-primary opacity-30 animate-pulse" />
        <p className="italic text-muted-foreground text-lg font-medium leading-relaxed max-w-2xl mx-auto">
          "Papan peringkat bukan sekadar tentang siapa yang tercepat, <br className="hidden md:block"/>tapi tentang siapa yang paling konsisten menghadapi tantangan setiap hari."
        </p>
      </div>
    </div>
  );
}


'use client';

import { useMemo, useState, useEffect } from 'react';
import { Trophy, Zap, Flame, User, Award, Crown, TrendingUp, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { query, collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';

// Helper to generate deterministic-ish random values for bots
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const BOT_NAMES = [
  'Alex', 'Mira', 'Daniel', 'Hana', 'Kevin', 'Siti', 'Budi', 'Rina', 'Rian', 'Maya',
  'Fajar', 'Lestari', 'Andi', 'Dewi', 'Joko', 'Putri', 'Eko', 'Sari', 'Guntur', 'Intan',
  'Bambang', 'Wati', 'Tono', 'Yanti', 'Heri', 'Ani', 'Dedi', 'Yuni', 'Agus', 'Ina'
];

const BOT_SURNAMES = [
  'Pro', 'Learner', 'Study', 'Focus', 'Grind', 'Master', 'Ace', 'Genius', 'Champ', 'Smart',
  'Active', 'Daily', 'Expert', 'Scholar', 'Warrior', 'Ninja', 'Titan', 'Hero', 'Student'
];

const generateBots = (count: number) => {
  const bots = [];
  for (let i = 0; i < count; i++) {
    const seed = i + 1;
    const nameIndex = Math.floor(pseudoRandom(seed * 1.5) * BOT_NAMES.length);
    const surnameIndex = Math.floor(pseudoRandom(seed * 2.5) * BOT_SURNAMES.length);
    const username = `${BOT_NAMES[nameIndex]}_${BOT_SURNAMES[surnameIndex]}${pseudoRandom(seed) > 0.7 ? i : ''}`;
    
    // Archetype logic to make it not monotonic
    const archetypeRoll = pseudoRandom(seed * 3.5);
    let totalActivities, currentStreak, level;

    if (archetypeRoll > 0.95) { // The Grinder (Top 5%)
      totalActivities = Math.floor(500 + pseudoRandom(seed) * 1000);
      currentStreak = Math.floor(30 + pseudoRandom(seed) * 60);
    } else if (archetypeRoll > 0.7) { // The Consistent (25%)
      totalActivities = Math.floor(150 + pseudoRandom(seed) * 350);
      currentStreak = Math.floor(10 + pseudoRandom(seed) * 25);
    } else if (archetypeRoll > 0.3) { // The Average (40%)
      totalActivities = Math.floor(30 + pseudoRandom(seed) * 120);
      currentStreak = Math.floor(2 + pseudoRandom(seed) * 8);
    } else { // The Newbie / Casual (30%)
      totalActivities = Math.floor(1 + pseudoRandom(seed) * 29);
      currentStreak = Math.floor(0 + pseudoRandom(seed) * 3);
    }

    level = Math.floor(totalActivities / 10) + 1;

    bots.push({
      id: `bot-${i}`,
      username,
      level,
      totalActivities,
      currentStreak,
      isBot: true,
      photoURL: `https://picsum.photos/seed/bot${i}/100`,
    });
  }
  return bots;
};

export default function RankingPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [showInfo, setShowInfo] = useState(false);

  const activitiesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'logs'));
  }, [db, user]);

  const { data: logs } = useCollection(activitiesQuery);

  const userStats = useMemo(() => {
    if (!logs) return { level: 1, totalActivities: 0, currentStreak: 0 };
    const total = logs.length;
    const level = Math.floor(total / 10) + 1;
    
    // Simple streak calculation from logs
    const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort().reverse();
    let streak = 0;
    if (uniqueDates.length > 0) {
      streak = 1; // Basic placeholder for MVP
    }
    
    return { level, totalActivities: total, currentStreak: streak };
  }, [logs]);

  const leaderboard = useMemo(() => {
    const bots = generateBots(200);
    const currentUserEntry = user ? {
      id: user.uid,
      username: user.displayName || 'Anda',
      photoURL: user.photoURL || '',
      level: userStats.level,
      totalActivities: userStats.totalActivities,
      currentStreak: userStats.currentStreak,
      isBot: false
    } : null;

    const allEntries = [...bots];
    if (currentUserEntry) {
      // Find if user is already better than some bots
      allEntries.push(currentUserEntry);
    }

    return allEntries.sort((a, b) => b.totalActivities - a.totalActivities);
  }, [user, userStats]);

  const userRank = useMemo(() => {
    if (!user) return null;
    return leaderboard.findIndex(entry => entry.id === user.uid) + 1;
  }, [leaderboard, user]);

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl pb-32">
      <div className="mb-10 text-center relative">
        <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4 animate-bounce">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-headline text-4xl font-black tracking-tight">Leaderboard Global</h1>
        <p className="text-muted-foreground font-medium mt-2">
          Bersaing dengan {leaderboard.length} pejuang kurikulum lainnya!
        </p>
        
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="absolute top-0 right-0 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Info className="h-5 w-5" />
        </button>

        {showInfo && (
          <div className="mt-4 p-4 bg-muted/50 rounded-2xl text-xs text-left leading-relaxed animate-in fade-in slide-in-from-top-2">
            <p className="font-bold mb-1">Tentang Leaderboard:</p>
            Sistem ini menggabungkan data Anda dengan simulasi progres dari ratusan pejuang kurikulum lainnya. Tujuannya adalah untuk memberikan atmosfer kompetisi yang nyata agar Anda tidak merasa sendirian dalam berjuang mencapai target belajar Anda.
          </div>
        )}
      </div>

      {userRank && (
        <div className="sticky top-20 z-30 mb-8">
          <Card className="bg-primary text-primary-foreground border-none shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 h-10 w-10 rounded-full flex items-center justify-center font-black text-lg">
                  #{userRank}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-80">Posisi Anda</p>
                  <p className="font-bold">Ungguli {leaderboard.length - userRank} pesaing</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-[10px] font-black opacity-80">LVL</p>
                  <p className="font-bold">{userStats.level}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black opacity-80">STREAK</p>
                  <p className="font-bold">{userStats.currentStreak}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-3">
        {leaderboard.map((entry, index) => {
          const isTop3 = index < 3;
          const isUser = entry.id === user?.uid;

          return (
            <div 
              key={entry.id} 
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl transition-all",
                isUser ? "bg-primary/10 ring-1 ring-primary/50" : "bg-card hover:bg-muted/50",
                isTop3 && "py-4"
              )}
            >
              <div className="min-w-[40px] flex flex-col items-center justify-center">
                {index === 0 ? <Crown className="h-5 w-5 text-yellow-500" /> :
                 index === 1 ? <Award className="h-5 w-5 text-slate-400" /> :
                 index === 2 ? <Award className="h-5 w-5 text-amber-700" /> : null}
                <span className={cn(
                  "font-black text-lg",
                  isTop3 ? "text-primary" : "text-muted-foreground/50"
                )}>{index + 1}</span>
              </div>

              <Avatar className={cn(
                "h-10 w-10 md:h-12 md:w-12 border-2",
                isTop3 ? "border-primary" : "border-muted"
              )}>
                <AvatarImage src={entry.photoURL} />
                <AvatarFallback><User /></AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={cn("font-bold text-sm md:text-base truncate", isUser && "text-primary")}>
                    {entry.username}
                  </h3>
                  {entry.isBot && <span className="text-[7px] font-black uppercase px-1 bg-muted text-muted-foreground/60 rounded">AI</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[9px] font-black text-muted-foreground flex items-center gap-0.5">
                    <Zap className="h-2.5 w-2.5 text-amber-500 fill-current" /> {entry.totalActivities}
                  </span>
                  <span className="text-[9px] font-black text-muted-foreground flex items-center gap-0.5">
                    <Flame className="h-2.5 w-2.5 text-orange-500 fill-current" /> {entry.currentStreak}
                  </span>
                  <span className="text-[9px] font-black text-muted-foreground">
                    LVL {entry.level}
                  </span>
                </div>
              </div>

              {isTop3 && (
                <div className="hidden md:block">
                  <div className="bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                    <span className="text-[10px] font-black text-primary italic uppercase tracking-tighter">Elite Member</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-8 rounded-3xl bg-muted/20 border border-dashed text-center">
        <TrendingUp className="h-8 w-8 mx-auto mb-4 text-primary opacity-50" />
        <p className="italic text-muted-foreground text-sm font-medium leading-relaxed">
          "Peringkat hanyalah angka, tapi konsistensi adalah segalanya. <br/>Teruslah belajar, pesaing Anda tidak akan berhenti!"
        </p>
      </div>
    </div>
  );
}

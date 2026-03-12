
'use client';

import { useMemo } from 'react';
import { Trophy, Zap, Flame, User, Award, Crown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { query, collection, orderBy, limit } from 'firebase/firestore';
import { cn } from '@/lib/utils';

// AI Bots for motivation
const AI_BOTS = [
  { id: 'bot1', username: 'Alex Pro', level: 42, totalActivities: 856, currentStreak: 15, isBot: true, photoURL: 'https://picsum.photos/seed/bot1/100' },
  { id: 'bot2', username: 'Mira_Learner', level: 38, totalActivities: 642, currentStreak: 8, isBot: true, photoURL: 'https://picsum.photos/seed/bot2/100' },
  { id: 'bot3', username: 'Daniel.Study', level: 45, totalActivities: 921, currentStreak: 21, isBot: true, photoURL: 'https://picsum.photos/seed/bot3/100' },
  { id: 'bot4', username: 'Hana_Focus', level: 35, totalActivities: 512, currentStreak: 5, isBot: true, photoURL: 'https://picsum.photos/seed/bot4/100' },
  { id: 'bot5', username: 'Ryuk_01', level: 48, totalActivities: 1105, currentStreak: 30, isBot: true, photoURL: 'https://picsum.photos/seed/bot5/100' },
  { id: 'bot6', username: 'Siti.Belajar', level: 32, totalActivities: 420, currentStreak: 3, isBot: true, photoURL: 'https://picsum.photos/seed/bot6/100' },
  { id: 'bot7', username: 'Kevin_Grind', level: 40, totalActivities: 730, currentStreak: 12, isBot: true, photoURL: 'https://picsum.photos/seed/bot7/100' },
];

export default function RankingPage() {
  const { user } = useUser();
  const db = useFirestore();

  // In a real app, you would fetch real users and bots from a global leaderboard collection.
  // For this MVP, we simulate a global leaderboard by mixing current user with bots.
  
  const activitiesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'logs'));
  }, [db, user]);

  const { data: logs } = useCollection(activitiesQuery);

  const userStats = useMemo(() => {
    if (!logs) return { level: 1, totalActivities: 0, currentStreak: 0 };
    const total = logs.length;
    const level = Math.floor(total / 10) + 1;
    // Streak logic (simplified)
    const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort().reverse();
    let streak = 0;
    if (uniqueDates.length > 0) {
      streak = 1; // Basic calculation for MVP
    }
    return { level, totalActivities: total, currentStreak: streak };
  }, [logs]);

  const leaderboard = useMemo(() => {
    const currentUserEntry = user ? {
      id: user.uid,
      username: user.displayName || 'Anda',
      photoURL: user.photoURL || '',
      level: userStats.level,
      totalActivities: userStats.totalActivities,
      currentStreak: userStats.currentStreak,
      isBot: false
    } : null;

    const allEntries = [...AI_BOTS];
    if (currentUserEntry) allEntries.push(currentUserEntry);

    return allEntries.sort((a, b) => b.totalActivities - a.totalActivities);
  }, [user, userStats]);

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl">
      <div className="mb-10 text-center">
        <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4 animate-bounce">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-headline text-4xl font-black tracking-tight">Leaderboard Motivasi</h1>
        <p className="text-muted-foreground font-medium mt-2">
          Anda tidak sendirian. Lihat bagaimana rekan belajar Anda berjuang hari ini!
        </p>
      </div>

      <div className="grid gap-6">
        {leaderboard.map((entry, index) => {
          const isTop3 = index < 3;
          const isUser = entry.id === user?.uid;

          return (
            <Card key={entry.id} className={cn(
              "border-none shadow-sm transition-all hover:scale-[1.01]",
              isUser ? "ring-2 ring-primary bg-primary/5" : "bg-card",
              isTop3 && "shadow-md"
            )}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="flex flex-col items-center justify-center min-w-[40px]">
                    {index === 0 ? <Crown className="h-6 w-6 text-yellow-500 mb-1" /> :
                     index === 1 ? <Crown className="h-5 w-5 text-slate-400 mb-1" /> :
                     index === 2 ? <Crown className="h-5 w-5 text-amber-700 mb-1" /> : null}
                    <span className={cn(
                      "font-black text-xl",
                      isTop3 ? "text-primary" : "text-muted-foreground"
                    )}>#{index + 1}</span>
                  </div>

                  <Avatar className={cn(
                    "h-12 w-12 md:h-16 md:w-16 border-2",
                    isTop3 ? "border-primary" : "border-muted"
                  )}>
                    <AvatarImage src={entry.photoURL} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg md:text-xl truncate">{entry.username}</h3>
                      {entry.isBot && <span className="text-[8px] font-black uppercase px-1 bg-muted text-muted-foreground rounded">AI-BOT</span>}
                      {isUser && <span className="text-[8px] font-black uppercase px-1 bg-primary text-primary-foreground rounded">ANDA</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                        <Award className="h-3 w-3 text-primary" /> LVL {entry.level}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                        <Zap className="h-3 w-3 text-amber-500" /> {entry.totalActivities} Selesai
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                        <Flame className="h-3 w-3 text-orange-500" /> {entry.currentStreak} Streak
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-end">
                    <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Status Hari Ini</div>
                    <div className="flex items-center gap-1 text-green-600 font-black text-xs">
                      <TrendingUp className="h-3 w-3" /> AKTIF
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 p-6 rounded-3xl bg-muted/30 border border-dashed text-center">
        <p className="italic text-muted-foreground font-medium">
          "Di luar sana banyak orang lain yang juga sedang belajar sekarang. Tetaplah konsisten!"
        </p>
      </div>
    </div>
  );
}

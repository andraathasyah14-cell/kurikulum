
'use client';

import { useState, useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Timer, 
  Target, 
  CheckCircle2, 
  Users,
  Award,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { query, collection, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';

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
    icon: Timer,
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

export default function ChallengesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [activeChallengeId, setActiveChallengeId] = useState('sprint');

  const logsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'logs'));
  }, [db, user]);

  const { data: logs } = useCollection(logsQuery);

  const stats = useMemo(() => {
    if (!logs) return { count: 0, hours: 0 };
    return {
      count: logs.length,
      hours: Math.round((logs.length * 25) / 60) // Simple estimation
    };
  }, [logs]);

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl">
      <div className="mb-10 text-center">
        <h1 className="font-headline text-4xl font-black tracking-tight mb-2">Competitive Challenges</h1>
        <p className="text-muted-foreground font-medium">Buktikan konsistensimu dan naikkan peringkatmu.</p>
      </div>

      <div className="grid gap-6 mb-12">
        {CHALLENGES.map(challenge => {
          const progressValue = challenge.id === 'marathon' ? stats.hours : stats.count;
          const progress = Math.min(100, (progressValue / challenge.target) * 100);
          
          return (
            <Card key={challenge.id} className="border-none shadow-xl rounded-[32px] overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className={cn("p-6 rounded-[24px]", challenge.color)}>
                    <challenge.icon className="h-12 w-12" />
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium">{challenge.description}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                        <span>Progress</span>
                        <span>{progressValue} / {challenge.target} {challenge.unit}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                  <Button className="rounded-full px-8 font-black uppercase text-xs" variant={progress === 100 ? "outline" : "default"}>
                    {progress === 100 ? "Completed" : "Join Sprint"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Challenge Leaderboard
          </h2>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Live Ranking</span>
        </div>

        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-[20px] group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <span className="font-black text-lg text-muted-foreground/50 min-w-[20px]">{i + 1}</span>
                <Avatar><AvatarImage src={`https://picsum.photos/seed/${i + 100}/100`} /></Avatar>
                <div>
                  <p className="font-bold text-sm">User_{Math.floor(Math.random() * 1000)}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Sprint Active</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-black">{Math.floor(Math.random() * 50) + 20}%</p>
                  <p className="text-[8px] font-black uppercase opacity-40">Progress</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

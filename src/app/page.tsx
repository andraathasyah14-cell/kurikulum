
'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  LogIn,
  Flame,
  Calendar,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Timer as TimerIcon,
  BookOpen,
  Layers,
  NotebookPen,
  ArrowRight,
  RefreshCw,
  Quote,
  Sparkles,
  Trophy,
  Users,
  Target,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore,
  useAuth 
} from '@/firebase';
import { collection, query, orderBy, serverTimestamp, setDoc, doc, where, deleteDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { format, subDays, eachDayOfInterval, differenceInDays, parseISO, isSameDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const MOTIVATIONAL_QUOTES = [
  "Di luar sana banyak orang lain yang juga sedang belajar sekarang.",
  "Jangan berhenti. Konsistensi kecil setiap hari akan menghasilkan perubahan besar.",
  "Progress kecil tetap progress.",
  "Hari ini adalah kesempatan untuk menjadi lebih baik dari kemarin.",
  "Fokus pada proses, bukan hanya pada hasil akhir.",
  "Setiap detik yang kamu gunakan untuk belajar adalah investasi masa depan.",
  "Kelelahan hari ini adalah kekuatan hari esok."
];

const BOT_NAMES = ['Alex', 'Mira', 'Daniel', 'Hana', 'Kevin', 'Siti', 'Budi', 'Rina', 'Rian', 'Maya', 'Fajar', 'Lestari', 'Andi', 'Dewi'];
const BOT_SUBJECTS = ['Ekonomi', 'Matematika', 'Bahasa Inggris', 'Sejarah', 'Biologi', 'Fisika', 'Kimia', 'Sosiologi', 'Programming'];
const BOT_WATCHLIST = ['Breaking Bad', 'Inception', 'Startup', 'The Crown', 'TED Talks', 'Interstellar'];

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [shortNote, setShortNote] = useState('');
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [runningTimers, setRunningTimers] = useState<Set<string>>(new Set());
  const [randomQuote, setRandomQuote] = useState('');
  const [realityCount, setRealityCount] = useState(0);
  const [companionActivities, setCompanionActivities] = useState<any[]>([]);

  // Reality Reminder logic
  useEffect(() => {
    setRealityCount(Math.floor(Math.random() * 500) + 800);
  }, []);

  // XP & Level Logic (Calculated from Activities & Watchlist)
  // XP = (Completed Activities * 15) + (Total Study Minutes * 0.4) + (Episodes Watched * 10)

  useEffect(() => {
    const generateActivity = () => {
      const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      const type = Math.random();
      let text = '';
      
      if (type > 0.6) {
        text = `sedang belajar ${BOT_SUBJECTS[Math.floor(Math.random() * BOT_SUBJECTS.length)]} (${Math.floor(Math.random() * 3) + 1} jam)`;
      } else if (type > 0.3) {
        text = `menyelesaikan ${Math.floor(Math.random() * 5) + 1} materi hari ini`;
      } else {
        text = `menonton ${Math.floor(Math.random() * 8) + 1} episode ${BOT_WATCHLIST[Math.floor(Math.random() * BOT_WATCHLIST.length)]}`;
      }

      return {
        id: Math.random().toString(),
        name,
        text,
        timestamp: new Date(),
        avatar: `https://picsum.photos/seed/${name}/100`
      };
    };

    setCompanionActivities(Array.from({ length: 4 }, () => generateActivity()));
    const interval = setInterval(() => {
      setCompanionActivities(prev => [generateActivity(), ...prev.slice(0, 3)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setRandomQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  const activitiesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'activities'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const logsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'logs'), orderBy('timestamp', 'desc'));
  }, [db, user]);

  const watchlistQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'watchlist'));
  }, [db, user]);

  const goalsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'goals'));
  }, [db, user]);

  const reflectionQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'reflections'), where('date', '==', today));
  }, [db, user, today]);

  const { data: activities } = useCollection(activitiesQuery);
  const { data: logs } = useCollection(logsQuery);
  const { data: reflections } = useCollection(reflectionQuery);
  const { data: watchlist } = useCollection(watchlistQuery);
  const { data: goals } = useCollection(goalsQuery);

  const currentReflection = reflections?.[0];

  useEffect(() => {
    if (currentReflection) {
      setShortNote(currentReflection.shortNote || '');
    }
  }, [currentReflection]);

  const completedActivityMap = useMemo(() => {
    if (!logs) return new Map<string, string>();
    const map = new Map<string, string>();
    logs.forEach(log => {
      if (log.activityId) map.set(log.activityId, log.id);
    });
    return map;
  }, [logs]);

  const completedActivityIds = useMemo(() => {
    return new Set(completedActivityMap.keys());
  }, [completedActivityMap]);

  // XP Calculation
  const stats = useMemo(() => {
    const activityCount = logs?.length || 0;
    const watchlistEps = watchlist?.reduce((acc, entry) => acc + (entry.lastEpisode || 0), 0) || 0;
    
    // Sum duration of all completed activities
    const activityMap = new Map(activities?.map(a => [a.id, a]) || []);
    const studyMinutes = logs?.reduce((acc, log) => {
      const activity = activityMap.get(log.activityId);
      return acc + (activity?.durationMinutes || 0);
    }, 0) || 0;

    const totalXp = (activityCount * 15) + (studyMinutes * 0.4) + (watchlistEps * 10);
    const level = Math.floor(totalXp / 1000) + 1;
    const currentLevelXp = totalXp % 1000;
    const xpProgress = (currentLevelXp / 1000) * 100;

    return { totalXp, level, currentLevelXp, xpProgress, activityCount, studyMinutes };
  }, [logs, watchlist, activities]);

  const totalMasteryProgress = useMemo(() => {
    if (!activities || activities.length === 0) return 0;
    const currentActivityIds = new Set(activities.map(a => a.id));
    const actuallyCompletedCount = Array.from(completedActivityIds).filter(id => currentActivityIds.has(id)).length;
    return Math.round((actuallyCompletedCount / activities.length) * 100);
  }, [activities, completedActivityIds]);

  const groupedActivities = useMemo(() => {
    if (!activities) return {};
    return activities.reduce((acc, act) => {
      const cat = act.category || 'Materi Umum';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(act);
      return acc;
    }, {} as Record<string, any[]>);
  }, [activities]);

  useEffect(() => {
    if (!user) return;
    const savedTimers = localStorage.getItem(`studypro_timers_${user.uid}`);
    const savedRunning = localStorage.getItem(`studypro_running_${user.uid}`);
    const lastUpdated = localStorage.getItem(`studypro_last_updated_${user.uid}`);

    if (savedTimers) {
      const parsedTimers = JSON.parse(savedTimers);
      const activeIds = savedRunning ? (JSON.parse(savedRunning) as string[]) : [];
      if (activeIds.length > 0 && lastUpdated) {
        const elapsed = Math.floor((Date.now() - parseInt(lastUpdated)) / 1000);
        activeIds.forEach(id => {
          if (parsedTimers[id] !== undefined) parsedTimers[id] = Math.max(0, parsedTimers[id] - elapsed);
        });
        setRunningTimers(new Set(activeIds));
      }
      setTimers(parsedTimers);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`studypro_timers_${user.uid}`, JSON.stringify(timers));
    localStorage.setItem(`studypro_running_${user.uid}`, JSON.stringify(Array.from(runningTimers)));
    localStorage.setItem(`studypro_last_updated_${user.uid}`, Date.now().toString());
  }, [timers, runningTimers, user]);

  const handleToggleMastery = (activity: any) => {
    if (!user || !db) return;
    const isAlreadyCompleted = completedActivityIds.has(activity.id);
    if (isAlreadyCompleted) {
      const logId = completedActivityMap.get(activity.id);
      if (logId) deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'logs', logId));
    } else {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'logs'), {
        activityId: activity.id,
        userId: user.uid,
        date: today,
        difficulty: activity.difficulty || 'Medium',
        timestamp: serverTimestamp(),
      });
      stopTimer(activity.id);
    }
  };

  const handleSaveShortNote = () => {
    if (!user || !db || !shortNote) return;
    const refId = currentReflection?.id || `${user.uid}_${today}`;
    setDoc(doc(db, 'users', user.uid, 'reflections', refId), {
      userId: user.uid,
      date: today,
      shortNote: shortNote,
      timestamp: serverTimestamp(),
    }, { merge: true });
    toast({ title: "Tersimpan", description: "Target harian telah diperbarui." });
  };

  useEffect(() => {
    if (runningTimers.size === 0) return;
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        runningTimers.forEach((id) => {
          if (next[id] > 0) next[id] -= 1;
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [runningTimers]);

  const startTimer = (id: string, initialMinutes: number) => {
    setTimers(prev => ({
      ...prev,
      [id]: prev[id] !== undefined ? prev[id] : initialMinutes * 60
    }));
    setRunningTimers(prev => new Set(prev).add(id));
  };

  const stopTimer = (id: string) => {
    setRunningTimers(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const resetTimer = (id: string, initialMinutes: number) => {
    stopTimer(id);
    setTimers(prev => ({ ...prev, [id]: initialMinutes * 60 }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentStreak = useMemo(() => {
    if (!logs || logs.length === 0) return 0;
    const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort((a, b) => b.localeCompare(a));
    let streak = 0;
    let checkDate = new Date();
    if (uniqueDates.length > 0 && differenceInDays(new Date(), parseISO(uniqueDates[0])) > 1) return 0;
    for (const d of uniqueDates) {
      const logDate = parseISO(d);
      if (isSameDay(checkDate, logDate) || isSameDay(subDays(checkDate, 1), logDate)) {
        streak++;
        checkDate = logDate;
      } else break;
    }
    return streak;
  }, [logs]);

  if (isUserLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!user) return (
    <div className="container px-4 flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="mb-8 rounded-full bg-primary/10 p-8 animate-pulse">
        <BookOpen className="h-16 w-16 text-primary" />
      </div>
      <div className="mb-8 space-y-2 max-w-2xl bg-muted/30 p-8 rounded-3xl border border-dashed shadow-sm">
        <Quote className="h-8 w-8 text-primary/40 mx-auto mb-4" />
        <p className="text-2xl font-black italic text-foreground leading-snug tracking-tight">
          "The only true wisdom is in knowing you know nothing."
        </p>
        <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-4">
          (Satu-satunya kebijaksanaan sejati adalah mengetahui bahwa kamu tidak mengetahui apa-apa)
        </p>
      </div>
      <Button size="lg" className="rounded-full px-10 py-7 text-lg font-black gap-3 shadow-2xl hover:scale-105 transition-transform" onClick={() => initiateGoogleSignIn(auth)}>
        <LogIn className="h-6 w-6" /> Mulai Kurikulum Sekarang
      </Button>
    </div>
  );

  return (
    <div className="container px-4 py-8 md:px-6 max-w-6xl">
      {/* Socrates Opening */}
      <div className="mb-8 flex items-center justify-center text-center">
        <div className="bg-primary/5 px-6 py-4 rounded-3xl border border-primary/10 relative max-w-3xl">
          <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/10 fill-current" />
          <p className="text-sm md:text-base font-bold italic text-primary leading-relaxed">
            "The only true wisdom is in knowing you know nothing."
          </p>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1 font-medium uppercase tracking-tight">
            Satu-satunya kebijaksanaan sejati adalah mengetahui bahwa kamu tidak mengetahui apa-apa
          </p>
        </div>
      </div>

      {/* Reality Reminder */}
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="bg-amber-500/10 p-2 rounded-full">
            <Globe className="h-5 w-5 text-amber-600 animate-spin-slow" />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-amber-700 tracking-tight">Real-Time Reality</p>
            <p className="text-sm font-bold text-amber-900 leading-tight">
              Saat ini ada <span className="text-amber-600">{realityCount}</span> orang di dunia yang sedang belajar topik yang sama. <span className="italic">Tetap lanjut!</span>
            </p>
          </div>
        </div>
      </div>

      {/* XP & Level Hero */}
      <div className="mb-10 grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8 border-none bg-gradient-to-br from-indigo-600 via-primary to-blue-500 text-white shadow-2xl relative overflow-hidden p-8 rounded-[40px]">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12"><Trophy className="h-48 w-48" /></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/20 backdrop-blur-sm">
                Level {stats.level} Scholar
              </span>
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full border border-white/20">
                <Flame className="h-4 w-4 text-orange-400 fill-current" />
                <span className="text-xs font-black">{currentStreak} Day Streak</span>
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter">
              {stats.currentLevelXp} <span className="text-2xl md:text-3xl opacity-60">/ 1000 XP</span>
            </h2>
            <div className="space-y-4 max-w-md">
              <div className="flex justify-between text-xs font-black uppercase opacity-80">
                <span>Next Level</span>
                <span>{Math.round(stats.xpProgress)}%</span>
              </div>
              <div className="h-4 bg-white/20 rounded-full border border-white/10 p-1">
                <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ width: `${stats.xpProgress}%` }} />
              </div>
            </div>
          </div>
        </Card>

        <div className="md:col-span-4 space-y-4">
          <Card className="border-none shadow-sm bg-muted/30 h-full p-6 rounded-[32px]">
            <CardHeader className="p-0 mb-4"><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Active Goals</CardTitle></CardHeader>
            <CardContent className="p-0 space-y-4">
              {goals?.map(goal => {
                const progress = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold truncate">{goal.title}</p>
                      <span className="text-[10px] font-black text-primary">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                );
              })}
              {goals?.length === 0 && (
                <div className="text-center py-10 opacity-40">
                  <Target className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase">Belum ada target</p>
                </div>
              )}
              <Button asChild size="sm" variant="outline" className="w-full rounded-full text-[10px] font-black uppercase tracking-tighter">
                <Link href="/goals">Atur Target Baru</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 space-y-6">
          {Object.entries(groupedActivities).map(([category, items]) => (
            <Card key={category} className="border-none shadow-sm overflow-hidden rounded-[24px]">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" /> {category}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-muted">
                  {items.map(activity => {
                    const isCompleted = completedActivityIds.has(activity.id);
                    const isRunning = runningTimers.has(activity.id);
                    const currentTime = timers[activity.id] !== undefined ? timers[activity.id] : (activity.durationMinutes || 25) * 60;
                    return (
                      <div key={activity.id} className={cn("group flex flex-col p-5 transition-colors", isCompleted ? "bg-green-50/30" : "hover:bg-muted/10")}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <button onClick={() => handleToggleMastery(activity)}>
                              {isCompleted ? <CheckCircle2 className="h-6 w-6 text-green-600" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                            </button>
                            <div className="min-w-0">
                              <p className={cn("font-bold truncate text-foreground", isCompleted && "line-through text-muted-foreground")}>{activity.title}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                                  <TimerIcon className="h-3 w-3" /> {activity.durationMinutes || 25}m
                                </span>
                              </div>
                            </div>
                          </div>
                          {!isCompleted && (
                            <div className="flex items-center gap-2">
                              <div className={cn("text-xs font-black font-mono tabular-nums px-2.5 py-1 rounded-lg", isRunning ? "bg-primary text-primary-foreground animate-pulse" : "bg-muted text-muted-foreground")}>
                                {formatTime(currentTime)}
                              </div>
                              <div className="flex items-center gap-1">
                                {!isRunning ? (
                                  <button onClick={() => startTimer(activity.id, activity.durationMinutes || 25)} className="p-2 rounded-full hover:bg-muted"><Play className="h-4 w-4 fill-current" /></button>
                                ) : (
                                  <button onClick={() => stopTimer(activity.id)} className="p-2 rounded-full hover:bg-muted text-primary"><Pause className="h-4 w-4 fill-current" /></button>
                                )}
                                <button onClick={() => resetTimer(activity.id, activity.durationMinutes || 25)} className="p-2 rounded-full hover:bg-muted text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="md:col-span-4 space-y-6">
          <Card className="border-none bg-muted/30 shadow-sm overflow-hidden rounded-[24px]">
            <CardHeader className="pb-2 bg-primary/5 border-b"><CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Live Study Feed</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-muted">
                {companionActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <Avatar className="h-8 w-8 border-2 border-white"><AvatarImage src={act.avatar} /><AvatarFallback>U</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold leading-tight"><span className="text-primary">{act.name}</span> {act.text}</p>
                      <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Baru saja</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-muted/50 rounded-[24px]">
            <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><NotebookPen className="h-3 w-3" /> Target Harian</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Textarea placeholder="Tulis target spesifikmu hari ini..." className="min-h-[100px] bg-background border-none text-sm rounded-xl" value={shortNote} onChange={(e) => setShortNote(e.target.value)} />
              <Button size="sm" className="w-full rounded-full font-black uppercase text-[10px]" onClick={handleSaveShortNote}>Simpan Target</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

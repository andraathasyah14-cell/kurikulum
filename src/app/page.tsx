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
  Trophy
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

const MOTIVATIONAL_QUOTES = [
  "Di luar sana banyak orang lain yang juga sedang belajar sekarang.",
  "Jangan berhenti. Konsistensi kecil setiap hari akan menghasilkan perubahan besar.",
  "Progress kecil tetap progress.",
  "Hari ini adalah kesempatan untuk menjadi lebih baik dari kemarin.",
  "Fokus pada proses, bukan hanya pada hasil akhir.",
  "Setiap detik yang kamu gunakan untuk belajar adalah investasi masa depan.",
  "Kelelahan hari ini adalah kekuatan hari esok."
];

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

  const reflectionQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'reflections'), where('date', '==', today));
  }, [db, user, today]);

  const { data: activities } = useCollection(activitiesQuery);
  const { data: logs } = useCollection(logsQuery);
  const { data: reflections } = useCollection(reflectionQuery);

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
          if (parsedTimers[id] !== undefined) {
            parsedTimers[id] = Math.max(0, parsedTimers[id] - elapsed);
          }
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
      if (logId) {
        deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'logs', logId));
        toast({ title: "Reset Berhasil", description: `Materi "${activity.title}" dikembalikan ke daftar belajar.` });
      }
    } else {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'logs'), {
        activityId: activity.id,
        userId: user.uid,
        date: today,
        difficulty: activity.difficulty || 'Medium',
        timestamp: serverTimestamp(),
      });
      stopTimer(activity.id);
      toast({ title: "Materi Dikuasai!", description: `Progres "${activity.title}" telah dicatat.` });
    }
  };

  const handleResetCategory = (items: any[]) => {
    if (!user || !db) return;
    items.forEach(item => {
      const logId = completedActivityMap.get(item.id);
      if (logId) {
        deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'logs', logId));
      }
    });
    toast({ title: "Kategori Reset", description: "Seluruh progres dalam kategori ini telah dibersihkan." });
  };

  const handleSaveShortNote = () => {
    if (!user || !db || !shortNote) {
      toast({ variant: "destructive", title: "Error", description: "Tulis catatan singkat terlebih dahulu." });
      return;
    }
    const refId = currentReflection?.id || `${user.uid}_${today}`;
    setDoc(doc(db, 'users', user.uid, 'reflections', refId), {
      userId: user.uid,
      date: today,
      shortNote: shortNote,
      timestamp: serverTimestamp(),
    }, { merge: true });
    toast({ title: "Tersimpan", description: "Target harian telah diperbarui." });
  };

  const heatmapDays = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 90);
    const days = eachDayOfInterval({ start, end });
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const count = logs?.filter(log => log.date === dateStr).length || 0;
      return { date: dateStr, count, rawDate: day };
    });
  }, [logs]);

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
    setTimers(prev => ({
      ...prev,
      [id]: initialMinutes * 60
    }));
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

      <p className="text-lg text-muted-foreground max-w-lg mb-10 font-medium">
        Visualisasikan penguasaan kurikulum belajar Anda secara terstruktur dan terukur.
      </p>
      
      <Button size="lg" className="rounded-full px-10 py-7 text-lg font-black gap-3 shadow-2xl hover:scale-105 transition-transform" onClick={() => initiateGoogleSignIn(auth)}>
        <LogIn className="h-6 w-6" /> Mulai Kurikulum Sekarang
      </Button>
    </div>
  );

  const completedInCategoryCount = (items: any[]) => items.filter(item => completedActivityIds.has(item.id)).length;

  return (
    <div className="container px-4 py-8 md:px-6 max-w-6xl">
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

      <div className="mb-8 bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles className="h-32 w-32" /></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Zap className="h-8 w-8 text-yellow-300 fill-current" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80">Motivasi Hari Ini</p>
              <h2 className="text-xl font-bold leading-tight">{randomQuote}</h2>
            </div>
          </div>
          <Button variant="secondary" asChild className="rounded-full font-black uppercase text-xs">
            <Link href="/ranking">Cek Leaderboard <Trophy className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="font-headline text-4xl font-black tracking-tight text-foreground">Status Kurikulum</h1>
          <p className="text-muted-foreground flex items-center gap-2 font-medium">
            <Calendar className="h-4 w-4" /> {format(new Date(), 'EEEE, d MMMM yyyy', { locale: idLocale })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="rounded-full shadow-sm font-bold uppercase tracking-tight text-xs"><Link href="/watchlist">Watchlist</Link></Button>
          <Button asChild className="rounded-full shadow-md font-bold uppercase tracking-tight text-xs"><Link href="/activities">Kelola Materi</Link></Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-12 border-none bg-muted/20 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              Konsistensi Belajar <TrendingUp className="h-3 w-3 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {heatmapDays.map((d, i) => (
                <button 
                  key={i} 
                  onClick={() => toast({ 
                    title: format(d.rawDate, 'd MMMM yyyy', { locale: idLocale }), 
                    description: `${d.count} materi dikuasai pada hari ini.` 
                  })}
                  className={cn(
                    "h-3 w-3 rounded-sm transition-all hover:ring-2 hover:ring-primary/50 cursor-pointer",
                    d.count === 0 ? "bg-muted" : 
                    d.count < 3 ? "bg-primary/30" : 
                    d.count < 6 ? "bg-primary/60" : "bg-primary"
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-4 space-y-6">
          <Card className="border-none bg-primary text-primary-foreground shadow-lg overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="h-24 w-24" /></div>
             <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase">Total Penguasaan</CardTitle></CardHeader>
             <CardContent>
               <div className="text-6xl font-black mb-4">{totalMasteryProgress}%</div>
               <Progress value={totalMasteryProgress} className="bg-white/20 h-2" />
               <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm font-medium opacity-80">{activities?.filter(a => completedActivityIds.has(a.id)).length || 0} / {activities?.length || 0} materi</p>
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                    <Flame className="h-3 w-3 text-orange-400 fill-current" />
                    <span className="text-xs font-black">{currentStreak} Day Streak</span>
                  </div>
               </div>
             </CardContent>
          </Card>

          <Card className="border-none bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase flex items-center gap-2">
                <NotebookPen className="h-3 w-3" /> Target / Refleksi Harian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Hari ini aku kurang fokus di... besok harus lebih..." 
                className="min-h-[100px] bg-background border-none text-sm leading-relaxed"
                value={shortNote}
                onChange={(e) => setShortNote(e.target.value)}
              />
              <Button size="sm" className="w-full rounded-full gap-2 font-bold uppercase text-xs" onClick={handleSaveShortNote}>
                Simpan Refleksi
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8 space-y-6">
          {Object.entries(groupedActivities).map(([category, items]) => {
            const completedCount = completedInCategoryCount(items);
            const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

            return (
              <Card key={category} className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" /> {category}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="block text-xs font-bold text-muted-foreground uppercase">{completedCount} / {items.length} Dikuasai</span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset Progres Kategori?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Ini akan menghapus seluruh status penguasaan materi dalam kategori "{category}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleResetCategory(items)} className="bg-destructive hover:bg-destructive/90">Reset Semua</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-muted">
                    {items.map(activity => {
                      const isCompleted = completedActivityIds.has(activity.id);
                      const isRunning = runningTimers.has(activity.id);
                      const currentTime = timers[activity.id] !== undefined ? timers[activity.id] : (activity.durationMinutes || 25) * 60;
                      
                      return (
                        <div key={activity.id} className={cn("group flex flex-col p-4 transition-colors", isCompleted ? "bg-green-50/30" : "hover:bg-muted/30")}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <button onClick={() => handleToggleMastery(activity)}>
                                {isCompleted ? (
                                  <CheckCircle2 className="h-6 w-6 text-green-600 hover:text-muted-foreground transition-colors" />
                                ) : (
                                  <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                                )}
                              </button>
                              <div className="min-w-0">
                                <p className={cn("font-bold truncate text-foreground", isCompleted && "line-through text-muted-foreground")}>{activity.title}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className={cn(
                                    "text-[9px] uppercase font-black px-1.5 py-0.5 rounded",
                                    activity.difficulty === 'Hard' ? "bg-red-100 text-red-700" :
                                    activity.difficulty === 'Easy' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                  )}>{activity.difficulty || 'Medium'}</span>
                                  <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                                    <TimerIcon className="h-3 w-3" /> {activity.durationMinutes || 25}m
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {!isCompleted && (
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "text-xs font-bold font-mono tabular-nums px-2 py-0.5 rounded-md",
                                  isRunning ? "bg-primary text-primary-foreground animate-pulse" : "bg-muted text-muted-foreground"
                                )}>
                                  {formatTime(currentTime)}
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {!isRunning ? (
                                    <button onClick={() => startTimer(activity.id, activity.durationMinutes || 25)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                                      <Play className="h-3.5 w-3.5 fill-current" />
                                    </button>
                                  ) : (
                                    <button onClick={() => stopTimer(activity.id)} className="p-1.5 rounded-full hover:bg-muted text-primary transition-colors">
                                      <Pause className="h-3.5 w-3.5 fill-current" />
                                    </button>
                                  )}
                                  <button onClick={() => resetTimer(activity.id, activity.durationMinutes || 25)} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                                    <RotateCcw className="h-3.5 w-3.5" />
                                  </button>
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
            );
          })}
        </div>
      </div>
    </div>
  );
}

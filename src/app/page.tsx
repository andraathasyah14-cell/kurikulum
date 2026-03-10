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
  PenTool,
  Play,
  Pause,
  RotateCcw,
  Timer as TimerIcon,
  BookOpen,
  Layers
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
import { collection, query, orderBy, serverTimestamp, setDoc, doc, where } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { format, subDays, eachDayOfInterval, differenceInDays, parseISO, isSameDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [reflection, setReflection] = useState('');
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [runningTimers, setRunningTimers] = useState<Set<string>>(new Set());

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

  const todayLogs = logs?.filter(log => log.date === today) || [];
  const currentReflection = reflections?.[0];

  // Grouping activities by category (Subject)
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

  const handleToggleComplete = (activity: any) => {
    if (!user || !db) return;
    const isAlreadyCompleted = todayLogs.some(log => log.activityId === activity.id);
    if (!isAlreadyCompleted) {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'logs'), {
        activityId: activity.id,
        userId: user.uid,
        date: today,
        difficulty: activity.difficulty || 'Medium',
        timestamp: serverTimestamp(),
      });
      stopTimer(activity.id);
      toast({ title: "Materi Dikuasai!", description: `Progres materi ${activity.title} telah dicatat.` });
    }
  };

  const handleSaveReflection = () => {
    if (!user || !db || !reflection) return;
    const refId = currentReflection?.id || today;
    setDoc(doc(db, 'users', user.uid, 'reflections', refId), {
      userId: user.uid,
      date: today,
      content: reflection,
      timestamp: serverTimestamp(),
    }, { merge: true });
    toast({ title: "Tersimpan", description: "Catatan belajar hari ini telah disimpan." });
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

  useEffect(() => {
    runningTimers.forEach(id => {
      if (timers[id] === 0) {
        const activity = activities?.find(a => a.id === id);
        if (activity) handleToggleComplete(activity);
      }
    });
  }, [timers, runningTimers, activities]);

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
    <div className="container flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="mb-6 rounded-full bg-primary/10 p-8 animate-pulse"><BookOpen className="h-16 w-16 text-primary" /></div>
      <h1 className="font-headline text-5xl font-black mb-4 tracking-tighter uppercase">StudyPro</h1>
      <p className="text-xl text-muted-foreground max-w-lg mb-8">Mastering materials through structured subject checklists and focused study.</p>
      <Button size="lg" className="rounded-full px-8 gap-2 shadow-xl" onClick={() => initiateGoogleSignIn(auth)}><LogIn className="h-5 w-5" /> Mulai Belajar</Button>
    </div>
  );

  return (
    <div className="container px-4 py-8 md:px-6 max-w-6xl">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="font-headline text-4xl font-black tracking-tight text-foreground">Target Belajar</h1>
          <p className="text-muted-foreground flex items-center gap-2 font-medium">
            <Calendar className="h-4 w-4" /> {format(new Date(), 'EEEE, d MMMM yyyy', { locale: idLocale })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="rounded-full shadow-sm"><Link href="/review">Weekly Review</Link></Button>
          <Button asChild className="rounded-full shadow-md"><Link href="/activities">Kelola Materi</Link></Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Heatmap Section */}
        <Card className="md:col-span-12 border-none bg-muted/20 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              Study Consistency <TrendingUp className="h-3 w-3 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {heatmapDays.map((d, i) => (
                <button 
                  key={i} 
                  onClick={() => toast({ 
                    title: format(d.rawDate, 'd MMMM yyyy', { locale: idLocale }), 
                    description: `${d.count} materi dikuasai hari ini.` 
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
            <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold">
              <span>90 Hari Terakhir</span>
              <div className="flex gap-1 items-center">
                <span>Santai</span>
                <div className="h-2 w-2 bg-muted rounded-sm" />
                <div className="h-2 w-2 bg-primary/30 rounded-sm" />
                <div className="h-2 w-2 bg-primary/60 rounded-sm" />
                <div className="h-2 w-2 bg-primary rounded-sm" />
                <span>Produktif</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Stats */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-none bg-primary text-primary-foreground shadow-lg overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="h-24 w-24" /></div>
             <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase">Progres Hari Ini</CardTitle></CardHeader>
             <CardContent>
               <div className="text-6xl font-black mb-4">{activities?.length ? Math.round((todayLogs.length / activities.length) * 100) : 0}%</div>
               <Progress value={activities?.length ? (todayLogs.length / activities.length) * 100 : 0} className="bg-white/20 h-2" />
               <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm font-medium opacity-80">{todayLogs.length} materi hari ini</p>
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                    <Flame className="h-3 w-3 text-orange-400 fill-current" />
                    <span className="text-xs font-black">{currentStreak} Day Streak</span>
                  </div>
               </div>
             </CardContent>
          </Card>

          <Card className="border-none bg-muted/50">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase flex items-center gap-2"><PenTool className="h-3 w-3" /> Insight Belajar</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {currentReflection ? (
                <p className="text-sm italic font-serif leading-relaxed">"{currentReflection.content}"</p>
              ) : (
                <>
                  <Textarea 
                    placeholder="Apa insight belajarmu hari ini?" 
                    className="min-h-[80px] bg-background border-none text-sm"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                  />
                  <Button size="sm" className="w-full rounded-full" onClick={handleSaveReflection}>Simpan Catatan</Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Grouped Activities List (Subject Hierarchy) */}
        <div className="md:col-span-8 space-y-6">
          {Object.entries(groupedActivities).map(([category, items]) => {
            const completedInCategory = items.filter(item => todayLogs.some(log => log.activityId === item.id)).length;
            const progress = (completedInCategory / items.length) * 100;
            const totalMinutes = items.reduce((sum, act) => sum + (act.durationMinutes || 0), 0);

            return (
              <Card key={category} className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" /> {category}
                    </CardTitle>
                    <div className="text-right">
                      <span className="block text-xs font-bold text-muted-foreground uppercase">{completedInCategory} / {items.length} Materi</span>
                      <span className="text-[10px] text-muted-foreground font-medium">{totalMinutes} menit total</span>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-muted">
                    {items.map(activity => {
                      const isCompleted = todayLogs.some(log => log.activityId === activity.id);
                      const isRunning = runningTimers.has(activity.id);
                      const currentTime = timers[activity.id] !== undefined ? timers[activity.id] : (activity.durationMinutes || 25) * 60;
                      
                      return (
                        <div key={activity.id} className={cn("group flex flex-col p-4 transition-colors", isCompleted ? "bg-green-50/30" : "hover:bg-muted/30")}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <button onClick={() => handleToggleComplete(activity)} disabled={isCompleted}>
                                {isCompleted ? <CheckCircle2 className="h-6 w-6 text-green-600" /> : <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />}
                              </button>
                              <div className="min-w-0">
                                <p className={cn("font-bold truncate text-foreground", isCompleted && "line-through text-muted-foreground")}>{activity.title}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className={cn(
                                    "text-[9px] uppercase font-black px-1.5 py-0.5 rounded",
                                    activity.difficulty === 'Hard' ? "bg-red-100 text-red-700" :
                                    activity.difficulty === 'Easy' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                  )}>
                                    {activity.difficulty || 'Medium'}
                                  </span>
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
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => startTimer(activity.id, activity.durationMinutes || 25)}>
                                      <Play className="h-3.5 w-3.5 fill-current" />
                                    </Button>
                                  ) : (
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-primary" onClick={() => stopTimer(activity.id)}>
                                      <Pause className="h-3.5 w-3.5 fill-current" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground" onClick={() => resetTimer(activity.id, activity.durationMinutes || 25)}>
                                    <RotateCcw className="h-3.5 w-3.5" />
                                  </Button>
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
          {activities?.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed rounded-xl opacity-50">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium text-muted-foreground">Belum ada struktur materi belajar. Buat kategori subjek sekarang!</p>
              <Button asChild className="mt-4 rounded-full"><Link href="/activities">Buat Subjek Baru</Link></Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

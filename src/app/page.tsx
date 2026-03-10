
'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Activity as ActivityIcon,
  LogIn,
  Flame,
  Calendar,
  Zap,
  PenTool,
  Play,
  Pause,
  RotateCcw,
  Timer as TimerIcon
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

  // Timer State: Record of activityId -> remainingSeconds
  const [timers, setTimers] = useState<Record<string, number>>({});
  // Running Timers: Set of activityIds that are currently active
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
      
      // Stop timer if it was running
      stopTimer(activity.id);

      toast({ 
        title: "Selesai!", 
        description: `+${activity.difficulty === 'Hard' ? 3 : activity.difficulty === 'Easy' ? 1 : 2} poin produktivitas.` 
      });
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
    toast({ title: "Tersimpan", description: "Refleksi harian Anda telah dicatat." });
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

  // Global Timer Effect
  useEffect(() => {
    if (runningTimers.size === 0) return;

    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        runningTimers.forEach((id) => {
          if (next[id] > 0) {
            next[id] -= 1;
          } else {
            // Timer hit 0
            const activity = activities?.find(a => a.id === id);
            if (activity) {
              handleToggleComplete(activity);
            }
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [runningTimers, activities, todayLogs]);

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

  // Calculate Streak
  const currentStreak = useMemo(() => {
    if (!logs || logs.length === 0) return 0;
    const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort((a, b) => b.localeCompare(a));
    let streak = 0;
    let checkDate = new Date();
    
    // If the latest log is older than yesterday, streak is 0
    if (uniqueDates.length > 0 && differenceInDays(new Date(), parseISO(uniqueDates[0])) > 1) {
      return 0;
    }

    for (const d of uniqueDates) {
      const logDate = parseISO(d);
      if (isSameDay(checkDate, logDate) || isSameDay(subDays(checkDate, 1), logDate)) {
        streak++;
        checkDate = logDate;
      } else {
        break;
      }
    }
    return streak;
  }, [logs]);

  if (isUserLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!user) return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="mb-6 rounded-full bg-primary/10 p-8 animate-pulse"><TrendingUp className="h-16 w-16 text-primary" /></div>
      <h1 className="font-headline text-5xl font-black mb-4 tracking-tighter uppercase">TrackPro</h1>
      <p className="text-xl text-muted-foreground max-w-lg mb-8">Pelacak aktivitas simpel untuk pertumbuhan personal yang terukur.</p>
      <Button size="lg" className="rounded-full px-8 gap-2 shadow-xl" onClick={() => initiateGoogleSignIn(auth)}><LogIn className="h-5 w-5" /> Masuk dengan Google</Button>
    </div>
  );

  return (
    <div className="container px-4 py-8 md:px-6 max-w-6xl">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="font-headline text-4xl font-black tracking-tight text-foreground">Evolusi Hari Ini</h1>
          <p className="text-muted-foreground flex items-center gap-2 font-medium">
            <Calendar className="h-4 w-4" /> {format(new Date(), 'EEEE, d MMMM yyyy', { locale: idLocale })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="rounded-full shadow-sm"><Link href="/review">Weekly Review</Link></Button>
          <Button asChild className="rounded-full shadow-md"><Link href="/activities">Manage Activities</Link></Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Heatmap Section */}
        <Card className="md:col-span-12 border-none bg-muted/20 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              Activity Heatmap <TrendingUp className="h-3 w-3 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {heatmapDays.map((d, i) => (
                <button 
                  key={i} 
                  onClick={() => toast({ 
                    title: format(d.rawDate, 'd MMMM yyyy', { locale: idLocale }), 
                    description: `${d.count} tugas selesai pada hari ini.` 
                  })}
                  title={`${d.date}: ${d.count} tasks`}
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
              <span>90 Hari Terakhir (Klik kotak untuk detail)</span>
              <div className="flex gap-1 items-center">
                <span>Less</span>
                <div className="h-2 w-2 bg-muted rounded-sm" />
                <div className="h-2 w-2 bg-primary/30 rounded-sm" />
                <div className="h-2 w-2 bg-primary/60 rounded-sm" />
                <div className="h-2 w-2 bg-primary rounded-sm" />
                <span>More</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Column */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-none bg-primary text-primary-foreground shadow-lg overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="h-24 w-24" /></div>
             <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase">Progres Harian</CardTitle></CardHeader>
             <CardContent>
               <div className="text-6xl font-black mb-4">{activities?.length ? Math.round((todayLogs.length / activities.length) * 100) : 0}%</div>
               <Progress value={activities?.length ? (todayLogs.length / activities.length) * 100 : 0} className="bg-white/20 h-2" />
               <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm font-medium opacity-80">{todayLogs.length} dari {activities?.length || 0} tugas</p>
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                    <Flame className="h-3 w-3 text-orange-400 fill-current" />
                    <span className="text-xs font-black">{currentStreak} Day Streak</span>
                  </div>
               </div>
             </CardContent>
          </Card>

          <Card className="border-none bg-muted/50">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase flex items-center gap-2"><PenTool className="h-3 w-3" /> Refleksi</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {currentReflection ? (
                <p className="text-sm italic font-serif leading-relaxed">"{currentReflection.content}"</p>
              ) : (
                <>
                  <Textarea 
                    placeholder="Tulis 1 kalimat pola pikirmu hari ini..." 
                    className="min-h-[80px] bg-background border-none text-sm"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                  />
                  <Button size="sm" className="w-full rounded-full" onClick={handleSaveReflection}>Simpan Refleksi</Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Checklist Column */}
        <Card className="md:col-span-8 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Fokus Hari Ini</span>
              <ActivityIcon className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-muted">
              {activities?.map(activity => {
                const isCompleted = todayLogs.some(log => log.activityId === activity.id);
                const isRunning = runningTimers.has(activity.id);
                const currentTime = timers[activity.id] !== undefined ? timers[activity.id] : (activity.durationMinutes || 25) * 60;
                
                return (
                  <div key={activity.id} className={cn("group flex flex-col p-4 transition-colors", isCompleted ? "bg-green-50/30" : "hover:bg-muted/30")}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <button onClick={() => handleToggleComplete(activity)}>
                          {isCompleted ? <CheckCircle2 className="h-6 w-6 text-green-600" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                        </button>
                        <div className="min-w-0">
                          <p className={cn("font-bold truncate text-foreground", isCompleted && "line-through text-muted-foreground")}>{activity.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                              "text-[10px] uppercase font-black px-1.5 py-0.5 rounded",
                              activity.difficulty === 'Hard' ? "bg-red-100 text-red-700" :
                              activity.difficulty === 'Easy' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                            )}>
                              {activity.difficulty || 'Medium'}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold">
                               <TimerIcon className="h-3 w-3" /> {activity.durationMinutes || 25}m
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {!isCompleted && (
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "text-xl font-black font-mono tabular-nums px-3 py-1 rounded-lg",
                            isRunning ? "bg-primary text-primary-foreground animate-pulse" : "bg-muted text-muted-foreground"
                          )}>
                            {formatTime(currentTime)}
                          </div>
                          <div className="flex items-center gap-1">
                            {!isRunning ? (
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => startTimer(activity.id, activity.durationMinutes || 25)}>
                                <Play className="h-4 w-4 fill-current" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => stopTimer(activity.id)}>
                                <Pause className="h-4 w-4 fill-current" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground" onClick={() => resetTimer(activity.id, activity.durationMinutes || 25)}>
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {activities?.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <p className="text-sm italic">Belum ada aktivitas. Mulai buat rencana produktifmu.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

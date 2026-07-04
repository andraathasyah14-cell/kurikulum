
'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Flame,
  Zap,
  Play,
  Pause,
  Timer as TimerIcon,
  BookOpen,
  Layers,
  Trophy,
  Target,
  Globe,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore,
  useAuth 
} from '@/firebase';
import { collection, query, orderBy, serverTimestamp, setDoc, doc, getDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { format, subDays, addDays, isSameDay, parseISO, startOfDay, getDay, getDate } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const GLOBAL_PEERS = [
  { location: 'Jakarta', names: ['Budi', 'Siti', 'Fajar', 'Lestari'] },
  { location: 'Tokyo', names: ['Yuki', 'Kenji', 'Sakura', 'Hiroshi'] },
  { location: 'Seoul', names: ['Min-jun', 'Seo-yeon', 'Ji-hoon'] },
  { location: 'London', names: ['James', 'Oliver', 'Emma'] },
];

export default function DailyDashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  const [timers, setTimers] = useState<Record<string, number>>({});
  const [runningTimers, setRunningTimers] = useState<Set<string>>(new Set());
  const [worldActivities, setWorldActivities] = useState<any[]>([]);
  const [questionsSolved, setQuestionsSolved] = useState(0);

  const dateRange = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => addDays(new Date(), i - 7));
  }, []);

  useEffect(() => {
    const generateActivity = () => {
      const region = GLOBAL_PEERS[Math.floor(Math.random() * GLOBAL_PEERS.length)];
      const name = region.names[Math.floor(Math.random() * region.names.length)];
      return { 
        id: Math.random().toString(), 
        name, 
        text: `baru saja menyelesaikan materi di ${region.location}`, 
        avatar: `https://picsum.photos/seed/${name}/100` 
      };
    };
    setWorldActivities(Array.from({ length: 3 }, () => generateActivity()));
    const interval = setInterval(() => { setWorldActivities(prev => [generateActivity(), ...prev.slice(0, 2)]); }, 8000);
    return () => clearInterval(interval);
  }, []);

  const activitiesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'activities'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const logsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'logs'), orderBy('timestamp', 'desc'));
  }, [db, user]);

  const scheduleQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'schedules'), orderBy('startTime', 'asc'));
  }, [db, user]);

  const dailyStatsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'dailyStats'));
  }, [db, user]);

  const { data: activities } = useCollection(activitiesQuery);
  const { data: logs } = useCollection(logsQuery);
  const { data: schedules } = useCollection(scheduleQuery);
  const { data: dailyStats } = useCollection(dailyStatsQuery);

  const dayLogs = useMemo(() => logs?.filter(l => l.date === selectedDateStr) || [], [logs, selectedDateStr]);
  const dayStat = useMemo(() => dailyStats?.find(s => s.date === selectedDateStr), [dailyStats, selectedDateStr]);
  
  const daySchedule = useMemo(() => {
    if (!schedules) return [];
    const dayIdx = getDay(selectedDate);
    const dayOfMonth = getDate(selectedDate);
    return schedules.filter(item => {
      if (item.recurrence === 'once') return item.specificDate === selectedDateStr;
      if (item.recurrence === 'daily') return true;
      if (item.recurrence === 'weekly') return item.daysOfWeek?.includes(dayIdx);
      if (item.recurrence === 'monthly') return item.dayOfMonth === dayOfMonth;
      return false;
    });
  }, [schedules, selectedDate, selectedDateStr]);

  const completedActivityIds = useMemo(() => new Set(dayLogs.map(l => l.activityId)), [dayLogs]);

  useEffect(() => {
    setQuestionsSolved(dayStat?.questionsSolved || 0);
  }, [dayStat]);

  const handleUpdateQuestions = (delta: number) => {
    if (!user || !db) return;
    const newVal = Math.max(0, questionsSolved + delta);
    setQuestionsSolved(newVal);
    setDoc(doc(db, 'users', user.uid, 'dailyStats', selectedDateStr), {
      userId: user.uid,
      date: selectedDateStr,
      questionsSolved: newVal,
      timestamp: serverTimestamp()
    }, { merge: true });
  };

  const handleToggleMastery = async (activity: any) => {
    if (!user || !db) return;
    const isAlreadyCompleted = completedActivityIds.has(activity.id);
    
    if (isAlreadyCompleted) {
      const log = dayLogs.find(l => l.activityId === activity.id);
      if (log) deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'logs', log.id));
    } else {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'logs'), {
        activityId: activity.id,
        userId: user.uid,
        date: selectedDateStr,
        timestamp: serverTimestamp(),
      });
      toast({ title: "Materi Selesai!", description: `"${activity.title}" berhasil dicentang.` });
    }
  };

  const handleToggleScheduleStatus = (item: any) => {
    if (!user || !db) return;
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    updateDocumentNonBlocking(doc(db, 'users', user.uid, 'schedules', item.id), {
      status: newStatus
    });
    if (newStatus === 'completed') {
      toast({ title: "Checklist Selesai!", description: `Sesi "${item.title}" ditandai selesai.` });
    }
  };

  const startTimer = (id: string, initialMinutes: number) => {
    setTimers(prev => ({ ...prev, [id]: prev[id] !== undefined ? prev[id] : initialMinutes * 60 }));
    setRunningTimers(prev => new Set(prev).add(id));
  };

  const stopTimer = (id: string) => { setRunningTimers(prev => { const next = new Set(prev); next.delete(id); return next; }); };
  const formatTime = (seconds: number) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m}:${s.toString().padStart(2, '0')}`; };

  useEffect(() => {
    if (runningTimers.size === 0) return;
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        runningTimers.forEach((id) => { if (next[id] > 0) next[id] -= 1; });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [runningTimers]);

  if (isUserLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!user) return (
    <div className="container px-4 flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="mb-8 rounded-full bg-primary/10 p-8 animate-pulse"><BookOpen className="h-16 w-16 text-primary" /></div>
      <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">StudyPro Hub</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">Kelola jadwal, materi, dan progres belajarmu dalam satu alur harian yang cerdas.</p>
      <Button size="lg" className="rounded-full px-10 py-7 text-lg font-black gap-3 shadow-2xl" onClick={() => initiateGoogleSignIn(auth)}>
        Mulai Belajar
      </Button>
    </div>
  );

  return (
    <div className="container px-4 py-6 md:px-6 max-w-5xl pb-32">
      <div className="mb-8 sticky top-16 z-40 bg-background/80 backdrop-blur-md py-2 -mx-4 px-4 border-b">
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {dateRange.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              return (
                <button
                  key={date.toString()}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[60px] h-[80px] rounded-2xl transition-all border",
                    isSelected ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-card hover:bg-muted border-transparent",
                    isToday && !isSelected && "border-primary/30"
                  )}
                >
                  <span className={cn("text-[10px] font-black uppercase tracking-tighter", isSelected ? "text-white/70" : "text-muted-foreground")}>
                    {format(date, 'EEE')}
                  </span>
                  <span className="text-xl font-black">{format(date, 'd')}</span>
                  {isToday && <div className={cn("h-1 w-1 rounded-full mt-1", isSelected ? "bg-white" : "bg-primary")} />}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Timeline Harian
              </h2>
              <Button variant="ghost" size="sm" asChild className="text-[10px] font-black uppercase">
                <Link href="/schedule">Edit Jadwal</Link>
              </Button>
            </div>

            <div className="space-y-4 relative pl-8 border-l-2 border-dashed border-muted ml-4">
              {daySchedule.length > 0 ? daySchedule.map((item) => {
                const isCompleted = item.status === 'completed';
                return (
                  <div key={item.id} className="relative">
                    <div 
                      className={cn(
                        "absolute -left-11 top-4 h-6 w-6 rounded-full bg-background border-2 flex items-center justify-center transition-all",
                        isCompleted ? "border-green-600 bg-green-50" : "border-primary bg-background"
                      )}
                      onClick={() => handleToggleScheduleStatus(item)}
                    >
                      {isCompleted ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <Card 
                      className={cn(
                        "border-none shadow-sm rounded-2xl bg-card hover:shadow-md transition-all cursor-pointer",
                        isCompleted && "bg-muted/30 opacity-60"
                      )}
                      onClick={() => handleToggleScheduleStatus(item)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className={cn("text-[10px] font-black uppercase mb-0.5", isCompleted ? "text-muted-foreground" : "text-primary")}>
                            {item.startTime} - {item.endTime}
                          </p>
                          <p className={cn("font-bold text-sm", isCompleted && "line-through")}>{item.title}</p>
                        </div>
                        <Zap className={cn("h-4 w-4", isCompleted ? "text-green-600 opacity-40" : "text-primary/20")} />
                      </CardContent>
                    </Card>
                  </div>
                );
              }) : (
                <div className="py-12 text-center opacity-30 italic text-sm">Belum ada agenda jam belajar.</div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" /> Checklist Materi
              </h2>
              <Button variant="ghost" size="sm" asChild className="text-[10px] font-black uppercase">
                <Link href="/activities">Lihat Peta</Link>
              </Button>
            </div>

            <div className="grid gap-4">
              {activities?.slice(0, 8).map(activity => {
                const isCompleted = completedActivityIds.has(activity.id);
                const isRunning = runningTimers.has(activity.id);
                const currentTime = timers[activity.id] !== undefined ? timers[activity.id] : (activity.durationMinutes || 25) * 60;
                
                return (
                  <Card key={activity.id} className={cn(
                    "border-none shadow-sm rounded-2xl cursor-pointer hover:bg-muted/50 transition-all",
                    isCompleted ? "bg-muted/30 opacity-60" : "bg-card"
                  )} onClick={() => handleToggleMastery(activity)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {isCompleted ? <CheckCircle2 className="h-6 w-6 text-green-600" /> : <Circle className="h-6 w-6 text-muted-foreground/30" />}
                        <div>
                          <p className={cn("font-bold text-sm", isCompleted && "line-through")}>{activity.title}</p>
                          <p className="text-[9px] font-black uppercase text-muted-foreground">{activity.category}</p>
                        </div>
                      </div>
                      {!isCompleted && (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <span className="font-mono text-[10px] font-black tabular-nums">{formatTime(currentTime)}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => isRunning ? stopTimer(activity.id) : startTimer(activity.id, activity.durationMinutes || 25)}>
                            {isRunning ? <Pause className="h-4 w-4 fill-current text-primary" /> : <Play className="h-4 w-4 fill-current" />}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white rounded-[32px] p-8">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Pencapaian Hari Ini</p>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-5xl font-black">{dayLogs.length * 15 + questionsSolved * 5} <span className="text-xl opacity-60">XP</span></h2>
              <Trophy className="h-12 w-12 opacity-20" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span>Materi Selesai</span>
                <span>{dayLogs.length} Materi</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white" style={{ width: `${Math.min(100, dayLogs.length * 20)}%` }} />
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[32px] p-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-6">
              <TimerIcon className="h-4 w-4" /> Latihan Soal
            </h3>
            <div className="text-center">
               <p className="text-6xl font-black mb-6 tabular-nums">{questionsSolved}</p>
               <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-2" onClick={() => handleUpdateQuestions(-1)}><Minus className="h-7 w-7" /></Button>
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-2" onClick={() => handleUpdateQuestions(1)}><Plus className="h-7 w-7" /></Button>
               </div>
               <p className="text-[10px] font-bold text-muted-foreground mt-4 uppercase tracking-widest">Update jumlah soal yang dikerjakan hari ini</p>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[32px] bg-muted/20 overflow-hidden">
            <div className="bg-primary/5 p-4 border-b flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary animate-spin-slow" /> World Activity
              </span>
            </div>
            <div className="p-4 space-y-4">
              {worldActivities.map(act => (
                <div key={act.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                    <AvatarImage src={act.avatar} />
                  </Avatar>
                  <div>
                    <p className="text-[11px] font-bold leading-tight"><span className="text-primary">{act.name}</span> {act.text}</p>
                    <p className="text-[8px] text-muted-foreground uppercase mt-0.5">Baru Saja</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

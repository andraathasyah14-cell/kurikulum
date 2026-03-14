
'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  LogIn,
  Flame,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Timer as TimerIcon,
  BookOpen,
  Layers,
  NotebookPen,
  Quote,
  Trophy,
  Users,
  Target,
  Globe,
  Sparkles,
  ArrowRight,
  TrendingDown,
  History,
  ChevronRight,
  ChevronLeft,
  FileText,
  Plus,
  Minus,
  Save
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore,
  useAuth 
} from '@/firebase';
import { collection, query, orderBy, serverTimestamp, setDoc, doc, where, getDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { format, subDays, differenceInDays, parseISO, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
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

const BOT_SUBJECTS = ['Ekonomi', 'Matematika', 'Bahasa Inggris', 'Sejarah', 'Biologi', 'Fisika', 'Kimia', 'Sosiologi', 'Programming'];

const GLOBAL_PEERS = [
  { location: 'Jakarta', names: ['Budi', 'Siti', 'Fajar', 'Lestari', 'Andi', 'Dewi', 'Rian', 'Maya'] },
  { location: 'Tokyo', names: ['Yuki', 'Kenji', 'Sakura', 'Hiroshi', 'Aiko', 'Takumi'] },
  { location: 'Delhi', names: ['Arjun', 'Priya', 'Rohan', 'Ananya', 'Vihaan', 'Isha'] },
  { location: 'Cairo', names: ['Ahmed', 'Omar', 'Layla', 'Fatimah', 'Zaid', 'Amira'] },
  { location: 'London', names: ['James', 'Oliver', 'Emma', 'Charlotte', 'William', 'Sophie'] },
  { location: 'New York', names: ['Michael', 'David', 'Sarah', 'Emily', 'Jackson', 'Chloe'] },
  { location: 'Seoul', names: ['Min-jun', 'Seo-yeon', 'Ji-hoon', 'Ha-eun', 'Kwang-ho', 'Ji-won'] },
  { location: 'Berlin', names: ['Lukas', 'Max', 'Mia', 'Hanna', 'Leon', 'Sophie'] },
  { location: 'Moscow', names: ['Ivan', 'Dmitry', 'Elena', 'Natasha', 'Sergei', 'Yulia'] },
  { location: 'Paris', names: ['Lucas', 'Isabella', 'Thiago', 'Maria', 'Pierre', 'Camille'] },
];

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [runningTimers, setRunningTimers] = useState<Set<string>>(new Set());
  const [randomQuote, setRandomQuote] = useState('');
  const [realityCount, setRealityCount] = useState(0);
  const [worldActivities, setWorldActivities] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questionsSolved, setQuestionsSolved] = useState(0);

  useEffect(() => {
    setRealityCount(Math.floor(Math.random() * 500) + 800);
  }, []);

  useEffect(() => {
    const generateActivity = () => {
      const region = GLOBAL_PEERS[Math.floor(Math.random() * GLOBAL_PEERS.length)];
      const name = region.names[Math.floor(Math.random() * region.names.length)];
      const location = region.location;
      const type = Math.random();
      let text = '';
      if (type > 0.6) text = `dari ${location} baru saja menyelesaikan 2 materi di ${BOT_SUBJECTS[Math.floor(Math.random() * BOT_SUBJECTS.length)]}`;
      else if (type > 0.3) text = `dari ${location} menonton 3 episode kurikulum`;
      else text = `dari ${location} memulai topik baru: ${BOT_SUBJECTS[Math.floor(Math.random() * BOT_SUBJECTS.length)]}`;
      return { id: Math.random().toString(), name, text, timestamp: new Date(), avatar: `https://picsum.photos/seed/${name}${location}/100` };
    };
    setWorldActivities(Array.from({ length: 5 }, () => generateActivity()));
    const interval = setInterval(() => { setWorldActivities(prev => [generateActivity(), ...prev.slice(0, 4)]); }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setRandomQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]); }, []);

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

  const dailyStatsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'dailyStats'));
  }, [db, user]);

  const { data: activities } = useCollection(activitiesQuery);
  const { data: logs } = useCollection(logsQuery);
  const { data: watchlist } = useCollection(watchlistQuery);
  const { data: goals } = useCollection(goalsQuery);
  const { data: dailyStats } = useCollection(dailyStatsQuery);

  const todayStat = useMemo(() => {
    if (!dailyStats) return null;
    return dailyStats.find(s => s.date === today);
  }, [dailyStats, today]);

  useEffect(() => {
    if (todayStat) setQuestionsSolved(todayStat.questionsSolved || 0);
  }, [todayStat]);

  const handleUpdateQuestions = (delta: number) => {
    if (!user || !db) return;
    const newVal = Math.max(0, questionsSolved + delta);
    setQuestionsSolved(newVal);
    
    setDoc(doc(db, 'users', user.uid, 'dailyStats', today), {
      userId: user.uid,
      date: today,
      questionsSolved: newVal,
      timestamp: serverTimestamp()
    }, { merge: true });
  };

  const completedActivityMap = useMemo(() => {
    if (!logs) return new Map<string, string>();
    const map = new Map<string, string>();
    logs.forEach(log => { if (log.activityId) map.set(log.activityId, log.id); });
    return map;
  }, [logs]);

  const completedActivityIds = useMemo(() => new Set(completedActivityMap.keys()), [completedActivityMap]);

  const categories = useMemo(() => {
    if (!activities) return [];
    const cats = activities.map(a => a.category).filter(Boolean);
    return Array.from(new Set(cats)).sort();
  }, [activities]);

  const stats = useMemo(() => {
    const activityCount = logs?.length || 0;
    const watchlistEps = watchlist?.reduce((acc, entry) => acc + (entry.lastEpisode || 0), 0) || 0;
    const activityMap = new Map(activities?.map(a => [a.id, a]) || []);
    const studyMinutes = logs?.reduce((acc, log) => {
      const activity = activityMap.get(log.activityId);
      return acc + (activity?.durationMinutes || 0);
    }, 0) || 0;
    const totalXp = (activityCount * 15) + (studyMinutes * 0.4) + (watchlistEps * 10) + (questionsSolved * 5);
    const level = Math.floor(totalXp / 1000) + 1;
    const currentLevelXp = totalXp % 1000;
    const xpProgress = (currentLevelXp / 1000) * 100;
    const uniqueDates = Array.from(new Set(logs?.map(l => l.date) || []));
    const avgMinutesPerDay = uniqueDates.length > 0 ? studyMinutes / uniqueDates.length : 0;
    return { totalXp, level, currentLevelXp, xpProgress, activityCount, studyMinutes, avgMinutesPerDay };
  }, [logs, watchlist, activities, questionsSolved]);

  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    if (!selectedCategory) return activities.slice(0, 15);
    return activities.filter(a => a.category === selectedCategory);
  }, [activities, selectedCategory]);

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

  const handleToggleMastery = async (activity: any) => {
    if (!user || !db) return;
    const isAlreadyCompleted = completedActivityIds.has(activity.id);
    
    if (isAlreadyCompleted) {
      const logId = completedActivityMap.get(activity.id);
      if (logId) {
        deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'logs', logId));
        if (activity.goalId) {
          const goalRef = doc(db, 'users', user.uid, 'goals', activity.goalId);
          const goalSnap = await getDoc(goalRef);
          if (goalSnap.exists()) {
            const goalData = goalSnap.data();
            const delta = goalData.unit === 'Jam' ? activity.durationMinutes / 60 : 1;
            updateDocumentNonBlocking(goalRef, { currentValue: Math.max(0, (goalData.currentValue || 0) - delta) });
          }
        }
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

      if (activity.goalId) {
        const goalRef = doc(db, 'users', user.uid, 'goals', activity.goalId);
        const goalSnap = await getDoc(goalRef);
        if (goalSnap.exists()) {
          const goalData = goalSnap.data();
          const delta = goalData.unit === 'Jam' ? activity.durationMinutes / 60 : 1;
          updateDocumentNonBlocking(goalRef, { currentValue: (goalData.currentValue || 0) + delta });
          toast({ title: "Progres Goal!", description: `+${delta.toFixed(1)} ${goalData.unit} ditambahkan ke "${goalData.title}".` });
        }
      }
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
      <div className="mb-8 space-y-2 max-w-2xl bg-muted/30 p-8 rounded-3xl border border-dashed shadow-sm">
        <Quote className="h-8 w-8 text-primary/40 mx-auto mb-4" />
        <p className="text-2xl font-black italic text-foreground leading-snug tracking-tight">"The only true wisdom is in knowing you know nothing."</p>
        <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-4">(Satu-satunya kebijaksanaan sejati adalah mengetahui bahwa kamu tidak mengetahui apa-apa)</p>
      </div>
      <Button size="lg" className="rounded-full px-10 py-7 text-lg font-black gap-3 shadow-2xl hover:scale-105 transition-transform" onClick={() => initiateGoogleSignIn(auth)}><LogIn className="h-6 w-6" /> Mulai Kurikulum Sekarang</Button>
    </div>
  );

  return (
    <div className="container px-4 py-8 md:px-6 max-w-6xl">
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="bg-amber-500/10 p-2 rounded-full"><Globe className="h-5 w-5 text-amber-600 animate-spin-slow" /></div>
          <div>
            <p className="text-xs font-black uppercase text-amber-700 tracking-tight">World Reality Check</p>
            <p className="text-sm font-bold text-amber-900 leading-tight">Saat ini ada <span className="text-amber-600 font-black">{realityCount}</span> pejuang di dunia yang sedang belajar topik yang sama. <span className="italic">Tetap lanjut!</span></p>
          </div>
        </div>
      </div>

      <div className="mb-10 grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8 border-none bg-gradient-to-br from-indigo-600 via-primary to-blue-500 text-white shadow-2xl relative overflow-hidden p-8 rounded-[40px]">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12"><Trophy className="h-48 w-48" /></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/20 backdrop-blur-sm">Level {stats.level} Scholar</span>
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full border border-white/20"><Flame className="h-4 w-4 text-orange-400 fill-current" /><span className="text-xs font-black">{currentStreak} Day Streak</span></div>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter">{stats.currentLevelXp} <span className="text-2xl md:text-3xl opacity-60">/ 1000 XP</span></h2>
            <div className="space-y-4 max-w-md">
              <div className="flex justify-between text-xs font-black uppercase opacity-80"><span>Mastery Progress</span><span>{Math.round(stats.xpProgress)}%</span></div>
              <div className="h-4 bg-white/20 rounded-full border border-white/10 p-1"><div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${stats.xpProgress}%` }} /></div>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-4 border-none shadow-xl bg-card rounded-[40px] p-8 flex flex-col justify-between">
          <CardHeader className="p-0 mb-4"><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary"><FileText className="h-4 w-4" /> Latihan Soal Hari Ini</CardTitle></CardHeader>
          <div className="text-center">
             <p className="text-5xl font-black text-foreground mb-4 tabular-nums">{questionsSolved}</p>
             <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-2" onClick={() => handleUpdateQuestions(-1)}><Minus className="h-6 w-6" /></Button>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-2" onClick={() => handleUpdateQuestions(1)}><Plus className="h-6 w-6" /></Button>
             </div>
             <p className="text-[10px] font-bold uppercase text-muted-foreground mt-4 tracking-widest">Klik +/- Untuk Update Poin</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 space-y-8">
          <Card className="border-none shadow-xl bg-card rounded-[40px] p-8 flex flex-col">
            <CardHeader className="p-0 mb-6"><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Future Self Projection</CardTitle></CardHeader>
            <div className="flex-1 space-y-6">
              <p className="text-xs font-medium text-muted-foreground leading-relaxed">Jika kamu mempertahankan ritme <span className="text-primary font-black">{Math.round(stats.avgMinutesPerDay)} menit/hari</span> ini:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ProjectionRow label="1 Bulan" value={`${Math.round((stats.avgMinutesPerDay * 30) / 60)} Jam`} />
                <ProjectionRow label="6 Bulan" value={`${Math.round((stats.avgMinutesPerDay * 180) / 60)} Jam`} />
                <ProjectionRow label="1 Tahun" value={`${Math.round((stats.avgMinutesPerDay * 365) / 60)} Jam`} />
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" /> Knowledge Curriculum
              </h2>
              <Button variant="ghost" size="sm" asChild className="text-[10px] font-black uppercase tracking-widest">
                <Link href="/activities">Lihat Peta Lengkap</Link>
              </Button>
            </div>

            <div className="relative px-10">
              <Carousel className="w-full">
                <CarouselContent className="-ml-2">
                  <CarouselItem className="pl-2 basis-auto">
                    <Button 
                      variant={selectedCategory === null ? "default" : "outline"} 
                      size="sm" 
                      className="rounded-full h-8 px-4 font-bold text-[10px] uppercase tracking-widest"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Semua
                    </Button>
                  </CarouselItem>
                  {categories.map((cat) => (
                    <CarouselItem key={cat} className="pl-2 basis-auto">
                      <Button 
                        variant={selectedCategory === cat ? "default" : "outline"} 
                        size="sm" 
                        className="rounded-full h-8 px-4 font-bold text-[10px] uppercase tracking-widest"
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </Button>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-4 h-8 w-8" />
                <CarouselNext className="-right-4 h-8 w-8" />
              </Carousel>
            </div>

            <ScrollArea className="h-[500px] pr-4 rounded-[32px]">
              <div className="space-y-4">
                {filteredActivities.map(activity => {
                  const isCompleted = completedActivityIds.has(activity.id);
                  const isRunning = runningTimers.has(activity.id);
                  const currentTime = timers[activity.id] !== undefined ? timers[activity.id] : (activity.durationMinutes || 25) * 60;
                  return (
                    <Card key={activity.id} className={cn(
                      "border-none shadow-sm transition-all rounded-[24px] cursor-pointer hover:bg-muted/50",
                      isCompleted ? "opacity-50" : "bg-card"
                    )} onClick={() => handleToggleMastery(activity)}>
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="shrink-0">
                            {isCompleted ? (
                              <div className="h-6 w-6 rounded-full bg-green-600 flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              </div>
                            ) : (
                              <Circle className="h-6 w-6 text-muted-foreground opacity-50" />
                            )}
                          </div>
                          <div>
                            <p className={cn("font-bold text-sm", isCompleted && "line-through text-muted-foreground")}>{activity.title}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{activity.category}</p>
                              {activity.goalId && <span className="text-[8px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full flex items-center gap-1"><Target className="h-2 w-2" /> Goal Linked</span>}
                            </div>
                          </div>
                        </div>
                        {!isCompleted && (
                          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                            <span className="font-mono font-black text-[10px] bg-muted px-2 py-1 rounded-lg tabular-nums">{formatTime(currentTime)}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full"
                              onClick={() => isRunning ? stopTimer(activity.id) : startTimer(activity.id, activity.durationMinutes || 25)}
                            >
                              {isRunning ? <Pause className="h-4 w-4 fill-current text-primary" /> : <Play className="h-4 w-4 fill-current text-muted-foreground" />}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {filteredActivities.length === 0 && (
                  <div className="py-20 text-center border-2 border-dashed rounded-[32px] opacity-20">
                    <p className="font-black text-sm uppercase tracking-widest">Tidak ada materi ditemukan</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="md:col-span-4 space-y-6">
          <Card className="border-none bg-muted/30 shadow-sm overflow-hidden rounded-[32px]">
            <CardHeader className="pb-2 bg-primary/5 border-b"><CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Globe className="h-4 w-4 text-primary animate-spin-slow" /> World Activity Feed</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-muted">
                {worldActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <Avatar className="h-8 w-8 border-2 border-white"><AvatarImage src={act.avatar} /></Avatar>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold leading-tight"><span className="text-primary">{act.name}</span> <span className="text-muted-foreground">{act.text}</span></p>
                      <p className="text-[9px] text-muted-foreground font-medium mt-0.5 uppercase tracking-tighter">Baru saja</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-none bg-primary/10 rounded-[32px] p-6 text-center"><Sparkles className="h-8 w-8 text-primary mx-auto mb-3" /><p className="text-sm font-black italic">"{randomQuote}"</p></Card>
        </div>
      </div>
    </div>
  );
}

function ProjectionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-muted pb-2">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <span className="text-sm font-black text-primary">{value}</span>
    </div>
  );
}


'use client';

import { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Activity as ActivityIcon,
  LogIn,
  Flame,
  Calendar,
  Zap,
  Maximize2,
  ChevronRight,
  PenTool,
  X
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
import { format, subDays, isSameDay, parseISO, differenceInDays, eachDayOfInterval, startOfDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [focusTask, setFocusTask] = useState<any | null>(null);
  const [reflection, setReflection] = useState('');

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

  const { data: activities, isLoading: activitiesLoading } = useCollection(activitiesQuery);
  const { data: logs } = useCollection(logsQuery);
  const { data: reflections } = useCollection(reflectionQuery);

  const todayLogs = logs?.filter(log => log.date === today) || [];
  const currentReflection = reflections?.[0];

  const handleToggleComplete = (activity: any) => {
    if (!user || !db) return;
    const isCompleted = todayLogs.some(log => log.activityId === activity.id);
    if (!isCompleted) {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'logs'), {
        activityId: activity.id,
        userId: user.uid,
        date: today,
        difficulty: activity.difficulty || 'Medium',
        timestamp: serverTimestamp(),
      });
      toast({ title: "Selesai!", description: `+${activity.difficulty === 'Hard' ? 3 : activity.difficulty === 'Easy' ? 1 : 2} poin produktivitas.` });
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
      return { date: dateStr, count };
    });
  }, [logs]);

  if (isUserLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!user) return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="mb-6 rounded-full bg-primary/10 p-8 animate-pulse"><TrendingUp className="h-16 w-16 text-primary" /></div>
      <h1 className="font-headline text-5xl font-black mb-4 tracking-tighter">TRACKPRO</h1>
      <p className="text-xl text-muted-foreground max-w-lg mb-8">Pelacak aktivitas tingkat lanjut untuk pertumbuhan personal yang terukur.</p>
      <Button size="lg" className="rounded-full px-8 gap-2 shadow-xl" onClick={() => initiateGoogleSignIn(auth)}><LogIn className="h-5 w-5" /> Masuk dengan Google</Button>
    </div>
  );

  if (focusTask) return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
      <Button variant="ghost" className="absolute top-6 right-6" onClick={() => setFocusTask(null)}><X className="h-8 w-8" /></Button>
      <div className="max-w-2xl w-full space-y-8">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Zap className="h-6 w-6 animate-bounce" />
          <span className="uppercase tracking-widest text-sm font-bold">Focus Mode</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter">{focusTask.title}</h2>
        <p className="text-muted-foreground text-xl">Jangan biarkan distraksi mengganggu Anda. Selesaikan tugas ini sekarang.</p>
        <Button size="lg" className="h-20 w-20 rounded-full shadow-2xl hover:scale-110 transition-transform" onClick={() => { handleToggleComplete(focusTask); setFocusTask(null); }}>
          <CheckCircle2 className="h-10 w-10" />
        </Button>
        <p className="text-sm font-medium animate-pulse">Klik ikon di atas jika selesai</p>
      </div>
    </div>
  );

  return (
    <div className="container px-4 py-8 md:px-6 max-w-6xl">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="font-headline text-4xl font-black tracking-tight">Evolusi Hari Ini</h1>
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
                <div 
                  key={i} 
                  title={`${d.date}: ${d.count} tasks`}
                  className={cn(
                    "h-3 w-3 rounded-sm transition-colors",
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
               <div className="text-6xl font-black mb-4">{Math.round((todayLogs.length / (activities?.length || 1)) * 100)}%</div>
               <Progress value={(todayLogs.length / (activities?.length || 1)) * 100} className="bg-white/20 h-2" />
               <p className="mt-4 text-sm font-medium opacity-80">{todayLogs.length} dari {activities?.length} tugas selesai</p>
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
                return (
                  <div key={activity.id} className={cn("group flex items-center justify-between p-4 transition-colors", isCompleted ? "bg-green-50/30" : "hover:bg-muted/30")}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <button onClick={() => handleToggleComplete(activity)}>
                        {isCompleted ? <CheckCircle2 className="h-6 w-6 text-green-600" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                      </button>
                      <div className="min-w-0">
                        <p className={cn("font-bold truncate", isCompleted && "line-through text-muted-foreground")}>{activity.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            "text-[10px] uppercase font-black px-1.5 py-0.5 rounded",
                            activity.difficulty === 'Hard' ? "bg-red-100 text-red-700" :
                            activity.difficulty === 'Easy' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {activity.difficulty || 'Medium'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!isCompleted && (
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 rounded-full" onClick={() => setFocusTask(activity)}>
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    )}
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

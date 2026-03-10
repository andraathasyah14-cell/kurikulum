
'use client';

import { 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Activity as ActivityIcon,
  ListChecks,
  LogIn,
  Flame,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore,
  useAuth
} from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { format, subDays, isSameDay, parseISO, differenceInDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');

  const activitiesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'activities'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const logsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'logs'),
      orderBy('timestamp', 'desc')
    );
  }, [db, user]);

  const { data: activities, isLoading: activitiesLoading } = useCollection(activitiesQuery);
  const { data: logs } = useCollection(logsQuery);

  const todayLogs = logs?.filter(log => log.date === today) || [];

  const handleToggleComplete = (activityId: string) => {
    if (!user || !db) return;
    
    const isCompleted = todayLogs.some(log => log.activityId === activityId);
    if (!isCompleted) {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'logs'), {
        activityId,
        userId: user.uid,
        date: today,
        value: 1,
        timestamp: serverTimestamp(),
      });
      toast({ title: "Mantap!", description: "Aktivitas telah ditandai selesai." });
    }
  };

  const handleLogin = () => {
    initiateGoogleSignIn(auth, (error) => {
      toast({
        variant: 'destructive',
        title: 'Gagal Masuk',
        description: error.code === 'auth/operation-not-allowed' 
          ? 'Metode login Google belum diaktifkan di Firebase Console.' 
          : error.message,
      });
    });
  };

  // Streak Calculation
  const calculateStreak = () => {
    if (!logs || logs.length === 0) return 0;
    
    const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort((a, b) => b.localeCompare(a));
    let streak = 0;
    let checkDate = new Date();
    
    // Check if user has logged today or yesterday to continue streak
    const lastLogDate = parseISO(uniqueDates[0]);
    const diff = differenceInDays(new Date(), lastLogDate);
    
    if (diff > 1) return 0; // Streak broken

    for (const dateStr of uniqueDates) {
      const logDate = parseISO(dateStr);
      if (isSameDay(checkDate, logDate) || isSameDay(subDays(checkDate, 1), logDate)) {
        streak++;
        checkDate = logDate;
      } else {
        break;
      }
    }
    return streak;
  };

  if (isUserLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="mb-6 rounded-full bg-primary/10 p-8">
          <ListChecks className="h-16 w-16 text-primary" />
        </div>
        <h1 className="font-headline text-4xl font-bold mb-4">Selamat Datang di TrackPro</h1>
        <p className="text-xl text-muted-foreground max-w-lg mb-8">
          Monitor progres belajar, habit, dan project Anda dalam satu tempat yang sederhana dan intuitif.
        </p>
        <Button size="lg" className="gap-2" onClick={handleLogin}>
          <LogIn className="h-5 w-5" /> Mulai Sekarang dengan Google
        </Button>
      </div>
    );
  }

  const totalActivities = activities?.length || 0;
  const completedTodayCount = todayLogs.length;
  const remainingToday = totalActivities - completedTodayCount;
  const progressPercent = totalActivities > 0 ? (completedTodayCount / totalActivities) * 100 : 0;
  const currentStreak = calculateStreak();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const count = logs?.filter(log => log.date === dateStr).length || 0;
    return {
      name: format(d, 'EEE', { locale: idLocale }),
      value: count,
      isToday: dateStr === today
    };
  });

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Halo, {user?.displayName?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {format(new Date(), 'EEEE, d MMMM yyyy', { locale: idLocale })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link href="/stats">
              <TrendingUp className="mr-2 h-4 w-4" /> Progres
            </Link>
          </Button>
          <Button size="sm" asChild className="rounded-full">
            <Link href="/activities">
              <ActivityIcon className="mr-2 h-4 w-4" /> Kelola Task
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Progres Harian Card */}
        <Card className="shadow-sm border-none bg-primary text-primary-foreground md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Target Hari Ini
              <CheckCircle2 className="h-4 w-4 opacity-70" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-bold">{completedTodayCount}</span>
              <span className="text-xl opacity-80">/ {totalActivities} Selesai</span>
            </div>
            <div className="space-y-3">
              <Progress value={progressPercent} className="h-2 bg-white/20" />
              <div className="flex justify-between text-xs font-medium">
                <span>{Math.round(progressPercent)}% Tercapai</span>
                <span>{remainingToday} Tugas Tersisa</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="shadow-sm border-none bg-orange-500 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Streak Konsistensi
              <Flame className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-4">
            <div className="text-6xl font-black mb-1">{currentStreak}</div>
            <p className="text-sm font-bold uppercase tracking-widest">Hari</p>
          </CardContent>
        </Card>

        {/* Remaining Info */}
        <Card className="shadow-sm border-none bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Ringkasan Status
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex justify-between items-center border-b pb-2 border-muted">
              <span className="text-xs text-muted-foreground">Total Task</span>
              <span className="font-bold">{totalActivities}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2 border-muted">
              <span className="text-xs text-muted-foreground">Selesai</span>
              <span className="font-bold text-green-600">{completedTodayCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Belum Selesai</span>
              <span className="font-bold text-orange-600">{remainingToday}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mt-8">
        {/* Weekly Chart */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Perkembangan Pekan Ini</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] w-full pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm text-xs font-bold">
                          {payload[0].value} Task Selesai
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {last7Days.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isToday ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.2)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Checklist Section */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Checklist Hari Ini</CardTitle>
              <Link href="/activities" className="text-xs text-primary font-bold hover:underline">Semua</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-muted max-h-[300px] overflow-auto">
              {activitiesLoading ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="p-4 animate-pulse h-12 bg-muted/20" />)
              ) : activities?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm italic">
                  Belum ada aktivitas.
                </div>
              ) : (
                activities?.map((activity) => {
                  const isCompleted = todayLogs.some(log => log.activityId === activity.id);
                  return (
                    <div 
                      key={activity.id} 
                      className={cn(
                        "flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/30",
                        isCompleted && "bg-green-50/50"
                      )}
                      onClick={() => handleToggleComplete(activity.id)}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <span className={cn("text-sm font-medium truncate", isCompleted && "line-through text-muted-foreground")}>
                        {activity.title}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

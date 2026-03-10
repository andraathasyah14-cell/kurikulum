'use client';

import { 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Activity as ActivityIcon,
  ArrowRight,
  ListChecks
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore 
} from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
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
    }
  };

  const totalActivities = activities?.length || 0;
  const completedToday = todayLogs.length;
  const progressPercent = totalActivities > 0 ? (completedToday / totalActivities) * 100 : 0;

  // Data mingguan dummy untuk dashboard jika logs belum banyak
  const statsData = [
    { name: 'Sen', value: 4 },
    { name: 'Sel', value: 3 },
    { name: 'Rab', value: 5 },
    { name: 'Kam', value: 2 },
    { name: 'Jum', value: 6 },
    { name: 'Sab', value: 7 },
    { name: 'Min', value: completedToday },
  ];

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Halo, {user?.displayName || 'Sahabat Progres'}!</h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: idLocale })}. Waktunya fokus!
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/stats">
              <TrendingUp className="mr-2 h-4 w-4" /> Statistik
            </Link>
          </Button>
          <Button asChild>
            <Link href="/activities">
              <ListChecks className="mr-2 h-4 w-4" /> Checklist
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Ringkasan Hari Ini */}
        <Card className="md:col-span-1 shadow-sm border-primary/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Progres Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{completedToday}/{totalActivities}</div>
            <div className="space-y-2">
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-right text-muted-foreground font-medium">{Math.round(progressPercent)}%</p>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {progressPercent === 100 
                ? 'Luar biasa! Target hari ini tercapai.' 
                : `${totalActivities - completedToday} aktivitas lagi untuk diselesaikan.`}
            </p>
          </CardContent>
        </Card>

        {/* Visual Tracking Singkat */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Performa Pekan Ini
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs h-7">
              <Link href="/stats">Lihat Detail <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="h-[180px] w-full pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
                          {payload[0].value} Selesai
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statsData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 6 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Checklist Cepat Hari Ini */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-headline font-bold flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-primary" /> Checklist Hari Ini
          </h2>
          <Link href="/activities" className="text-sm text-primary hover:underline font-medium">
            Kelola Checklist
          </Link>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activitiesLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse h-20" />
            ))
          ) : activities?.length === 0 ? (
            <Card className="col-span-full py-12 text-center border-dashed">
              <CardContent>
                <p className="text-muted-foreground">Belum ada aktivitas yang dipantau.</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/activities">Mulai Buat Checklist</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            activities?.map((activity) => {
              const isCompleted = todayLogs.some(log => log.activityId === activity.id);
              return (
                <Card 
                  key={activity.id} 
                  className={cn(
                    "cursor-pointer transition-all hover:scale-[1.02] border-l-4",
                    isCompleted 
                      ? "bg-muted/30 border-l-primary opacity-70" 
                      : "hover:shadow-md border-l-transparent"
                  )}
                  onClick={() => handleToggleComplete(activity.id)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                      isCompleted 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : "border-muted-foreground/20 text-muted-foreground/20"
                    )}>
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn("font-medium text-sm truncate", isCompleted && "line-through text-muted-foreground")}>
                        {activity.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                        {activity.category}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

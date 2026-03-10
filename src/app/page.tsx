'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Calendar as CalendarIcon,
  Activity as ActivityIcon
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore 
} from '@/firebase';
import { collection, query, orderBy, serverTimestamp, doc, setDoc } from 'firebase/firestore';
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
    
    const existingLog = todayLogs.find(log => log.activityId === activityId);
    
    if (!existingLog) {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'logs'), {
        activityId,
        userId: user.uid,
        date: today,
        value: 1,
        timestamp: serverTimestamp(),
      });
    }
  };

  const statsData = [
    { name: 'Sen', value: 4 },
    { name: 'Sel', value: 3 },
    { name: 'Rab', value: 5 },
    { name: 'Kam', value: 2 },
    { name: 'Jum', value: 6 },
    { name: 'Sab', value: 7 },
    { name: 'Min', value: 4 },
  ];

  const totalActivities = activities?.length || 0;
  const completedToday = todayLogs.length;
  const progressPercent = totalActivities > 0 ? (completedToday / totalActivities) * 100 : 0;

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Halo, {user?.displayName || 'Pengguna'}!</h1>
          <p className="text-muted-foreground">
            Hari ini adalah {format(new Date(), 'EEEE, d MMMM yyyy', { locale: idLocale })}.
          </p>
        </div>
        <Button asChild>
          <Link href="/activities">
            <Plus className="mr-2 h-4 w-4" /> Tambah Aktivitas
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Ringkasan Hari Ini */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Progres Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{completedToday}/{totalActivities}</div>
            <Progress value={progressPercent} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {progressPercent === 100 ? 'Luar biasa! Semua tugas selesai.' : `${totalActivities - completedToday} aktivitas tersisa.`}
            </p>
          </CardContent>
        </Card>

        {/* Visual Tracking */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Aktivitas Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] w-full pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
                          {payload[0].value} aktivitas
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daftar Aktivitas Cepat */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <ActivityIcon className="h-5 w-5 text-primary" /> Aktivitas Hari Ini
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activitiesLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse h-24" />
            ))
          ) : activities?.length === 0 ? (
            <Card className="col-span-full py-12 text-center">
              <CardContent>
                <p className="text-muted-foreground">Belum ada aktivitas. Mulai buat rencana Anda!</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/activities">Buat Aktivitas Pertama</Link>
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
                    "cursor-pointer transition-all hover:shadow-md",
                    isCompleted && "bg-muted/50 opacity-80"
                  )}
                  onClick={() => handleToggleComplete(activity.id)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2",
                      isCompleted ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground/30"
                    )}>
                      {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className={cn("font-medium truncate", isCompleted && "line-through text-muted-foreground")}>
                        {activity.title}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.category || 'Personal'}
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

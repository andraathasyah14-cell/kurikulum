
'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { query, collection, orderBy, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { TrendingUp, CheckCircle2, AlertCircle, Award, Target, BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function WeeklyReviewPage() {
  const { user } = useUser();
  const db = useFirestore();

  const start = startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 });
  const end = endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 });

  const logsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'logs'), orderBy('timestamp', 'desc'));
  }, [db, user]);

  const activitiesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'activities'));
  }, [db, user]);

  const { data: logs } = useCollection(logsQuery);
  const { data: activities } = useCollection(activitiesQuery);

  const lastWeekLogs = logs?.filter(log => {
    const d = parseISO(log.date);
    return isWithinInterval(d, { start, end });
  }) || [];

  function parseISO(s: string) { return new Date(s); }

  const totalPossible = (activities?.length || 0) * 7;
  const completedCount = lastWeekLogs.length;
  const successRate = totalPossible > 0 ? (completedCount / totalPossible) * 100 : 0;

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl">
      <div className="mb-10 text-center">
        <h1 className="font-headline text-4xl font-black tracking-tight mb-2">Weekly Review</h1>
        <p className="text-muted-foreground font-medium italic">
          {format(start, 'd MMM')} - {format(end, 'd MMM yyyy')}
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none bg-primary text-primary-foreground shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Performa Pekan Lalu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <span className="text-6xl font-black">{Math.round(successRate)}%</span>
              <span className="text-lg opacity-80 mb-2">Penyelesaian</span>
            </div>
            <Progress value={successRate} className="bg-white/20 h-3" />
            <div className="flex justify-between text-xs font-bold uppercase">
              <span>{completedCount} Berhasil</span>
              <span>{totalPossible - completedCount} Terlewat</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Kekuatan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">Anda sangat konsisten di kategori <span className="font-bold">Kerja</span>. Terus pertahankan ritme ini untuk menjaga momentum produktivitas Anda.</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-2"><AlertCircle className="h-4 w-4 text-orange-600" /> Area Peningkatan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">Tugas dengan tingkat <span className="font-bold">Hard</span> sering terlewat. Coba pecah tugas tersebut menjadi beberapa bagian kecil di pekan depan.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Rangkuman Aktivitas</CardTitle>
            <CardDescription>Detail penyelesaian per aktivitas di pekan lalu.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-muted">
               {activities?.map(activity => {
                 const count = lastWeekLogs.filter(l => l.activityId === activity.id).length;
                 return (
                   <div key={activity.id} className="flex items-center justify-between p-4">
                     <div className="flex items-center gap-3">
                       <Target className="h-4 w-4 text-muted-foreground" />
                       <span className="font-medium text-sm">{activity.title}</span>
                     </div>
                     <div className="flex items-center gap-4">
                       <span className="text-xs font-bold px-2 py-0.5 bg-muted rounded-full">{count}/7 Hari</span>
                       <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                         <div className="h-full bg-primary" style={{ width: `${(count/7)*100}%` }} />
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

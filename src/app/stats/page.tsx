'use client';

import { useMemoFirebase, useUser, useCollection, useFirestore } from '@/firebase';
import { query, collection, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { TrendingUp, Calendar, CheckCircle2, Award } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function StatsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const logsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'logs'),
      orderBy('timestamp', 'desc')
    );
  }, [db, user]);

  const { data: logs, isLoading } = useCollection(logsQuery);

  // Proses data untuk grafik mingguan
  const weeklyData = useMemoFirebase(() => {
    if (!logs) return [];
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const count = logs.filter(log => log.date === dayStr).length;
      return {
        name: format(day, 'EEE', { locale: idLocale }),
        fullDate: format(day, 'd MMM', { locale: idLocale }),
        count: count,
      };
    });
  }, [logs]);

  const totalLogs = logs?.length || 0;
  const averagePerDay = logs ? (totalLogs / 7).toFixed(1) : 0;

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold">Statistik & Progres</h1>
        <p className="text-muted-foreground">Analisis konsistensi dan pencapaian Anda.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{totalLogs}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Rata-rata/Hari</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{averagePerDay}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Minggu Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{weeklyData.reduce((acc, curr) => acc + curr.count, 0)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pencapaian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{totalLogs > 50 ? 'Master' : 'Pemula'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Mingguan</CardTitle>
            <CardDescription>Jumlah task yang diselesaikan per hari minggu ini.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md text-sm">
                          <p className="font-medium">{payload[0].payload.fullDate}</p>
                          <p className="text-primary">{payload[0].value} Aktivitas</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.count > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tren Progres</CardTitle>
            <CardDescription>Visualisasi linear performa Anda.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

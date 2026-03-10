
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Calendar, CheckCircle2, Award, Zap, BarChart3 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, parseISO, isSameDay } from 'date-fns';
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

  const weeklyData = useMemoFirebase(() => {
    if (!logs) return [];
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const count = logs.filter(log => log.date === dateStr).length;
      return {
        name: format(day, 'EEE', { locale: idLocale }),
        fullDate: format(day, 'd MMM', { locale: idLocale }),
        count: count,
      };
    });
  }, [logs]);

  const totalLogs = logs?.length || 0;
  const averagePerDay = logs && totalLogs > 0 ? (totalLogs / (logs.length > 30 ? 30 : logs.length)).toFixed(1) : 0;
  
  // Calculate Streak
  const currentStreak = useMemoFirebase(() => {
    if (!logs || logs.length === 0) return 0;
    const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort((a, b) => b.localeCompare(a));
    let streak = 0;
    let checkDate = new Date();
    if (differenceInDays(new Date(), parseISO(uniqueDates[0])) > 1) return 0;
    for (const d of uniqueDates) {
      if (isSameDay(checkDate, parseISO(d)) || isSameDay(subDays(checkDate, 1), parseISO(d))) {
        streak++;
        checkDate = parseISO(d);
      } else break;
    }
    return streak;
  }, [logs]);

  function differenceInDays(d1: Date, d2: Date) {
    const timeDiff = Math.abs(d1.getTime() - d2.getTime());
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  }

  return (
    <div className="container px-4 py-8 md:px-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold">Analisis Performa</h1>
        <p className="text-muted-foreground">Lihat bagaimana perkembangan produktivitas Anda sejauh ini.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="border-none shadow-sm bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-blue-600 uppercase">Total Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-blue-900">{totalLogs}</span>
              <CheckCircle2 className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-orange-600 uppercase">Streak Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-orange-900">{currentStreak}</span>
              <Zap className="h-8 w-8 text-orange-200 fill-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-green-600 uppercase">Efektivitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-green-900">{averagePerDay}</span>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-purple-600 uppercase">Level Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-purple-900">{totalLogs > 100 ? 'Master' : totalLogs > 30 ? 'Pro' : 'Starter'}</span>
              <Award className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Distribusi Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md text-xs font-bold">
                          {payload[0].value} Task
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Tren Konsistensi
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

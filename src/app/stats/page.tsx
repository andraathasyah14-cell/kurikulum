'use client';

import { useMemo, useState } from 'react';
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, Calendar, CheckCircle2, Award, Zap, BarChart3, PieChart as PieChartIcon, Activity, Timer } from 'lucide-react';
import { format, subDays, parseISO, isSameDay, differenceInDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const COLORS = ['hsl(var(--primary))', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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

  const activitiesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'activities'));
  }, [db, user]);

  const { data: logs } = useCollection(logsQuery);
  const { data: activities } = useCollection(activitiesQuery);

  // 1. Weekly Data for Bar/Area Charts
  const weeklyData = useMemo(() => {
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

  // 2. Learning Velocity Calculation
  const velocity = useMemo(() => {
    if (!logs || logs.length === 0) return 0;
    const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const firstLogDate = parseISO(sortedLogs[0].date);
    const today = new Date();
    const daysDiff = Math.max(1, differenceInDays(today, firstLogDate) + 1);
    return (logs.length / daysDiff).toFixed(1);
  }, [logs]);

  // 3. Study Distribution Calculation (by Category)
  const distributionData = useMemo(() => {
    if (!logs || !activities) return [];
    
    const categoryStats: Record<string, { count: number, minutes: number }> = {};
    const activityMap = new Map(activities.map(a => [a.id, { 
      category: a.category || 'Lainnya', 
      minutes: a.durationMinutes || 0 
    }]));

    logs.forEach(log => {
      const info = activityMap.get(log.activityId);
      const category = info?.category || 'Terhapus/Lainnya';
      const minutes = info?.minutes || 0;

      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, minutes: 0 };
      }
      categoryStats[category].count += 1;
      categoryStats[category].minutes += minutes;
    });

    const totalMinutes = Object.values(categoryStats).reduce((sum, s) => sum + s.minutes, 0);

    return Object.entries(categoryStats)
      .map(([name, stats]) => ({ 
        name, 
        value: stats.minutes, // Base the pie slice on minutes
        count: stats.count,
        minutes: stats.minutes,
        percentage: totalMinutes > 0 ? Math.round((stats.minutes / totalMinutes) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [logs, activities]);

  // 4. Streak Calculation
  const currentStreak = useMemo(() => {
    if (!logs || logs.length === 0) return 0;
    const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort((a, b) => b.localeCompare(a));
    let streak = 0;
    let checkDate = new Date();
    
    // Check if the latest log is from today or yesterday
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

  const totalLogs = logs?.length || 0;

  return (
    <div className="container px-4 py-8 md:px-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold">Analisis Performa</h1>
        <p className="text-muted-foreground">Analisis mendalam tentang kecepatan dan distribusi belajar Anda.</p>
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
            <CardTitle className="text-xs font-bold text-green-600 uppercase">Learning Velocity</CardTitle>
            <CardDescription className="text-[10px] text-green-700">Materi / Hari</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-green-900">{velocity}</span>
              <Activity className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-purple-600 uppercase">Status Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-purple-900">{totalLogs > 100 ? 'Master' : totalLogs > 30 ? 'Pro' : 'Starter'}</span>
              <Award className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12 mb-8">
        {/* Study Distribution Pie Chart */}
        <Card className="md:col-span-5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" /> Study Distribution
            </CardTitle>
            <CardDescription>Porsi penguasaan materi per kategori (berdasarkan durasi).</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md text-xs space-y-1">
                            <p className="font-black uppercase text-primary">{data.name}</p>
                            <p className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> {data.count} Materi</p>
                            <p className="flex items-center gap-2"><Timer className="h-3 w-3" /> {data.minutes} Menit</p>
                            <p className="font-bold text-primary mt-1">{data.percentage}% Kontribusi</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm">
                Belum ada data distribusi.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Progress Bar Chart */}
        <Card className="md:col-span-7 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Distribusi Mingguan
            </CardTitle>
            <CardDescription>Jumlah materi yang dikuasai 7 hari terakhir.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
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
                          {payload[0].value} Materi Dikuasai
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
      </div>

      {/* Consistency Area Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Tren Konsistensi
          </CardTitle>
          <CardDescription>Grafik intensitas belajar harian.</CardDescription>
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
  );
}

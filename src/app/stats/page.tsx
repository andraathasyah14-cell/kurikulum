'use client';

import { useMemo } from 'react';
import { useMemoFirebase, useUser, useCollection, useFirestore } from '@/firebase';
import { query, collection, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity, 
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  AlertTriangle,
  Hourglass,
  Info
} from 'lucide-react';
import { format, subDays, parseISO, isSameDay, differenceInDays, isWithinInterval } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // 1. Weekly Data
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

  // 2. Velocity & Acceleration
  const velocityMetrics = useMemo(() => {
    if (!logs || logs.length === 0) return { global: 0, acceleration: 0, trend: 'stable' };
    
    const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const firstLogDate = parseISO(sortedLogs[0].date);
    const today = new Date();
    const daysDiff = Math.max(1, differenceInDays(today, firstLogDate) + 1);
    const globalVelocity = logs.length / daysDiff;

    const now = new Date();
    const last7DaysCount = logs.filter(l => isWithinInterval(parseISO(l.date), { start: subDays(now, 7), end: now })).length;
    const prev7DaysCount = logs.filter(l => isWithinInterval(parseISO(l.date), { start: subDays(now, 14), end: subDays(now, 8) })).length;
    
    const v1 = last7DaysCount / 7;
    const v2 = prev7DaysCount / 7;
    const acceleration = v1 - v2;

    return {
      global: globalVelocity.toFixed(1),
      acceleration: acceleration.toFixed(2),
      trend: acceleration > 0 ? 'up' : acceleration < 0 ? 'down' : 'stable'
    };
  }, [logs]);

  // 3. Distribution
  const distributionMetrics = useMemo(() => {
    if (!logs || !activities) return { data: [], focusRatio: 0, gapIndex: 0 };
    
    const categoryStats: Record<string, { count: number, minutes: number }> = {};
    const activityMap = new Map(activities.map(a => [a.id, { 
      category: a.category || 'Lainnya', 
      minutes: a.durationMinutes || 0 
    }]));

    logs.forEach(log => {
      const info = activityMap.get(log.activityId);
      const category = info?.category || 'Lainnya';
      const minutes = info?.minutes || 0;

      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, minutes: 0 };
      }
      categoryStats[category].count += 1;
      categoryStats[category].minutes += minutes;
    });

    const totalMinutes = Object.values(categoryStats).reduce((sum, s) => sum + s.minutes, 0);
    const totalCount = logs.length;

    const data = Object.entries(categoryStats)
      .map(([name, stats]) => ({ 
        name, 
        value: stats.minutes,
        count: stats.count,
        minutes: stats.minutes,
        percentage: totalMinutes > 0 ? Math.round((stats.minutes / totalMinutes) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);

    const maxCategoryCount = data.length > 0 ? Math.max(...data.map(d => d.count)) : 0;
    const focusRatio = totalCount > 0 ? Math.round((maxCategoryCount / totalCount) * 100) : 0;
    const gapIndex = data.length > 1 ? Math.max(...data.map(d => d.count)) - Math.min(...data.map(d => d.count)) : 0;

    return { data, focusRatio, gapIndex };
  }, [logs, activities]);

  // 4. Prediction
  const predictionMetrics = useMemo(() => {
    const totalActivities = activities?.length || 0;
    const totalCompleted = logs?.length || 0;
    const remaining = totalActivities - totalCompleted;
    const abandonRate = totalActivities > 0 ? Math.round((remaining / totalActivities) * 100) : 0;
    
    const velocity = parseFloat(velocityMetrics.global);
    const predictedDays = (velocity > 0 && remaining > 0) ? Math.ceil(remaining / velocity) : null;

    return { abandonRate, remaining, predictedDays };
  }, [activities, logs, velocityMetrics]);

  // 5. Streak
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

  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 ml-1.5 cursor-help opacity-50 hover:opacity-100 transition-opacity" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px] text-xs leading-relaxed p-3">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="container px-4 py-8 md:px-6 max-w-6xl pb-24">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold">Analisis Performa</h1>
        <p className="text-muted-foreground">Statistik mendalam tentang percepatan, fokus, dan prediksi belajar Anda.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="border-none shadow-sm bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-blue-600 uppercase flex items-center">
              Total Selesai
              <InfoTooltip content="Total kumulatif materi yang telah Anda kuasai. Semakin besar angka ini, semakin dekat Anda dengan penguasaan kurikulum penuh." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-blue-900">{logs?.length || 0}</span>
              <CheckCircle2 className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-orange-600 uppercase flex items-center">
              Streak Harian
              <InfoTooltip content="Jumlah hari berturut-turut Anda menyelesaikan minimal satu materi. Menjaga angka di atas 3 hari sangat bagus untuk membangun kebiasaan." />
            </CardTitle>
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
            <CardTitle className="text-xs font-bold text-green-600 uppercase flex items-center">
              Velocity
              <InfoTooltip content="Rata-rata materi yang diselesaikan per hari. Angka di atas 1.0 menunjukkan kemajuan harian yang stabil dan produktif." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-green-900">{velocityMetrics.global}</span>
              <Activity className="h-8 w-8 text-green-200" />
            </div>
            <p className="text-[10px] font-bold text-green-700 mt-1 uppercase tracking-tighter">Materi / Hari</p>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-none shadow-sm",
          velocityMetrics.trend === 'up' ? "bg-emerald-50" : velocityMetrics.trend === 'down' ? "bg-rose-50" : "bg-slate-50"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className={cn(
              "text-xs font-bold uppercase flex items-center",
              velocityMetrics.trend === 'up' ? "text-emerald-600" : velocityMetrics.trend === 'down' ? "text-rose-600" : "text-slate-600"
            )}>
              Acceleration
              <InfoTooltip content="Perubahan kecepatan belajar dibandingkan minggu sebelumnya. Angka positif (+) berarti ritme Anda sedang meningkat." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-3xl font-black",
                velocityMetrics.trend === 'up' ? "text-emerald-900" : velocityMetrics.trend === 'down' ? "text-rose-900" : "text-slate-900"
              )}>
                {velocityMetrics.acceleration > 0 ? `+${velocityMetrics.acceleration}` : velocityMetrics.acceleration}
              </span>
              {velocityMetrics.trend === 'up' ? <ArrowUpRight className="h-8 w-8 text-emerald-200" /> : <ArrowDownRight className="h-8 w-8 text-rose-200" />}
            </div>
            <p className="text-[10px] font-bold opacity-70 mt-1 uppercase tracking-tighter">Perubahan Ritme</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12 mb-8">
        <Card className="md:col-span-5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" /> 
              Study Distribution
              <InfoTooltip content="Distribusi waktu belajar Anda berdasarkan menit. Idealnya, subjek prioritas Anda harus memiliki porsi 40-60%." />
            </CardTitle>
            <CardDescription>Porsi waktu belajar per kategori.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {distributionMetrics.data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionMetrics.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percentage, x, y, cx }) => (
                      <text x={x} y={y} fill="hsl(var(--muted-foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[9px] font-bold">
                        {`${name} (${percentage}%)`}
                      </text>
                    )}
                  >
                    {distributionMetrics.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md text-xs space-y-1">
                            <p className="font-black uppercase text-primary">{data.name}</p>
                            <p className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> {data.count} Materi</p>
                            <p className="flex items-center gap-2"><Timer className="h-3 w-3" /> {data.minutes} Menit</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm">Belum ada data.</div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-7 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> 
              Progress Mingguan
              <InfoTooltip content="Visualisasi jumlah materi harian. Grafik yang rata atau menanjak menunjukkan konsistensi belajar yang sehat." />
            </CardTitle>
            <CardDescription>Materi yang dikuasai 7 hari terakhir.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} content={({ active, payload }) => (
                  active && payload && payload.length ? (
                    <div className="rounded-lg border bg-background p-2 shadow-md text-xs font-bold">
                      {payload[0].value} Materi
                    </div>
                  ) : null
                )} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="shadow-sm border-none bg-indigo-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center text-indigo-700">
              <Target className="h-4 w-4 mr-2" /> Focus Ratio
              <InfoTooltip content="Persentase dominasi subjek utama. Nilai 40-60% menandakan Anda fokus pada target utama tanpa mengabaikan subjek lain." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-indigo-900">{distributionMetrics.focusRatio}%</div>
            <p className="text-[10px] text-indigo-600 font-medium mt-1">Konsentrasi pada kategori utama.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center text-amber-700">
              <AlertTriangle className="h-4 w-4 mr-2" /> Learning Gap Index
              <InfoTooltip content="Selisih penguasaan antar subjek terpopuler. Angka di bawah 10 menunjukkan Anda belajar secara seimbang antar kategori." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-900">{distributionMetrics.gapIndex}</div>
            <p className="text-[10px] text-amber-600 font-medium mt-1">Kesenjangan antar kategori subjek.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center text-slate-700">
              <Hourglass className="h-4 w-4 mr-2" /> Abandon Rate
              <InfoTooltip content="Persentase materi dalam kurikulum yang belum pernah Anda sentuh. Targetkan untuk menurunkan angka ini setiap minggu." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{predictionMetrics.abandonRate}%</div>
            <p className="text-[10px] text-slate-600 font-medium mt-1">Materi di kurikulum yang belum disentuh.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-none bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hourglass className="h-5 w-5" /> 
            Prediksi Penyelesaian Kurikulum
            <InfoTooltip content="Estimasi hari tersisa hingga seluruh kurikulum selesai dikuasai, berdasarkan rata-rata kecepatan belajar Anda saat ini." />
          </CardTitle>
          <CardDescription className="text-primary-foreground/70">Estimasi berdasarkan ritme belajar Anda saat ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="text-5xl font-black">{predictionMetrics.predictedDays || '--'}</div>
              <div className="text-sm font-bold uppercase tracking-widest opacity-80">Hari Lagi</div>
            </div>
            <div className="flex-1 w-full max-w-md space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase">
                <span>Materi Sisa: {predictionMetrics.remaining}</span>
                <span>Velocity: {velocityMetrics.global}/hari</span>
              </div>
              <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white animate-pulse" style={{ width: `${100 - predictionMetrics.abandonRate}%` }} />
              </div>
              <p className="text-[10px] italic opacity-70">
                *Prediksi ini akurat jika ritme belajar Anda konsisten dengan rata-rata keseluruhan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

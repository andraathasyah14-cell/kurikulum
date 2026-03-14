
'use client';

import { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  FileText, 
  ChevronRight,
  BookOpen,
  Trophy,
  Zap,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore 
} from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format, isSameDay, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CalendarPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const logsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'logs'), orderBy('timestamp', 'desc'));
  }, [db, user]);

  const dailyStatsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'dailyStats'));
  }, [db, user]);

  const activitiesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'activities'));
  }, [db, user]);

  const { data: logs } = useCollection(logsQuery);
  const { data: dailyStats } = useCollection(dailyStatsQuery);
  const { data: activities } = useCollection(activitiesQuery);

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const dayLogs = useMemo(() => {
    if (!logs || !selectedDateStr) return [];
    return logs.filter(log => log.date === selectedDateStr);
  }, [logs, selectedDateStr]);

  const dayStat = useMemo(() => {
    if (!dailyStats || !selectedDateStr) return null;
    return dailyStats.find(s => s.date === selectedDateStr);
  }, [dailyStats, selectedDateStr]);

  const completedActivities = useMemo(() => {
    if (!dayLogs || !activities) return [];
    const activityMap = new Map(activities.map(a => [a.id, a]));
    return dayLogs.map(log => activityMap.get(log.activityId)).filter(Boolean);
  }, [dayLogs, activities]);

  // Dots for calendar to show activity
  const modifiers = {
    hasActivity: (date: Date) => {
      const dStr = format(date, 'yyyy-MM-dd');
      return logs?.some(log => log.date === dStr) || dailyStats?.some(s => s.date === dStr && s.questionsSolved > 0);
    }
  } as any;

  const modifiersStyles = {
    hasActivity: {
      fontWeight: 'bold',
      textDecoration: 'underline',
      color: 'hsl(var(--primary))'
    }
  };

  return (
    <div className="container px-4 py-8 md:px-6 max-w-5xl pb-32">
      <div className="mb-10">
        <h1 className="font-headline text-5xl font-black tracking-tight mb-2">Riwayat Belajar</h1>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" /> Pantau Konsistensi Anda Pertanggal
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-card sticky top-24">
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-none w-full"
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                locale={idLocale}
              />
              <div className="mt-6 p-4 bg-primary/5 rounded-2xl flex items-center gap-3">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <p className="text-[10px] font-medium leading-relaxed text-muted-foreground">
                  Tanggal dengan <span className="text-primary font-bold">garis bawah</span> menunjukkan hari di mana Anda memiliki aktivitas belajar atau mengerjakan soal.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-4">
             <h2 className="text-xl font-black uppercase tracking-tighter">
               Detail: {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: idLocale }) : 'Pilih Tanggal'}
             </h2>
             <Zap className="h-5 w-5 text-primary animate-pulse" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-lg bg-indigo-50/50 rounded-[28px]">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <p className="text-3xl font-black text-indigo-900">{dayStat?.questionsSolved || 0}</p>
                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Soal Dikerjakan</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg bg-emerald-50/50 rounded-[28px]">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-3xl font-black text-emerald-900">{completedActivities.length}</p>
                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Materi Selesai</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-card">
            <CardHeader className="bg-primary/5 border-b p-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Daftar Materi Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {completedActivities.length > 0 ? (
                  <div className="divide-y divide-muted">
                    {completedActivities.map((act: any, i) => (
                      <div key={`${act.id}-${i}`} className="p-5 flex items-center justify-between group hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm tracking-tight">{act.title}</p>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{act.category}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center opacity-30">
                    <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-black text-sm uppercase tracking-widest">Tidak ada materi yang selesai</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

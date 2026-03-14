
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
  Info,
  CalendarDays
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore 
} from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { format, isSameDay, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { buttonVariants } from '@/components/ui/button';

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

  // Modifiers for highlights
  const modifiers = {
    hasActivity: (date: Date) => {
      const dStr = format(date, 'yyyy-MM-dd');
      return logs?.some(log => log.date === dStr) || dailyStats?.some(s => s.date === dStr && s.questionsSolved > 0);
    }
  } as any;

  const modifiersStyles = {
    hasActivity: {
      fontWeight: '900',
      textDecoration: 'underline',
      textDecorationThickness: '2px',
      color: 'hsl(var(--primary))'
    }
  };

  return (
    <div className="container px-4 py-8 md:px-6 max-w-3xl pb-32">
      <div className="mb-10 text-center">
        <h1 className="font-headline text-5xl font-black tracking-tight mb-2">Riwayat Belajar</h1>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" /> Pantau Konsistensi Anda Pertanggal
        </p>
      </div>

      <div className="space-y-8">
        {/* Calendar Section - Fixed Grid Layout */}
        <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-card border-t-8 border-primary">
          <CardContent className="p-8 flex flex-col items-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border-none w-full max-w-sm"
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              locale={idLocale}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full justify-center",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-sm font-black uppercase tracking-widest",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex justify-between",
                head_cell: "text-muted-foreground rounded-md w-9 font-black text-[0.7rem] uppercase text-center",
                row: "flex w-full mt-2 justify-between",
                cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-9 w-9 p-0 font-bold rounded-xl transition-all"
                ),
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-lg scale-110",
                day_today: "bg-muted text-foreground ring-2 ring-primary/20",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
            
            <div className="mt-8 w-full p-5 bg-primary/5 rounded-[28px] flex items-center gap-4 border border-primary/10">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Info className="h-5 w-5 text-primary shrink-0" />
              </div>
              <p className="text-[11px] font-bold leading-relaxed text-muted-foreground">
                Tanggal dengan <span className="text-primary font-black underline decoration-2">garis bawah</span> menunjukkan hari di mana Anda sangat produktif menguasai materi atau mengerjakan soal.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Details Section */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between px-6">
             <h2 className="text-2xl font-black uppercase tracking-tighter">
               Laporan: {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: idLocale }) : 'Pilih Tanggal'}
             </h2>
             <div className="flex items-center gap-2">
               <CalendarDays className="h-5 w-5 text-primary" />
               <Zap className="h-5 w-5 text-primary fill-current" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-2">
            <Card className="border-none shadow-xl bg-indigo-600 text-white rounded-[32px] overflow-hidden">
              <CardContent className="p-6 text-center relative">
                <FileText className="h-16 w-16 absolute -bottom-4 -right-4 opacity-10 rotate-12" />
                <p className="text-4xl font-black mb-1">{dayStat?.questionsSolved || 0}</p>
                <p className="text-[10px] font-black uppercase opacity-80 tracking-widest">Soal Dikerjakan</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl bg-emerald-600 text-white rounded-[32px] overflow-hidden">
              <CardContent className="p-6 text-center relative">
                <CheckCircle2 className="h-16 w-16 absolute -bottom-4 -right-4 opacity-10 -rotate-12" />
                <p className="text-4xl font-black mb-1">{completedActivities.length}</p>
                <p className="text-[10px] font-black uppercase opacity-80 tracking-widest">Materi Selesai</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 border-b p-8">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" /> Daftar Capaian Materi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                {completedActivities.length > 0 ? (
                  <div className="divide-y divide-muted">
                    {completedActivities.map((act: any, i) => (
                      <div key={`${act.id}-${i}`} className="p-6 flex items-center justify-between group hover:bg-primary/5 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-black text-base tracking-tight mb-0.5">{act.title}</p>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                              {act.category} <span className="h-1 w-1 rounded-full bg-muted-foreground" /> {act.durationMinutes} Menit
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="hidden md:block bg-green-100 text-green-700 text-[8px] font-black uppercase px-3 py-1 rounded-full">Completed</div>
                           <ChevronRight className="h-5 w-5 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center">
                    <div className="bg-muted/50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Trophy className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <p className="font-black text-sm uppercase tracking-widest text-muted-foreground">Belum ada materi yang ditamatkan hari ini</p>
                    <p className="text-[10px] font-medium text-muted-foreground/60 mt-2 uppercase">Klik tanggal lain atau mulai belajar sekarang!</p>
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

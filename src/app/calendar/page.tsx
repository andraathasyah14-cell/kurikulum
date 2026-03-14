
'use client';

import { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronRight,
  BookOpen,
  Trophy,
  Zap,
  CalendarDays,
  Clock,
  NotebookPen,
  ChevronLeft
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
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

  const reflectionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'reflections'));
  }, [db, user]);

  const { data: logs } = useCollection(logsQuery);
  const { data: dailyStats } = useCollection(dailyStatsQuery);
  const { data: activities } = useCollection(activitiesQuery);
  const { data: reflections } = useCollection(reflectionsQuery);

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const dayLogs = useMemo(() => {
    if (!logs || !selectedDateStr) return [];
    return logs.filter(log => log.date === selectedDateStr);
  }, [logs, selectedDateStr]);

  const dayStat = useMemo(() => {
    if (!dailyStats || !selectedDateStr) return null;
    return dailyStats.find(s => s.date === selectedDateStr);
  }, [dailyStats, selectedDateStr]);

  const dayReflection = useMemo(() => {
    if (!reflections || !selectedDateStr) return null;
    return reflections.find(r => r.date === selectedDateStr);
  }, [reflections, selectedDateStr]);

  const completedActivities = useMemo(() => {
    if (!dayLogs || !activities) return [];
    const activityMap = new Map(activities.map(a => [a.id, a]));
    return dayLogs.map(log => ({
      ...activityMap.get(log.activityId),
      timestamp: log.timestamp
    })).filter(a => !!a.id);
  }, [dayLogs, activities]);

  // Modifiers for highlights (underline for days with activity)
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
      textDecorationThickness: '3px',
      textUnderlineOffset: '4px',
      color: 'hsl(var(--primary))'
    }
  };

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl pb-32">
      <div className="mb-10 text-center">
        <h1 className="font-headline text-5xl font-black tracking-tight mb-2">Riwayat Belajar</h1>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" /> Pantau Konsistensi & Jurnal Aktivitas
        </p>
      </div>

      <div className="grid gap-12">
        {/* Modern Boxy Calendar Section - ENFORCED 7 COLUMNS */}
        <div className="flex justify-center">
          <div className="w-full max-w-[380px] bg-[#111827] rounded-[24px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] text-white">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              locale={enUS}
              className="p-0 w-full"
              classNames={{
                months: "w-full",
                month: "space-y-4 w-full",
                caption: "flex justify-between items-center mb-6 px-1",
                caption_label: "text-lg font-bold",
                nav: "flex items-center gap-2",
                nav_button: cn(
                  "h-10 w-10 flex items-center justify-center bg-[#1f2937] hover:bg-[#374151] rounded-[10px] transition-colors border-none text-white opacity-100"
                ),
                table: "w-full flex flex-col gap-1",
                head_row: "flex w-full mb-2",
                head_cell: "w-[calc(100%/7)] text-[12px] font-bold opacity-70 text-center pb-2",
                row: "flex w-full",
                cell: "relative p-0 text-center text-sm w-[calc(100%/7)] flex items-center justify-center h-11",
                day: cn(
                  "h-10 w-10 p-0 font-medium rounded-[10px] transition-all flex items-center justify-center hover:bg-[#374151] cursor-pointer text-white"
                ),
                day_selected: "bg-[#3b82f6] text-white hover:bg-[#3b82f6] focus:bg-[#3b82f6] shadow-lg scale-105 z-10",
                day_today: "ring-2 ring-[#3b82f6]/50",
                day_outside: "text-white/20",
                day_disabled: "text-white/20",
                day_hidden: "invisible",
              }}
              components={{
                IconLeft: () => <ChevronLeft className="h-5 w-5" />,
                IconRight: () => <ChevronRight className="h-5 w-5" />
              }}
            />
          </div>
        </div>

        {/* Daily Timeline View */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between px-4 gap-4">
             <div>
               <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Daily Record</p>
               <h2 className="text-3xl font-black uppercase tracking-tighter">
                 {selectedDate ? format(selectedDate, 'EEEE, d MMMM yyyy', { locale: idLocale }) : 'Pilih Tanggal'}
               </h2>
             </div>
             <div className="flex items-center gap-4">
                <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow-lg">
                  <p className="text-[9px] font-black uppercase opacity-70">Soal</p>
                  <p className="text-xl font-black">{dayStat?.questionsSolved || 0}</p>
                </div>
                <div className="bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-lg">
                  <p className="text-[9px] font-black uppercase opacity-70">Materi</p>
                  <p className="text-xl font-black">{completedActivities.length}</p>
                </div>
             </div>
          </div>

          <div className="relative pl-12 md:pl-20 py-4">
            {/* Vertical Timeline Line */}
            <div className="absolute left-6 md:left-10 top-0 bottom-0 w-0.5 bg-muted border-l-2 border-dashed border-muted-foreground/20" />

            {completedActivities.length > 0 ? (
              <div className="space-y-10">
                {completedActivities.map((act: any, i) => {
                  const time = act.timestamp ? format(act.timestamp.toDate(), 'HH:mm') : '--:--';
                  return (
                    <div key={`${act.id}-${i}`} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute -left-12 md:-left-[60px] top-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="bg-white border-2 border-primary h-4 w-4 rounded-full z-10 shadow-[0_0_10px_rgba(var(--primary),0.3)]" />
                        <span className="text-[10px] font-black text-primary mt-1 bg-white px-1">{time}</span>
                      </div>

                      <Card className="border-none shadow-md rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 bg-card group">
                        <CardContent className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <div className="h-12 w-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                              <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="font-black text-lg tracking-tight mb-0.5">{act.title}</p>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{act.category}</span>
                                <span className="h-1 w-1 rounded-full bg-muted-foreground opacity-30" />
                                <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {act.durationMinutes}m
                                </span>
                              </div>
                            </div>
                          </div>
                          <Zap className="h-5 w-5 text-primary opacity-20 group-hover:opacity-100 group-hover:fill-current transition-all" />
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center opacity-40">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="font-black text-sm uppercase tracking-widest">Tidak ada aktivitas tersemat</p>
              </div>
            )}

            {/* Daily Reflection Section */}
            {dayReflection && (
              <div className="mt-12 relative pt-8 border-t border-dashed">
                <div className="absolute -left-12 md:-left-[64px] top-8 bg-amber-500 p-2 rounded-full shadow-lg z-10 text-white">
                  <NotebookPen className="h-4 w-4" />
                </div>
                <Card className="border-none shadow-xl rounded-[32px] bg-amber-50 border border-amber-100 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-amber-800 flex items-center gap-2">
                      <NotebookPen className="h-4 w-4" /> Journal Insight
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-serif italic text-amber-900 leading-relaxed">
                      "{dayReflection.content}"
                    </p>
                    <div className="flex items-center gap-1 mt-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Zap key={i} className={cn(
                          "h-3 w-3",
                          i < (dayReflection.productivityRating || 0) ? "text-amber-600 fill-current" : "text-amber-200"
                        )} />
                      ))}
                      <span className="text-[10px] font-black uppercase text-amber-700 ml-2">Rating Produktivitas</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        <div className="p-10 border-4 border-dashed rounded-[48px] bg-muted/20 flex flex-col items-center text-center gap-4">
           <p className="text-[11px] font-bold leading-relaxed text-muted-foreground max-w-md uppercase tracking-widest">
             Gunakan halaman ini untuk refleksi mingguan. Klik tanggal lain untuk melihat bagaimana Anda berkembang setiap harinya.
           </p>
        </div>
      </div>
    </div>
  );
}

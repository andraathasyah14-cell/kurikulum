
'use client';

import { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Trophy,
  Zap,
  Clock,
  NotebookPen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore 
} from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const { user } = useUser();
  const db = useFirestore();
  
  // States
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Firebase Queries
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

  // Calendar Helpers
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({
      start: startDate,
      end: endDate,
    });
  }, [currentMonth]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  const dayLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter(log => log.date === selectedDateStr);
  }, [logs, selectedDateStr]);

  const dayStat = useMemo(() => {
    if (!dailyStats) return null;
    return dailyStats.find(s => s.date === selectedDateStr);
  }, [dailyStats, selectedDateStr]);

  const dayReflection = useMemo(() => {
    if (!reflections) return null;
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

  const hasActivity = (date: Date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    return logs?.some(log => log.date === dStr) || dailyStats?.some(s => s.date === dStr && s.questionsSolved > 0);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl pb-32">
      <div className="mb-10 text-center">
        <h1 className="font-headline text-5xl font-black tracking-tight mb-2">Riwayat Belajar</h1>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" /> Pantau Konsistensi & Jurnal Aktivitas
        </p>
      </div>

      <div className="grid gap-12">
        {/* CUSTOM 7-COLUMN GRID CALENDAR */}
        <div className="flex justify-center">
          <div className="w-full max-w-[400px] bg-[#111827] rounded-[32px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)] text-white border border-white/5">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={prevMonth}
                className="h-10 w-10 flex items-center justify-center bg-[#1f2937] hover:bg-[#374151] rounded-xl transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-black tracking-tight uppercase">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button 
                onClick={nextMonth}
                className="h-10 w-10 flex items-center justify-center bg-[#1f2937] hover:bg-[#374151] rounded-xl transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Day Labels - FORCED 7 COLS */}
            <div className="grid grid-cols-7 text-center mb-4">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="text-[10px] font-black uppercase opacity-40 tracking-widest">
                  {day}
                </div>
              ))}
            </div>

            {/* Date Cells - FORCED 7 COLS */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, i) => {
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());
                const active = hasActivity(date);

                return (
                  <div 
                    key={date.toString()}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "h-11 flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all relative group",
                      !isCurrentMonth && "opacity-10",
                      isSelected ? "bg-primary text-white scale-110 shadow-lg z-10" : "hover:bg-white/5",
                      isToday && !isSelected && "ring-2 ring-primary/30"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-bold",
                      isSelected ? "font-black" : ""
                    )}>
                      {format(date, 'd')}
                    </span>
                    
                    {/* Activity Indicator */}
                    {active && (
                      <div className={cn(
                        "absolute bottom-1.5 h-1 w-4 rounded-full",
                        isSelected ? "bg-white/40" : "bg-primary"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daily Timeline View */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between px-4 gap-4">
             <div>
               <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Daily Record</p>
               <h2 className="text-3xl font-black uppercase tracking-tighter">
                 {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: idLocale })}
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
            <div className="absolute left-6 md:left-10 top-0 bottom-0 w-0.5 bg-muted border-l-2 border-dashed border-muted-foreground/20" />

            {completedActivities.length > 0 ? (
              <div className="space-y-10">
                {completedActivities.map((act: any, i) => {
                  const time = act.timestamp ? format(act.timestamp.toDate(), 'HH:mm') : '--:--';
                  return (
                    <div key={`${act.id}-${i}`} className="relative">
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
      </div>
    </div>
  );
}

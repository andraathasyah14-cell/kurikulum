
'use client';

import { useState, useMemo } from 'react';
import { 
  Plus, 
  Clock, 
  Calendar, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Circle, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Copy,
  Edit2,
  CalendarDays,
  ListTodo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore 
} from '@/firebase';
import { collection, query, orderBy, serverTimestamp, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, addMinutes, parse, startOfDay, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, getDay, getDate } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function SchedulePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('daily');
  
  const [newItem, setNewItem] = useState({
    title: '',
    startTime: '08:00',
    endTime: '09:00',
    type: 'manual' as 'manual' | 'duration',
    duration: '60',
    recurrence: 'once' as 'once' | 'daily' | 'weekly' | 'monthly',
    daysOfWeek: [] as number[],
    dayOfMonth: getDate(new Date()),
  });

  const scheduleQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'schedules'), orderBy('startTime', 'asc'));
  }, [db, user]);

  const { data: schedules, isLoading } = useCollection(scheduleQuery);

  const dailySchedule = useMemo(() => {
    if (!schedules) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayIdx = getDay(selectedDate);
    const dayOfMonth = getDate(selectedDate);

    return schedules.filter(item => {
      if (item.recurrence === 'once') return item.specificDate === dateStr;
      if (item.recurrence === 'daily') return true;
      if (item.recurrence === 'weekly') return item.daysOfWeek?.includes(dayIdx);
      if (item.recurrence === 'monthly') return item.dayOfMonth === dayOfMonth;
      return false;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedules, selectedDate]);

  const conflicts = useMemo(() => {
    const list = dailySchedule;
    const found = new Set<string>();
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (a.startTime < b.endTime && b.startTime < a.endTime) {
          found.add(a.id);
          found.add(b.id);
        }
      }
    }
    return found;
  }, [dailySchedule]);

  const totalAlocatedTime = useMemo(() => {
    return dailySchedule.reduce((acc, curr) => {
      const start = parse(curr.startTime, 'HH:mm', new Date());
      const end = parse(curr.endTime, 'HH:mm', new Date());
      const diff = (end.getTime() - start.getTime()) / (1000 * 60);
      return acc + diff;
    }, 0);
  }, [dailySchedule]);

  const handleAddItem = () => {
    if (!user || !db || !newItem.title) return;

    let finalEndTime = newItem.endTime;
    if (newItem.type === 'duration') {
      const start = parse(newItem.startTime, 'HH:mm', new Date());
      const end = addMinutes(start, parseInt(newItem.duration));
      finalEndTime = format(end, 'HH:mm');
    }

    const payload = {
      userId: user.uid,
      title: newItem.title,
      startTime: newItem.startTime,
      endTime: finalEndTime,
      recurrence: newItem.recurrence,
      daysOfWeek: newItem.recurrence === 'weekly' ? newItem.daysOfWeek : null,
      dayOfMonth: newItem.recurrence === 'monthly' ? newItem.dayOfMonth : null,
      specificDate: newItem.recurrence === 'once' ? format(selectedDate, 'yyyy-MM-dd') : null,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'schedules'), payload);
    setIsOpen(false);
    toast({ title: "Jadwal Ditambahkan", description: `"${newItem.title}" berhasil masuk agenda.` });
  };

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDoc(doc(db, 'users', user.uid, 'schedules', id));
  };

  const toggleDay = (idx: number) => {
    setNewItem(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(idx) 
        ? prev.daysOfWeek.filter(d => d !== idx)
        : [...prev.daysOfWeek, idx]
    }));
  };

  const getStatus = (startStr: string, endStr: string) => {
    const now = new Date();
    const timeNow = format(now, 'HH:mm');
    if (timeNow < startStr) return 'Pending';
    if (timeNow > endStr) return 'Selesai';
    return 'Sedang Berlangsung';
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl pb-32">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-5xl font-black tracking-tight mb-2">My Schedule</h1>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Kelola Alokasi Waktu Harian
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg gap-2 h-14 px-8 font-black uppercase text-xs tracking-widest">
              <Plus className="h-5 w-5" /> Buat Jadwal Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] rounded-[32px]">
            <DialogHeader><DialogTitle>Rencanakan Aktivitas</DialogTitle></DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Apa yang akan kamu lakukan?</Label>
                <Input placeholder="Contoh: Belajar Kalkulus, Olahraga Pagi" value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Metode Waktu</Label>
                  <Select value={newItem.type} onValueChange={(v: any) => setNewItem({...newItem, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Mulai & Selesai</SelectItem>
                      <SelectItem value="duration">Mulai & Durasi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Jam Mulai</Label>
                  <Input type="time" value={newItem.startTime} onChange={(e) => setNewItem({...newItem, startTime: e.target.value})} />
                </div>
              </div>

              {newItem.type === 'manual' ? (
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Jam Selesai</Label>
                  <Input type="time" value={newItem.endTime} onChange={(e) => setNewItem({...newItem, endTime: e.target.value})} />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Durasi (Menit)</Label>
                  <Select value={newItem.duration} onValueChange={(v) => setNewItem({...newItem, duration: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 Menit</SelectItem>
                      <SelectItem value="30">30 Menit</SelectItem>
                      <SelectItem value="45">45 Menit</SelectItem>
                      <SelectItem value="60">1 Jam</SelectItem>
                      <SelectItem value="90">1.5 Jam</SelectItem>
                      <SelectItem value="120">2 Jam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-4 border-t pt-4">
                <Label className="text-[10px] font-black uppercase tracking-widest">Perulangan (Recurrence)</Label>
                <Select value={newItem.recurrence} onValueChange={(v: any) => setNewItem({...newItem, recurrence: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Sekali Saja</SelectItem>
                    <SelectItem value="daily">Setiap Hari</SelectItem>
                    <SelectItem value="weekly">Mingguan</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                  </SelectContent>
                </Select>

                {newItem.recurrence === 'weekly' && (
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day, idx) => (
                      <Button 
                        key={day} 
                        variant={newItem.daysOfWeek.includes(idx) ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg text-[10px] font-black"
                        onClick={() => toggleDay(idx)}
                      >
                        {day[0]}
                      </Button>
                    ))}
                  </div>
                )}

                {newItem.recurrence === 'monthly' && (
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Tiap Tanggal</Label>
                    <Input type="number" min="1" max="31" value={newItem.dayOfMonth} onChange={(e) => setNewItem({...newItem, dayOfMonth: parseInt(e.target.value)})} />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter><Button onClick={handleAddItem} className="w-full h-12 rounded-2xl font-black uppercase text-xs">Simpan Jadwal</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={view} onValueChange={setView} className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <TabsList className="bg-muted/50 p-1 rounded-2xl h-12 w-fit">
            <TabsTrigger value="daily" className="rounded-xl px-6 font-black uppercase text-[10px]">Harian</TabsTrigger>
            <TabsTrigger value="weekly" className="rounded-xl px-6 font-black uppercase text-[10px]">Mingguan</TabsTrigger>
            <TabsTrigger value="monthly" className="rounded-xl px-6 font-black uppercase text-[10px]">Bulanan</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 bg-card p-2 rounded-2xl shadow-sm border">
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -1))}><ChevronLeft className="h-5 w-5" /></Button>
            <div className="text-center min-w-[120px]">
              <p className="text-[10px] font-black uppercase tracking-tighter text-primary">{FULL_DAYS[getDay(selectedDate)]}</p>
              <p className="text-sm font-bold">{format(selectedDate, 'd MMM yyyy')}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}><ChevronRight className="h-5 w-5" /></Button>
          </div>
        </div>

        <TabsContent value="daily" className="animate-in fade-in duration-500">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-8 space-y-4">
              {dailySchedule.length > 0 ? (
                dailySchedule.map((item) => {
                  const hasConflict = conflicts.has(item.id);
                  const status = getStatus(item.startTime, item.endTime);
                  return (
                    <Card key={item.id} className={cn(
                      "group border-none shadow-md overflow-hidden transition-all hover:shadow-xl rounded-[28px]",
                      status === 'Sedang Berlangsung' ? "ring-2 ring-primary bg-primary/5" : "bg-card"
                    )}>
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "h-16 w-16 rounded-[22px] flex flex-col items-center justify-center text-white shadow-lg",
                            status === 'Selesai' ? "bg-muted text-muted-foreground" : 
                            status === 'Sedang Berlangsung' ? "bg-primary" : "bg-indigo-600"
                          )}>
                            <p className="text-xs font-black">{item.startTime}</p>
                            <div className="h-px w-6 bg-white/30 my-1" />
                            <p className="text-[10px] font-bold opacity-70">{item.endTime}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={cn("font-black text-lg tracking-tight", status === 'Selesai' && "line-through opacity-50")}>
                                {item.title}
                              </h3>
                              {hasConflict && (
                                <div className="bg-red-100 text-red-600 p-1 rounded-full"><AlertTriangle className="h-3 w-3" /></div>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                status === 'Sedang Berlangsung' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                              )}>{status}</span>
                              <span className="text-[9px] font-bold text-muted-foreground uppercase">{item.recurrence}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="py-24 text-center border-4 border-dashed rounded-[40px] opacity-20">
                  <CalendarDays className="h-16 w-16 mx-auto mb-4" />
                  <p className="font-black uppercase tracking-widest text-sm">Tidak ada jadwal tersemat</p>
                </div>
              )}
            </div>

            <div className="md:col-span-4 space-y-6">
              <Card className="border-none shadow-xl bg-indigo-600 text-white p-8 rounded-[40px]">
                <Clock className="h-10 w-10 mb-4 opacity-50" />
                <h3 className="font-black text-xl mb-1">Time Allocated</h3>
                <p className="text-4xl font-black tabular-nums">{(totalAlocatedTime / 60).toFixed(1)} <span className="text-lg opacity-60">Jam</span></p>
                <p className="text-[10px] font-bold uppercase opacity-60 mt-4 tracking-widest">Total durasi hari ini</p>
              </Card>

              {conflicts.size > 0 && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-[32px] flex items-start gap-4 animate-bounce">
                  <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
                  <div>
                    <p className="text-xs font-black uppercase text-red-600 tracking-tight mb-1">Waktu Bentrok!</p>
                    <p className="text-[10px] font-medium text-red-900 leading-tight">Beberapa aktivitas Anda memiliki waktu yang tumpang tindih. Periksa kembali jadwal Anda.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="animate-in fade-in duration-500">
           <div className="grid gap-4 md:grid-cols-7">
              {eachDayOfInterval({
                start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
                end: endOfWeek(selectedDate, { weekStartsOn: 1 })
              }).map((day) => {
                const dayIdx = getDay(day);
                const count = schedules?.filter(s => {
                  if (s.recurrence === 'daily') return true;
                  if (s.recurrence === 'weekly') return s.daysOfWeek?.includes(dayIdx);
                  return false;
                }).length || 0;
                
                return (
                  <Card 
                    key={day.toString()} 
                    className={cn(
                      "p-4 text-center rounded-2xl cursor-pointer hover:bg-primary/5 transition-all",
                      isSameDay(day, selectedDate) && "ring-2 ring-primary shadow-lg"
                    )}
                    onClick={() => setSelectedDate(day)}
                  >
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{DAYS[dayIdx]}</p>
                    <p className="text-lg font-black">{getDate(day)}</p>
                    <div className="mt-2 flex justify-center gap-1">
                      {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                        <div key={i} className="h-1 w-1 rounded-full bg-primary" />
                      ))}
                    </div>
                  </Card>
                );
              })}
           </div>

           <Card className="mt-8 border-none shadow-sm bg-muted/20 rounded-[32px] p-8">
              <h4 className="font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-primary" /> Ringkasan Mingguan
              </h4>
              <div className="grid gap-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <span className="text-sm font-bold text-muted-foreground">Total Aktivitas Terdaftar</span>
                  <span className="text-xl font-black">{schedules?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <span className="text-sm font-bold text-muted-foreground">Aktivitas Berulang (Daily)</span>
                  <span className="text-xl font-black">{schedules?.filter(s => s.recurrence === 'daily').length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-muted-foreground">Estimasi Waktu Belajar / Minggu</span>
                  <span className="text-xl font-black">{((schedules?.length || 0) * 1.5).toFixed(1)} Jam</span>
                </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="monthly" className="animate-in fade-in duration-500">
           <div className="p-12 text-center border-4 border-dashed rounded-[60px] opacity-20 bg-muted/20">
             <CalendarDays className="h-24 w-24 mx-auto mb-4" />
             <p className="font-black text-2xl uppercase tracking-tighter">Perencanaan Bulanan</p>
             <p className="text-xs font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto">
               Gunakan tab Harian/Mingguan untuk mengatur detail. Tampilan bulanan sedang disinkronkan dengan kalender utama Anda.
             </p>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

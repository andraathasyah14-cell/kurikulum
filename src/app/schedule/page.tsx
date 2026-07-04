
'use client';

import { useState, useMemo } from 'react';
import { 
  Plus, 
  Clock, 
  Trash2, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Coffee,
  Zap,
  PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore 
} from '@/firebase';
import { collection, query, orderBy, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, addMinutes, parse, addDays, getDay, getDate } from 'date-fns';

const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const FULL_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function SchedulePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  
  const [newItem, setNewItem] = useState({
    title: '',
    startTime: '08:00',
    endTime: '09:00',
    type: 'duration' as 'manual' | 'duration',
    duration: '60',
    recurrence: 'once' as 'once' | 'daily' | 'weekly',
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

    return schedules.filter(item => {
      if (item.recurrence === 'once') return item.specificDate === dateStr;
      if (item.recurrence === 'daily') return true;
      if (item.recurrence === 'weekly') return item.daysOfWeek?.includes(dayIdx);
      return false;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedules, selectedDate]);

  // Generate 24 hour grid data
  const gridData = useMemo(() => {
    const grid = HOURS.map(hour => ({
      hour,
      activity: dailySchedule.find(s => {
        const start = s.startTime;
        const end = s.endTime;
        return hour >= start && hour < end;
      }) || null
    }));
    return grid;
  }, [dailySchedule]);

  const handleAddItem = () => {
    if (!user || !db || !newItem.title) return;

    let finalEndTime = newItem.endTime;
    if (newItem.type === 'duration') {
      const start = parse(newItem.startTime, 'HH:mm', new Date());
      const end = addMinutes(start, parseInt(newItem.duration));
      finalEndTime = format(end, 'HH:mm');
    }

    // Overlap Check
    const hasConflict = dailySchedule.some(s => {
      return (newItem.startTime < s.endTime && finalEndTime > s.startTime);
    });

    if (hasConflict) {
      toast({ 
        variant: "destructive", 
        title: "Waktu Bentrok!", 
        description: "Aktivitas tumpang tindih dengan jadwal lain di jam tersebut." 
      });
      return;
    }

    const payload = {
      userId: user.uid,
      title: newItem.title,
      startTime: newItem.startTime,
      endTime: finalEndTime,
      recurrence: newItem.recurrence,
      daysOfWeek: newItem.recurrence === 'weekly' ? [getDay(selectedDate)] : null,
      specificDate: newItem.recurrence === 'once' ? format(selectedDate, 'yyyy-MM-dd') : null,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'schedules'), payload);
    setIsOpen(false);
    toast({ title: "Berhasil", description: `"${newItem.title}" ditambahkan ke jadwal.` });
  };

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDoc(doc(db, 'users', user.uid, 'schedules', id));
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="container px-4 py-8 md:px-6 max-w-3xl pb-32">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-5xl font-black tracking-tight mb-2">24h Planner</h1>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Kelola Slot Waktu Harian
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-card p-2 rounded-2xl shadow-sm border">
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -1))}><ChevronLeft className="h-5 w-5" /></Button>
          <div className="text-center min-w-[120px]">
            <p className="text-[10px] font-black uppercase tracking-tighter text-primary">{FULL_DAYS[getDay(selectedDate)]}</p>
            <p className="text-sm font-bold">{format(selectedDate, 'd MMM yyyy')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}><ChevronRight className="h-5 w-5" /></Button>
        </div>
      </div>

      <div className="bg-muted/10 rounded-[40px] border p-4 space-y-2">
        {gridData.map(({ hour, activity }) => (
          <div key={hour} className="flex gap-4 group">
            <div className="w-12 pt-2 text-right">
              <span className="text-[10px] font-black text-muted-foreground opacity-50">{hour}</span>
            </div>
            
            {activity ? (
              <Card className="flex-1 border-none shadow-sm rounded-2xl bg-indigo-600 text-white overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-2 rounded-xl">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm leading-tight">{activity.title}</p>
                      <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest">{activity.startTime} - {activity.endTime}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/10" onClick={() => handleDelete(activity.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div 
                className="flex-1 py-4 px-6 border-2 border-dashed rounded-2xl flex items-center justify-between opacity-30 hover:opacity-100 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer"
                onClick={() => {
                  setNewItem({ ...newItem, startTime: hour });
                  setIsOpen(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <Coffee className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Istirahat</span>
                </div>
                <PlusCircle className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[32px]">
          <DialogHeader><DialogTitle>Assign Slot Waktu</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Aktivitas</Label>
              <Input placeholder="Contoh: Belajar UTBK" value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Jam Mulai</Label>
                <Input type="time" value={newItem.startTime} onChange={(e) => setNewItem({...newItem, startTime: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Durasi</Label>
                <Select value={newItem.duration} onValueChange={(v) => setNewItem({...newItem, duration: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Menit</SelectItem>
                    <SelectItem value="60">1 Jam</SelectItem>
                    <SelectItem value="120">2 Jam</SelectItem>
                    <SelectItem value="180">3 Jam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 border-t pt-4">
              <Label className="text-[10px] font-black uppercase tracking-widest">Berulang?</Label>
              <Select value={newItem.recurrence} onValueChange={(v: any) => setNewItem({...newItem, recurrence: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Hanya Hari Ini</SelectItem>
                  <SelectItem value="daily">Setiap Hari</SelectItem>
                  <SelectItem value="weekly">Mingguan ({FULL_DAYS[getDay(selectedDate)]})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddItem} className="w-full h-12 rounded-2xl font-black uppercase text-xs">Simpan ke Timeline</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

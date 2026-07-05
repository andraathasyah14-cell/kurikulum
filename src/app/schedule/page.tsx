
'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Clock, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Coffee,
  Zap,
  PlusCircle,
  CheckCircle2,
  Copy,
  Sparkles,
  LayoutTemplate,
  X,
  Edit2,
  Save,
  BookmarkPlus
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
import { collection, query, orderBy, serverTimestamp, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, addMinutes, parse, addDays, getDay, startOfDay } from 'date-fns';

const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const FULL_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const PREDEFINED_TEMPLATES: Record<number, any[]> = {
  5: [
    { title: 'Salat Subuh & Persiapan', start: '04:30', end: '05:30' },
    { title: 'Sesi Belajar 1', start: '05:30', end: '07:30' },
    { title: 'Sarapan & Istirahat', start: '07:30', end: '08:30' },
    { title: 'Sesi Belajar 2', start: '08:30', end: '10:30' },
    { title: 'Salat Zuhur & Makan Siang', start: '12:00', end: '13:30' },
    { title: 'Sesi Belajar 3 (Final)', start: '14:00', end: '15:00' },
    { title: 'Salat Asar', start: '15:30', end: '16:00' },
    { title: 'Salat Magrib', start: '18:15', end: '18:45' },
    { title: 'Makan Malam', start: '19:00', end: '19:30' },
    { title: 'Salat Isya', start: '19:30', end: '20:00' },
  ],
  8: [
    { title: 'Salat Subuh & Persiapan', start: '04:30', end: '05:30' },
    { title: 'Sesi Belajar 1', start: '05:30', end: '08:30' },
    { title: 'Sarapan & Break', start: '08:30', end: '09:30' },
    { title: 'Sesi Belajar 2', start: '09:30', end: '11:30' },
    { title: 'Salat Zuhur & Makan Siang', start: '12:00', end: '13:30' },
    { title: 'Sesi Belajar 3', start: '13:30', end: '15:30' },
    { title: 'Salat Asar', start: '15:30', end: '16:00' },
    { title: 'Sesi Belajar 4 (Review)', start: '16:30', end: '17:30' },
    { title: 'Salat Magrib & Makan Malam', start: '18:15', end: '19:15' },
    { title: 'Salat Isya', start: '19:30', end: '20:00' },
    { title: 'Sesi Belajar 5 (Night)', start: '20:00', end: '21:00' },
  ],
  10: [
    { title: 'Salat Subuh & Persiapan', start: '04:30', end: '05:30' },
    { title: 'Sesi Belajar 1', start: '05:30', end: '08:30' },
    { title: 'Sarapan', start: '08:30', end: '09:00' },
    { title: 'Sesi Belajar 2', start: '09:00', end: '11:30' },
    { title: 'Salat Zuhur & Makan Siang', start: '12:00', end: '13:00' },
    { title: 'Sesi Belajar 3', start: '13:00', end: '15:30' },
    { title: 'Salat Asar', start: '15:30', end: '16:00' },
    { title: 'Sesi Belajar 4', start: '16:00', end: '18:00' },
    { title: 'Salat Magrib & Makan Malam', start: '18:15', end: '19:15' },
    { title: 'Salat Isya', start: '19:30', end: '20:00' },
    { title: 'Sesi Belajar 5 (Final)', start: '20:00', end: '22:00' },
  ],
  12: [
    { title: 'Salat Subuh & Persiapan', start: '04:30', end: '05:30' },
    { title: 'Sesi Belajar 1', start: '05:30', end: '09:30' },
    { title: 'Sarapan', start: '09:30', end: '10:00' },
    { title: 'Sesi Belajar 2', start: '10:00', end: '12:00' },
    { title: 'Salat Zuhur & Makan Siang', start: '12:00', end: '13:00' },
    { title: 'Sesi Belajar 3', start: '13:00', end: '16:00' },
    { title: 'Salat Asar', start: '16:00', end: '16:30' },
    { title: 'Sesi Belajar 4', start: '16:30', end: '18:30' },
    { title: 'Salat Magrib & Makan Malam', start: '18:30', end: '19:30' },
    { title: 'Salat Isya', start: '19:30', end: '20:00' },
    { title: 'Sesi Belajar 5', start: '20:00', end: '22:00' },
    { title: 'Review Akhir', start: '22:00', end: '23:00' },
  ]
};

// Fill remaining templates gaps roughly
[6, 7, 9, 11, 13].forEach(h => {
  if (!PREDEFINED_TEMPLATES[h]) {
    PREDEFINED_TEMPLATES[h] = PREDEFINED_TEMPLATES[h-1] || PREDEFINED_TEMPLATES[8];
  }
});

export default function SchedulePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isCustomTemplateSaveOpen, setIsCustomTemplateSaveOpen] = useState(false);
  const [customTemplateName, setCustomTemplateName] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const [newItem, setNewItem] = useState({
    title: '',
    startTime: '08:00',
    endTime: '09:00',
    type: 'duration' as 'manual' | 'duration',
    duration: '60',
    recurrence: 'once' as 'once' | 'daily' | 'weekly',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const scheduleQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'schedules'), orderBy('startTime', 'asc'));
  }, [db, user]);

  const customTemplatesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'customTemplates'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: schedules, isLoading } = useCollection(scheduleQuery);
  const { data: customTemplates } = useCollection(customTemplatesQuery);

  const dailySchedule = useMemo(() => {
    if (!schedules || !mounted) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayIdx = getDay(selectedDate);

    return schedules.filter(item => {
      if (item.recurrence === 'once') return item.specificDate === dateStr;
      if (item.recurrence === 'daily') return true;
      if (item.recurrence === 'weekly') return item.daysOfWeek?.includes(dayIdx);
      return false;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedules, selectedDate, mounted]);

  const gridData = useMemo(() => {
    return HOURS.map(hour => {
      const nextHour = format(addMinutes(parse(hour, 'HH:mm', new Date()), 60), 'HH:mm');
      const overlappingActivities = dailySchedule.filter(s => {
        return s.startTime < nextHour && s.endTime > hour;
      });
      return {
        hour,
        activities: overlappingActivities
      };
    });
  }, [dailySchedule]);

  const handleApplyTemplate = async (items: any[], sourceName: string) => {
    if (!user || !db) return;
    
    const batch = writeBatch(db);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    // Remove existing "once" schedules for this date
    const existingIds = dailySchedule
      .filter(s => s.recurrence === 'once')
      .map(s => s.id);
    
    existingIds.forEach(id => {
      batch.delete(doc(db, 'users', user.uid, 'schedules', id));
    });

    items.forEach((item) => {
      const newDocRef = doc(collection(db, 'users', user.uid, 'schedules'));
      batch.set(newDocRef, {
        userId: user.uid,
        title: item.title,
        startTime: item.start || item.startTime,
        endTime: item.end || item.endTime,
        recurrence: 'once',
        specificDate: dateStr,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
    });

    try {
      await batch.commit();
      setIsTemplateOpen(false);
      toast({ title: "Template Diterapkan", description: `Jadwal "${sourceName}" telah diterapkan.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Tidak bisa menerapkan template." });
    }
  };

  const handleSaveAsCustomTemplate = () => {
    if (!user || !db || dailySchedule.length === 0 || !customTemplateName) {
      toast({ variant: "destructive", title: "Gagal", description: "Beri nama template dan pastikan jadwal tidak kosong." });
      return;
    }

    const templateData = dailySchedule.map(s => ({
      title: s.title,
      startTime: s.startTime,
      endTime: s.endTime
    }));

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'customTemplates'), {
      userId: user.uid,
      name: customTemplateName,
      items: templateData,
      createdAt: serverTimestamp(),
    });

    setCustomTemplateName('');
    setIsCustomTemplateSaveOpen(false);
    toast({ title: "Template Tersimpan", description: `"${customTemplateName}" telah ditambahkan ke koleksi Anda.` });
  };

  const handleCopySchedule = () => {
    if (dailySchedule.length === 0) {
      toast({ variant: "destructive", title: "Kosong", description: "Tidak ada jadwal untuk disalin." });
      return;
    }

    const text = dailySchedule.map(s => `[${s.startTime} - ${s.endTime}] ${s.title} (${s.status === 'completed' ? 'Selesai' : 'Belum Selesai'})`).join('\n');
    const header = `Jadwal Belajar StudyPro - ${format(selectedDate, 'EEEE, d MMMM yyyy')}\n\n`;
    navigator.clipboard.writeText(header + text);
    toast({ title: "Disalin!", description: "Jadwal harian telah disalin ke clipboard." });
  };

  const handleAddItem = () => {
    if (!user || !db || !newItem.title) return;

    let finalEndTime = newItem.endTime;
    if (newItem.type === 'duration') {
      const start = parse(newItem.startTime, 'HH:mm', new Date());
      const end = addMinutes(start, parseInt(newItem.duration));
      finalEndTime = format(end, 'HH:mm');
    }

    const hasConflict = dailySchedule.some(s => {
      return (newItem.startTime < s.endTime && finalEndTime > s.startTime);
    });

    if (hasConflict) {
      toast({ variant: "destructive", title: "Waktu Bentrok!", description: "Ada jadwal lain di jam yang sama." });
      return;
    }

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'schedules'), {
      userId: user.uid,
      title: newItem.title,
      startTime: newItem.startTime,
      endTime: finalEndTime,
      recurrence: newItem.recurrence,
      daysOfWeek: newItem.recurrence === 'weekly' ? [getDay(selectedDate)] : null,
      specificDate: newItem.recurrence === 'once' ? format(selectedDate, 'yyyy-MM-dd') : null,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    setIsOpen(false);
  };

  const handleToggleStatus = (item: any) => {
    if (!user || !db) return;
    updateDocumentNonBlocking(doc(db, 'users', user.uid, 'schedules', item.id), {
      status: item.status === 'completed' ? 'pending' : 'completed'
    });
  };

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDoc(doc(db, 'users', user.uid, 'schedules', id));
  };

  const handleDeleteCustomTemplate = (id: string) => {
    if (!user || !db) return;
    deleteDoc(doc(db, 'users', user.uid, 'customTemplates', id));
    toast({ title: "Template Dihapus" });
  };

  if (!mounted || isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="container px-4 py-8 md:px-6 max-w-3xl pb-32">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-5xl font-black tracking-tight mb-2">24h Planner</h1>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Atur Strategi Belajarmu
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 bg-card p-2 rounded-2xl shadow-sm border self-end">
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -1))}><ChevronLeft className="h-5 w-5" /></Button>
            <div className="text-center min-w-[100px]">
              <p className="text-[9px] font-black uppercase tracking-tighter text-primary">{FULL_DAYS[getDay(selectedDate)]}</p>
              <p className="text-xs font-bold">{format(selectedDate, 'd MMM yyyy')}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}><ChevronRight className="h-5 w-5" /></Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full h-10 font-black text-[10px] uppercase gap-2 px-4" onClick={handleCopySchedule}>
              <Copy className="h-4 w-4" /> Copy
            </Button>
            <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="rounded-full h-10 font-black text-[10px] uppercase gap-2 px-4">
                  <LayoutTemplate className="h-4 w-4" /> Template
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[32px] max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Pilih Template</DialogTitle></DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Predefined */}
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-widest">Target Jam Belajar</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[5, 6, 7, 8, 9, 10, 11, 12, 13].map(h => (
                        <Button key={h} variant="outline" className="h-14 font-black text-sm rounded-2xl gap-2" onClick={() => handleApplyTemplate(PREDEFINED_TEMPLATES[h], `${h} Jam`)}>
                          <Sparkles className="h-4 w-4 text-primary" /> {h}h
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Templates */}
                  {customTemplates && customTemplates.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-widest">Template Anda</h4>
                      <div className="grid gap-2">
                        {customTemplates.map(tmp => (
                          <div key={tmp.id} className="flex gap-2">
                            <Button variant="secondary" className="flex-1 justify-start h-12 rounded-xl font-bold gap-3" onClick={() => handleApplyTemplate(tmp.items, tmp.name)}>
                              <BookmarkPlus className="h-4 w-4" /> {tmp.name}
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive h-12 w-12" onClick={() => handleDeleteCustomTemplate(tmp.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isCustomTemplateSaveOpen} onOpenChange={setIsCustomTemplateSaveOpen}>
               <DialogTrigger asChild>
                 <Button variant="outline" size="sm" className="rounded-full h-10 font-black text-[10px] uppercase gap-2 px-4 border-primary text-primary hover:bg-primary/5">
                   <BookmarkPlus className="h-4 w-4" /> Simpan
                 </Button>
               </DialogTrigger>
               <DialogContent className="rounded-[32px]">
                 <DialogHeader><DialogTitle>Simpan ke Template</DialogTitle></DialogHeader>
                 <div className="py-4 space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Nama Template</Label>
                    <Input 
                      placeholder="Contoh: Jadwal Weekend, Persiapan UTBK" 
                      value={customTemplateName} 
                      onChange={(e) => setCustomTemplateName(e.target.value)} 
                    />
                    <p className="text-[10px] text-muted-foreground italic">Seluruh agenda jadwal untuk tanggal {format(selectedDate, 'd MMM')} akan disimpan sebagai template baru.</p>
                 </div>
                 <DialogFooter>
                   <Button onClick={handleSaveAsCustomTemplate} className="w-full h-12 rounded-2xl font-black uppercase text-xs">Simpan Sekarang</Button>
                 </DialogFooter>
               </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="bg-muted/10 rounded-[40px] border p-4 space-y-2">
        {gridData.map(({ hour, activities }) => (
          <div key={hour} className="flex gap-4 group min-h-[60px]">
            <div className="w-12 pt-2 text-right">
              <span className="text-[10px] font-black text-muted-foreground opacity-50">{hour}</span>
            </div>
            
            <div className="flex-1 flex flex-col gap-2">
              {activities.length > 0 ? (
                activities.map(activity => {
                  const isCompleted = activity.status === 'completed';
                  return (
                    <Card 
                      key={activity.id}
                      className={cn(
                        "border-none shadow-sm rounded-2xl overflow-hidden transition-all cursor-pointer",
                        isCompleted ? "bg-green-600 text-white opacity-60" : "bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
                      )}
                      onClick={() => handleToggleStatus(activity)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-xl", isCompleted ? "bg-white/40" : "bg-white/20")}>
                            {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className={cn("font-black text-sm leading-none mb-1.5 truncate", isCompleted && "line-through")}>{activity.title}</p>
                            <p className="text-[10px] font-bold opacity-80 flex items-center gap-1.5">
                              <Clock className="h-3 w-3" /> {activity.startTime} - {activity.endTime}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-white/40 hover:text-white h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDelete(activity.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="flex-1 py-4 px-6 border-2 border-dashed rounded-2xl flex items-center justify-between opacity-30 hover:opacity-100 hover:bg-primary/5 cursor-pointer group/rest" onClick={() => { setNewItem({ ...newItem, startTime: hour }); setIsOpen(true); }}>
                  <div className="flex items-center gap-3">
                    <Coffee className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Istirahat / Kosong</span>
                  </div>
                  <PlusCircle className="h-5 w-5 text-primary opacity-0 group-hover/rest:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rounded-[32px]">
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
                    <SelectItem value="15">15 Menit</SelectItem>
                    <SelectItem value="30">30 Menit</SelectItem>
                    <SelectItem value="45">45 Menit</SelectItem>
                    <SelectItem value="60">1 Jam</SelectItem>
                    <SelectItem value="120">2 Jam</SelectItem>
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
                  <SelectItem value="weekly">Mingguan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddItem} className="w-full h-12 rounded-2xl font-black uppercase text-xs">Simpan Jadwal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

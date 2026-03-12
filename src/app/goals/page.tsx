
'use client';

import { useState } from 'react';
import { Target, Plus, Trash2, Calendar, Trophy, Flag, Info, Lock, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, serverTimestamp, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInDays } from 'date-fns';

export default function GoalsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const [newGoal, setNewGoal] = useState({ 
    title: '', 
    targetValue: 1, 
    unit: 'Jam' as 'Jam' | 'Materi' | 'Episode',
    deadline: ''
  });

  const goalsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'goals'));
  }, [db, user]);

  const { data: goals, isLoading } = useCollection(goalsQuery);

  const handleAddGoal = () => {
    if (!user || !db || !newGoal.title) return;
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'goals'), {
      userId: user.uid,
      title: newGoal.title,
      targetValue: Number(newGoal.targetValue),
      currentValue: 0,
      unit: newGoal.unit,
      deadline: newGoal.deadline || null,
      createdAt: serverTimestamp(),
    });
    setNewGoal({ title: '', targetValue: 1, unit: 'Jam', deadline: '' });
    setIsOpen(false);
    toast({ title: "Target Dibuat", description: `Mari kejar target "${newGoal.title}"!` });
  };

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDoc(doc(db, 'users', user.uid, 'goals', id));
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl pb-32">
      <div className="mb-8 p-6 bg-primary/5 rounded-[32px] border border-primary/10 flex items-start gap-4">
        <div className="bg-primary/10 p-2 rounded-xl">
          <Info className="h-5 w-5 text-primary shrink-0" />
        </div>
        <div>
          <h3 className="font-black text-sm uppercase tracking-tight mb-1">Sistem Target Otomatis</h3>
          <p className="text-xs font-medium leading-relaxed text-muted-foreground">
            Progres target Anda sekarang terhubung langsung dengan aktivitas di Kurikulum. Saat Anda membuat materi baru, hubungkan ke target yang diinginkan. Progres akan bertambah otomatis saat materi diselesaikan.
          </p>
        </div>
      </div>

      <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-5xl font-black tracking-tight mb-2">My Goals</h1>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" /> Strategi & Target Belajar
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg gap-2 h-14 px-8 font-black uppercase text-xs tracking-widest">
              <Plus className="h-5 w-5" /> Buat Target Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[32px]">
            <DialogHeader><DialogTitle>Setting Goal</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="font-black text-[10px] uppercase tracking-widest">Apa Targetmu?</Label>
                <Input placeholder="Contoh: Belajar UTBK, Selesai Kursus React" value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest">Jumlah Target</Label>
                  <Input type="number" value={newGoal.targetValue} onChange={(e) => setNewGoal({...newGoal, targetValue: parseInt(e.target.value) || 1})} />
                </div>
                <div className="grid gap-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest">Satuan</Label>
                  <Select value={newGoal.unit} onValueChange={(v: any) => setNewGoal({...newGoal, unit: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Jam">Jam</SelectItem><SelectItem value="Materi">Materi</SelectItem><SelectItem value="Episode">Episode</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="font-black text-[10px] uppercase tracking-widest">Tenggat Waktu (Opsional)</Label>
                <Input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} />
                <p className="text-[10px] text-muted-foreground italic">Menambahkan deadline akan mengaktifkan kalkulator kebutuhan harian.</p>
              </div>
            </div>
            <DialogFooter><Button onClick={handleAddGoal} className="w-full h-12 font-black uppercase text-xs">Simpan Goal</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {goals?.map((goal) => {
          const progress = (goal.currentValue / goal.targetValue) * 100;
          
          // Daily Requirement Calculation
          const deadlineDate = goal.deadline ? parseISO(goal.deadline) : null;
          const today = new Date();
          const daysRemaining = deadlineDate ? Math.max(1, differenceInDays(deadlineDate, today) + 1) : null;
          const remainingValue = Math.max(0, goal.targetValue - (goal.currentValue || 0));
          const requiredPerDay = (daysRemaining && daysRemaining > 0) ? (remainingValue / daysRemaining) : null;

          return (
            <Card key={goal.id} className="border-none shadow-xl overflow-hidden rounded-[40px] bg-card hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-8">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="bg-primary/10 p-5 rounded-[28px] shadow-inner">
                        <Flag className="h-10 w-10 text-primary" />
                      </div>
                      <div className="min-w-0">
                         <h3 className="font-black text-3xl tracking-tighter leading-none mb-2 truncate max-w-[250px] md:max-w-md">{goal.title}</h3>
                         <div className="flex flex-wrap items-center gap-2">
                           <span className="text-[10px] font-black uppercase bg-muted px-3 py-1 rounded-full text-muted-foreground tracking-widest">
                             {goal.targetValue} {goal.unit}
                           </span>
                           {goal.deadline && (
                             <span className="text-[10px] font-black uppercase bg-amber-50 px-3 py-1 rounded-full text-amber-700 border border-amber-100 flex items-center gap-1.5 tracking-widest">
                               <Calendar className="h-3 w-3" /> {format(parseISO(goal.deadline), 'd MMM yyyy')}
                             </span>
                           )}
                         </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive opacity-20 hover:opacity-100 hover:bg-destructive/10 rounded-full" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="grid gap-6 md:grid-cols-12 items-end">
                    <div className="md:col-span-8 space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase text-primary tracking-widest">
                        <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Automated Tracking</span>
                        <span>{goal.currentValue?.toFixed(1) || 0} / {goal.targetValue} {goal.unit} ({Math.round(progress)}%)</span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden border border-muted shadow-inner">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${Math.min(100, progress)}%` }} 
                        />
                      </div>
                    </div>
                    <div className="md:col-span-4 bg-muted/30 p-5 rounded-[28px] text-center border border-muted/50">
                      <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Status Progres</p>
                      <p className="text-3xl font-black text-primary">{Math.round(progress)}%</p>
                    </div>
                  </div>

                  {requiredPerDay !== null && requiredPerDay > 0 && (
                    <div className="bg-primary/5 border border-primary/10 rounded-[28px] p-6 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                      <div className="bg-primary text-white p-3 rounded-2xl shadow-lg">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Kebutuhan Harian (Daily Requirement)</p>
                        <p className="text-lg font-bold leading-tight">
                          Anda butuh <span className="text-primary font-black underline decoration-2 underline-offset-4">{requiredPerDay.toFixed(1)} {goal.unit} / hari</span> 
                          <span className="text-muted-foreground font-medium"> untuk mencapai target dalam {daysRemaining} hari sisa.</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {requiredPerDay === 0 && progress < 100 && (
                     <div className="bg-red-50 border border-red-100 rounded-[28px] p-6 flex items-center gap-6">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                        <p className="text-sm font-bold text-red-900 leading-tight">
                          Waktu habis! Anda telah melewati tenggat waktu. <br/>
                          <span className="text-xs font-medium opacity-70">Sesuaikan deadline atau buat target baru untuk mulai menghitung ulang.</span>
                        </p>
                     </div>
                  )}
                  
                  {progress >= 100 && (
                    <div className="bg-green-50 border border-green-100 rounded-[28px] p-6 flex items-center gap-6">
                      <div className="bg-green-600 text-white p-3 rounded-2xl shadow-lg">
                        <Trophy className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-green-700 tracking-widest mb-1">Target Tercapai!</p>
                        <p className="text-lg font-bold text-green-900">Selamat! Anda telah menguasai kurikulum target ini sepenuhnya. 🏆</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {goals?.length === 0 && (
          <div className="py-32 text-center border-4 border-dashed rounded-[60px] opacity-20 bg-muted/20">
             <Target className="h-24 w-24 mx-auto mb-4" />
             <p className="font-black text-2xl uppercase tracking-tighter">Mulai Buat Target Pertamamu</p>
             <p className="text-xs font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto">Tentukan target belajar dan biarkan sistem memandu ritme harian Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
}

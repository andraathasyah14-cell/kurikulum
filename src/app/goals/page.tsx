
'use client';

import { useState } from 'react';
import { Target, Plus, Trash2, Calendar, Trophy, Flag } from 'lucide-react';
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

  const handleUpdateProgress = (goal: any, delta: number) => {
    if (!user || !db) return;
    const newVal = Math.max(0, goal.currentValue + delta);
    setDoc(doc(db, 'users', user.uid, 'goals', goal.id), {
      currentValue: newVal
    }, { merge: true });
  };

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDoc(doc(db, 'users', user.uid, 'goals', id));
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl">
      <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-5xl font-black tracking-tight mb-2">Set Goals</h1>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" /> Ubah Target Menjadi Kebiasaan
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg gap-2 h-14 px-8 font-black uppercase text-xs">
              <Plus className="h-5 w-5" /> Buat Target Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Setting Goal</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Apa Targetmu?</Label>
                <Input placeholder="Contoh: Belajar UTBK, Selesai Kursus React" value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Jumlah Target</Label>
                  <Input type="number" value={newGoal.targetValue} onChange={(e) => setNewGoal({...newGoal, targetValue: parseInt(e.target.value) || 1})} />
                </div>
                <div className="grid gap-2">
                  <Label>Satuan</Label>
                  <Select value={newGoal.unit} onValueChange={(v: any) => setNewGoal({...newGoal, unit: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Jam">Jam</SelectItem><SelectItem value="Materi">Materi</SelectItem><SelectItem value="Episode">Episode</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Tenggat Waktu (Opsional)</Label>
                <Input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} />
              </div>
            </div>
            <DialogFooter><Button onClick={handleAddGoal} className="w-full">Simpan Goal</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {goals?.map((goal) => {
          const progress = (goal.currentValue / goal.targetValue) * 100;
          return (
            <Card key={goal.id} className="border-none shadow-xl overflow-hidden rounded-[32px] bg-card">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-4 rounded-3xl">
                        <Flag className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-black text-2xl tracking-tighter">{goal.title}</h3>
                        <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Target: {goal.targetValue} {goal.unit}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-black uppercase text-primary">
                        <span>Progress</span>
                        <span>{goal.currentValue} / {goal.targetValue} {goal.unit} ({Math.round(progress)}%)</span>
                      </div>
                      <Progress value={progress} className="h-4 rounded-full" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-muted p-2 rounded-2xl">
                      <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 font-black text-xl" onClick={() => handleUpdateProgress(goal, -1)}>-</Button>
                      <span className="font-black text-xl px-4">{goal.currentValue}</span>
                      <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 font-black text-xl text-primary" onClick={() => handleUpdateProgress(goal, 1)}>+</Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive font-bold uppercase text-[10px]" onClick={() => handleDelete(goal.id)}>Hapus Target</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {goals?.length === 0 && (
          <div className="py-32 text-center border-4 border-dashed rounded-[48px] opacity-20">
             <Target className="h-24 w-24 mx-auto mb-4" />
             <p className="font-black text-2xl uppercase tracking-tighter">Mulai Buat Target Pertamamu</p>
          </div>
        )}
      </div>
    </div>
  );
}

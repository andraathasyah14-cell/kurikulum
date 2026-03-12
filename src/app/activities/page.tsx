
'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, BookOpen, Timer, Layers, ChevronDown, ChevronUp, Share2, Target, Zap } from 'lucide-react';
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

export default function ActivitiesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  
  const [newActivity, setNewActivity] = useState({ 
    title: '', 
    category: '', 
    difficulty: 'Medium',
    durationMinutes: '25',
    deadline: '',
    goalId: 'none'
  });

  const activitiesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'activities'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const logsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'logs'));
  }, [db, user]);

  const goalsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'goals'));
  }, [db, user]);

  const { data: activities } = useCollection(activitiesQuery);
  const { data: logs } = useCollection(logsQuery);
  const { data: goals } = useCollection(goalsQuery);

  const completedActivityIds = useMemo(() => {
    if (!logs) return new Set<string>();
    return new Set(logs.map(l => l.activityId));
  }, [logs]);

  const uniqueCategories = useMemo(() => {
    if (!activities) return [];
    const cats = activities.map(a => a.category).filter(Boolean);
    return Array.from(new Set(cats)).sort();
  }, [activities]);

  const groupedActivities = useMemo(() => {
    if (!activities) return {};
    return activities.reduce((acc, act) => {
      const cat = act.category || 'Materi Umum';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(act);
      return acc;
    }, {} as Record<string, any[]>);
  }, [activities]);

  const handleAddActivity = () => {
    if (!user || !db || !newActivity.title || !newActivity.category) {
      toast({ variant: "destructive", title: "Error", description: "Nama subjek dan materi harus diisi." });
      return;
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'activities'), {
      userId: user.uid,
      title: newActivity.title,
      category: newActivity.category,
      difficulty: newActivity.difficulty,
      durationMinutes: parseInt(newActivity.durationMinutes) || 25,
      deadline: newActivity.deadline || null,
      goalId: newActivity.goalId === 'none' ? null : newActivity.goalId,
      createdAt: serverTimestamp(),
    });
    setNewActivity({ ...newActivity, title: '', goalId: 'none' });
    setIsOpen(false);
    toast({ title: "Berhasil", description: `"${newActivity.title}" ditambahkan ke kurikulum.` });
  };

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDoc(doc(db, 'users', user.uid, 'activities', id));
  };

  return (
    <div className="container px-4 py-8 md:px-6 max-w-5xl">
      <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-5xl font-black tracking-tight mb-2">Knowledge Graph</h1>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary fill-current" /> Peta Penguasaan Kurikulum Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full shadow-lg gap-2 h-14 px-8 font-black uppercase text-xs tracking-widest">
                <Plus className="h-5 w-5" /> Tambah Simpul Materi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Tambah Materi Baru</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Pilih Subjek / Kategori Root</Label>
                  {!isAddingNewCategory && uniqueCategories.length > 0 ? (
                    <div className="flex gap-2">
                      <Select value={newActivity.category} onValueChange={(v) => setNewActivity({...newActivity, category: v})}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder="Pilih subjek" /></SelectTrigger>
                        <SelectContent>{uniqueCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={() => setIsAddingNewCategory(true)}><Plus className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <Input placeholder="Nama subjek baru" value={newActivity.category} onChange={(e) => setNewActivity({...newActivity, category: e.target.value})} />
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Nama Materi (Node)</Label>
                  <Input placeholder="Contoh: Mekanisme Pasar" value={newActivity.title} onChange={(e) => setNewActivity({...newActivity, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Difficulty</Label>
                    <Select value={newActivity.difficulty} onValueChange={(v) => setNewActivity({...newActivity, difficulty: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Waktu (Menit)</Label>
                    <Input type="number" value={newActivity.durationMinutes} onChange={(e) => setNewActivity({...newActivity, durationMinutes: e.target.value})} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Hubungkan ke Target (Goal)</Label>
                  <Select value={newActivity.goalId} onValueChange={(v) => setNewActivity({...newActivity, goalId: v})}>
                    <SelectTrigger><SelectValue placeholder="Pilih Goal (Opsional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada (Materi Bebas)</SelectItem>
                      {goals?.map(goal => (
                        <SelectItem key={goal.id} value={goal.id}>{goal.title} ({goal.unit})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground italic leading-tight">Materi ini akan otomatis menambah progres pada target yang Anda pilih saat selesai.</p>
                </div>
              </div>
              <DialogFooter><Button onClick={handleAddActivity} className="w-full">Simpan ke Peta</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-12">
        {Object.entries(groupedActivities).map(([category, items]) => {
          const completedCount = items.filter(i => completedActivityIds.has(i.id)).length;
          const progress = (completedCount / items.length) * 100;
          return (
            <div key={category} className="relative">
              <div className="flex items-center gap-6 mb-8 group">
                <div className={cn(
                  "h-16 w-16 rounded-[24px] flex items-center justify-center transition-all duration-500 shadow-xl",
                  progress === 100 ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <Layers className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-end gap-3 mb-1">
                    <h2 className="text-3xl font-black tracking-tighter">{category}</h2>
                    <span className="text-[10px] font-black uppercase text-primary mb-1">{Math.round(progress)}% Mastery</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full w-48 overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pl-8 border-l-2 border-dashed border-muted ml-8">
                {items.map((activity) => {
                  const isDone = completedActivityIds.has(activity.id);
                  const linkedGoal = goals?.find(g => g.id === activity.goalId);
                  return (
                    <Card key={activity.id} className={cn(
                      "relative border-none shadow-sm transition-all hover:-translate-y-1 hover:shadow-md group",
                      isDone ? "bg-primary/5 ring-1 ring-primary/20" : "bg-card"
                    )}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className={cn("p-2 rounded-xl", isDone ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => handleDelete(activity.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <h3 className={cn("font-bold text-sm mb-2", isDone && "text-primary")}>{activity.title}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn(
                            "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                            activity.difficulty === 'Hard' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          )}>{activity.difficulty}</span>
                          <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                            <Timer className="h-3 w-3" /> {activity.durationMinutes}m
                          </span>
                          {linkedGoal && (
                            <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Target className="h-2 w-2" /> {linkedGoal.title}
                            </span>
                          )}
                        </div>
                        {isDone && <div className="absolute top-4 right-4"><Zap className="h-4 w-4 text-primary fill-current animate-pulse" /></div>}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {activities?.length === 0 && (
          <div className="py-24 text-center border-4 border-dashed rounded-[40px] opacity-20 bg-muted/20">
             <Layers className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
             <p className="font-black text-2xl uppercase tracking-tighter">Knowledge Graph Masih Kosong</p>
          </div>
        )}
      </div>
    </div>
  );
}

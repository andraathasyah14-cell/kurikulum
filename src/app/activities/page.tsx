'use client';

import { useState } from 'react';
import { Plus, Trash2, BookOpen, Zap, Timer, LayoutList, Layers } from 'lucide-react';
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

export default function ActivitiesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({ 
    title: '', 
    category: '', 
    difficulty: 'Medium',
    durationMinutes: '25',
    deadline: ''
  });

  const activitiesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'activities'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: activities } = useCollection(activitiesQuery);

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
      createdAt: serverTimestamp(),
    });

    setNewActivity({ title: '', category: newActivity.category, difficulty: 'Medium', durationMinutes: '25', deadline: '' });
    setIsOpen(false);
    toast({ title: "Berhasil", description: "Materi baru telah ditambahkan ke checklist." });
  };

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDoc(doc(db, 'users', user.uid, 'activities', id));
    toast({ title: "Dihapus", description: "Materi telah dihapus dari daftar." });
  };

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight">Katalog Subjek</h1>
          <p className="text-muted-foreground text-sm font-medium">Susun rencana belajarmu berdasarkan subjek dan topik materi.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg gap-2">
              <Plus className="h-4 w-4" /> Tambah Materi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Tambah Materi Belajar</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Nama Subjek / Kategori Besar</Label>
                <Input id="category" placeholder="Misal: UTBK Inggris" value={newActivity.category} onChange={(e) => setNewActivity({...newActivity, category: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Nama Materi / Topik Spesifik</Label>
                <Input id="title" placeholder="Misal: Grammar Dasar" value={newActivity.title} onChange={(e) => setNewActivity({...newActivity, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Bobot Kesulitan</Label>
                  <Select value={newActivity.difficulty} onValueChange={(v) => setNewActivity({...newActivity, difficulty: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy (Santai)</SelectItem>
                      <SelectItem value="Medium">Medium (Sedang)</SelectItem>
                      <SelectItem value="Hard">Hard (Padat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Target Durasi (Menit)</Label>
                  <Input id="duration" type="number" value={newActivity.durationMinutes} onChange={(e) => setNewActivity({...newActivity, durationMinutes: e.target.value})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button onClick={handleAddActivity}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {activities?.map((activity) => (
          <Card key={activity.id} className="group overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground",
                  activity.difficulty === 'Hard' ? "text-red-500" : activity.difficulty === 'Easy' ? "text-green-500" : "text-blue-500"
                )}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none">{activity.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-black uppercase items-center">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded flex items-center gap-1">
                      <Layers className="h-3 w-3" /> {activity.category}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded",
                      activity.difficulty === 'Hard' ? "bg-red-100 text-red-700" : 
                      activity.difficulty === 'Easy' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    )}>{activity.difficulty || 'Medium'}</span>
                    <span className="flex items-center gap-1 text-muted-foreground font-bold"><Timer className="h-3 w-3" /> {activity.durationMinutes || 25}m</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive rounded-full hover:bg-destructive/10" onClick={() => handleDelete(activity.id)}><Trash2 className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        ))}
        {activities?.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed rounded-xl opacity-50">
             <LayoutList className="h-12 w-12 mx-auto mb-4" />
             <p className="font-medium">Belum ada daftar materi belajar.</p>
          </div>
        )}
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { Plus, Trash2, ListChecks, Calendar, Zap } from 'lucide-react';
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
import { format, parseISO, isAfter } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function ActivitiesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({ 
    title: '', 
    category: 'Lainnya', 
    difficulty: 'Medium',
    target: '1',
    deadline: ''
  });

  const activitiesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'activities'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: activities, isLoading } = useCollection(activitiesQuery);

  const handleAddActivity = () => {
    if (!user || !db || !newActivity.title) return;

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'activities'), {
      userId: user.uid,
      title: newActivity.title,
      category: newActivity.category,
      difficulty: newActivity.difficulty,
      targetValue: parseInt(newActivity.target),
      deadline: newActivity.deadline || null,
      createdAt: serverTimestamp(),
    });

    setNewActivity({ title: '', category: 'Lainnya', difficulty: 'Medium', target: '1', deadline: '' });
    setIsOpen(false);
    toast({ title: "Berhasil", description: "Aktivitas baru telah ditambahkan." });
  };

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDoc(doc(db, 'users', user.uid, 'activities', id));
    toast({ title: "Dihapus", description: "Aktivitas telah dihapus." });
  };

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Katalog Aktivitas</h1>
          <p className="text-muted-foreground text-sm font-medium">Definisikan rencana rutinmu di sini.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg gap-2">
              <Plus className="h-4 w-4" /> Tambah Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Aktivitas Baru</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Nama Aktivitas</Label>
                <Input id="title" placeholder="Misal: Belajar NextJS" value={newActivity.title} onChange={(e) => setNewActivity({...newActivity, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Kesulitan</Label>
                  <Select value={newActivity.difficulty} onValueChange={(v) => setNewActivity({...newActivity, difficulty: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy (1pt)</SelectItem>
                      <SelectItem value="Medium">Medium (2pt)</SelectItem>
                      <SelectItem value="Hard">Hard (3pt)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input id="deadline" type="date" value={newActivity.deadline} onChange={(e) => setNewActivity({...newActivity, deadline: e.target.value})} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Kategori</Label>
                <Select value={newActivity.category} onValueChange={(v) => setNewActivity({...newActivity, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kesehatan">Kesehatan</SelectItem>
                    <SelectItem value="Kerja">Kerja</SelectItem>
                    <SelectItem value="Belajar">Belajar</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Zap className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none">{activity.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs font-bold uppercase">
                    <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">{activity.category}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded",
                      activity.difficulty === 'Hard' ? "bg-red-100 text-red-700" : 
                      activity.difficulty === 'Easy' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    )}>{activity.difficulty || 'Medium'}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive rounded-full hover:bg-destructive/10" onClick={() => handleDelete(activity.id)}><Trash2 className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        ))}
        {activities?.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed rounded-xl opacity-50">
             <ListChecks className="h-12 w-12 mx-auto mb-4" />
             <p className="font-medium">Belum ada aktivitas.</p>
          </div>
        )}
      </div>
    </div>
  );
}

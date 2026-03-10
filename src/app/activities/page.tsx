
'use client';

import { useState } from 'react';
import { Plus, Trash2, ListChecks, Settings2, Calendar } from 'lucide-react';
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

export default function ActivitiesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({ 
    title: '', 
    category: 'Lainnya', 
    target: '1',
    deadline: ''
  });

  const activitiesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'activities'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: activities, isLoading } = useCollection(activitiesQuery);

  const handleAddActivity = () => {
    if (!user || !db || !newActivity.title) return;

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'activities'), {
      userId: user.uid,
      title: newActivity.title,
      category: newActivity.category,
      targetValue: parseInt(newActivity.target),
      deadline: newActivity.deadline || null,
      createdAt: serverTimestamp(),
    });

    setNewActivity({ title: '', category: 'Lainnya', target: '1', deadline: '' });
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
          <h1 className="font-headline text-3xl font-bold">Pengaturan Aktivitas</h1>
          <p className="text-muted-foreground text-sm">Kelola daftar rutin yang ingin Anda pantau.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus className="mr-2 h-4 w-4" /> Tambah Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Aktivitas Baru</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Nama Aktivitas</Label>
                <Input 
                  id="title" 
                  placeholder="Misal: Belajar NextJS, Workout" 
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Kategori</Label>
                  <Select 
                    value={newActivity.category} 
                    onValueChange={(v) => setNewActivity({...newActivity, category: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kesehatan">Kesehatan</SelectItem>
                      <SelectItem value="Kerja">Kerja</SelectItem>
                      <SelectItem value="Belajar">Belajar</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deadline">Deadline (Opsional)</Label>
                  <Input 
                    id="deadline" 
                    type="date"
                    value={newActivity.deadline}
                    onChange={(e) => setNewActivity({...newActivity, deadline: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button onClick={handleAddActivity}>Simpan Aktivitas</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Card key={i} className="animate-pulse h-24" />)
        ) : activities?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl border-muted">
            <ListChecks className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">Daftar Masih Kosong</h3>
            <p className="text-sm text-muted-foreground">Belum ada aktivitas yang Anda tambahkan.</p>
          </div>
        ) : (
          activities?.map((activity) => (
            <Card key={activity.id} className="group overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary">
                    <ActivityIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{activity.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span className="bg-muted px-2 py-0.5 rounded-full">{activity.category}</span>
                      {activity.deadline && (
                        <span className={cn(
                          "flex items-center gap-1",
                          isAfter(new Date(), parseISO(activity.deadline)) ? "text-red-500 font-bold" : ""
                        )}>
                          <Calendar className="h-3 w-3" /> 
                          Deadline: {format(parseISO(activity.deadline), 'd MMM yyyy', { locale: idLocale })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(activity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

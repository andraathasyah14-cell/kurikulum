
'use client';

import { useState } from 'react';
import { Plus, Trash2, ListChecks, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

export default function ActivitiesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({ title: '', category: 'Lainnya', target: '1' });

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
      createdAt: serverTimestamp(),
    });

    setNewActivity({ title: '', category: 'Lainnya', target: '1' });
    setIsOpen(false);
    toast({ title: "Berhasil", description: "Aktivitas baru telah ditambahkan." });
  };

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDoc(doc(db, 'users', user.uid, 'activities', id));
    toast({ title: "Dihapus", description: "Aktivitas telah dihapus." });
  };

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Daftar Aktivitas</h1>
          <p className="text-muted-foreground">Kelola semua hal yang ingin Anda pantau.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Aktivitas Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nama Aktivitas</Label>
                <Input 
                  id="title" 
                  placeholder="Contoh: Olahraga, Baca Buku" 
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select 
                    value={newActivity.category} 
                    onValueChange={(v) => setNewActivity({...newActivity, category: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kesehatan">Kesehatan</SelectItem>
                      <SelectItem value="Kerja">Kerja</SelectItem>
                      <SelectItem value="Belajar">Belajar</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target Per Hari</Label>
                  <Input 
                    id="target" 
                    type="number" 
                    min="1" 
                    value={newActivity.target}
                    onChange={(e) => setNewActivity({...newActivity, target: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button onClick={handleAddActivity}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Card key={i} className="animate-pulse h-24" />)
        ) : activities?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-muted p-6">
              <ListChecks className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Belum Ada Aktivitas</h3>
            <p className="text-muted-foreground">Mulai dengan menambahkan aktivitas yang ingin Anda lakukan secara rutin.</p>
          </div>
        ) : (
          activities?.map((activity) => (
            <Card key={activity.id} className="group overflow-hidden">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ListChecks className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{activity.title}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                        {activity.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Target: {activity.targetValue}x per hari
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
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

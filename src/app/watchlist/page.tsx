
'use client';

import { useState } from 'react';
import { Plus, Tv, CheckCircle2, PlayCircle, PauseCircle, Trash2, Edit2, Save, X } from 'lucide-react';
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
import { collection, query, orderBy, serverTimestamp, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function WatchlistPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEpisode, setEditEpisode] = useState<number>(0);

  const [newEntry, setNewEntry] = useState({
    title: '',
    totalEpisodes: 1,
    status: 'Watching' as 'Watching' | 'Completed' | 'Paused'
  });

  const watchlistQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'watchlist'), orderBy('lastWatched', 'desc'));
  }, [db, user]);

  const { data: watchlist, isLoading } = useCollection(watchlistQuery);

  const handleAddEntry = () => {
    if (!user || !db || !newEntry.title) {
      toast({ variant: "destructive", title: "Error", description: "Judul harus diisi." });
      return;
    }

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'watchlist'), {
      userId: user.uid,
      title: newEntry.title,
      totalEpisodes: Number(newEntry.totalEpisodes),
      lastEpisode: 0,
      status: newEntry.status,
      lastWatched: serverTimestamp(),
    });

    setNewEntry({ title: '', totalEpisodes: 1, status: 'Watching' });
    setIsOpen(false);
    toast({ title: "Ditambahkan", description: `"${newEntry.title}" telah masuk ke daftar tontonan.` });
  };

  const updateEpisode = (entry: any, newEp: number) => {
    if (!user || !db) return;
    const clampedEp = Math.min(Math.max(0, newEp), entry.totalEpisodes);
    const newStatus = clampedEp === entry.totalEpisodes ? 'Completed' : entry.status;

    setDoc(doc(db, 'users', user.uid, 'watchlist', entry.id), {
      lastEpisode: clampedEp,
      status: newStatus,
      lastWatched: serverTimestamp(),
    }, { merge: true });

    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDoc(doc(db, 'users', user.uid, 'watchlist', id));
    toast({ title: "Dihapus", description: "Film/Series telah dihapus dari daftar." });
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-4xl font-black tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground font-medium">Lacak progres hiburan Anda di sela-sela belajar.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg gap-2 h-12 px-6">
              <Plus className="h-5 w-5" /> Tambah Film/Series
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Tambah ke Watchlist</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul Film / Series</Label>
                <Input
                  id="title"
                  placeholder="Contoh: Breaking Bad, Inception"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="episodes">Total Episode</Label>
                  <Input
                    id="episodes"
                    type="number"
                    value={newEntry.totalEpisodes}
                    onChange={(e) => setNewEntry({ ...newEntry, totalEpisodes: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Status Awal</Label>
                  <Select value={newEntry.status} onValueChange={(v: any) => setNewEntry({ ...newEntry, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Watching">Watching</SelectItem>
                      <SelectItem value="Paused">Paused</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button onClick={handleAddEntry}>Simpan Daftar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {watchlist?.map((entry) => {
          const progress = (entry.lastEpisode / entry.totalEpisodes) * 100;
          const isEditing = editingId === entry.id;

          return (
            <Card key={entry.id} className="border-none shadow-sm overflow-hidden bg-card">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        entry.status === 'Completed' ? "bg-green-100 text-green-700" :
                        entry.status === 'Paused' ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                      )}>
                        {entry.status === 'Completed' ? <CheckCircle2 className="h-5 w-5" /> :
                         entry.status === 'Paused' ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-black text-xl leading-tight">{entry.title}</h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                          {entry.status} • {entry.lastEpisode} / {entry.totalEpisodes} Episode
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full">
                        <Input
                          type="number"
                          className="w-16 h-8 text-center bg-transparent border-none font-bold"
                          value={editEpisode}
                          onChange={(e) => setEditEpisode(parseInt(e.target.value) || 0)}
                          autoFocus
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-primary text-primary-foreground" onClick={() => updateEpisode(entry, editEpisode)}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="rounded-full gap-2 font-bold uppercase text-xs" onClick={() => {
                        setEditingId(entry.id);
                        setEditEpisode(entry.lastEpisode);
                      }}>
                        <Edit2 className="h-3.5 w-3.5" /> Update Eps
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-destructive rounded-full hover:bg-destructive/10" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {watchlist?.length === 0 && (
          <div className="py-24 text-center border-2 border-dashed rounded-3xl opacity-50 bg-muted/20">
             <Tv className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
             <p className="font-bold text-xl mb-1">Watchlist Kosong</p>
             <p className="text-muted-foreground text-sm">Tambahkan hiburan favorit Anda untuk menyegarkan pikiran.</p>
          </div>
        )}
      </div>
    </div>
  );
}

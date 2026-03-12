
'use client';

import { useState, useMemo } from 'react';
import { Plus, Tv, CheckCircle2, PlayCircle, PauseCircle, Trash2, Edit2, Save, X, ListVideo, Film, CheckCircle } from 'lucide-react';
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

  const stats = useMemo(() => {
    if (!watchlist) return { total: 0, watching: 0, completed: 0, paused: 0 };
    return {
      total: watchlist.length,
      watching: watchlist.filter(i => i.status === 'Watching').length,
      completed: watchlist.filter(i => i.status === 'Completed').length,
      paused: watchlist.filter(i => i.status === 'Paused').length,
    };
  }, [watchlist]);

  const handleAddEntry = () => {
    if (!user || !db || !newEntry.title) {
      toast({ variant: "destructive", title: "Error", description: "Judul harus diisi." });
      return;
    }

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'watchlist'), {
      userId: user.uid,
      title: newEntry.title,
      totalEpisodes: Number(newEntry.totalEpisodes),
      lastEpisode: newEntry.status === 'Completed' ? Number(newEntry.totalEpisodes) : 0,
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
    <div className="container px-4 py-8 md:px-6 max-w-4xl pb-24">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-4xl font-black tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground font-medium">Lacak hiburan Anda sebagai penyeimbang belajar.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg gap-2 h-12 px-6 font-bold uppercase text-xs tracking-widest">
              <Plus className="h-5 w-5" /> Tambah Daftar
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
                  <Label>Status</Label>
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
              <Button onClick={handleAddEntry}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ListVideo} label="Total" value={stats.total} color="bg-blue-50 text-blue-600" />
        <StatCard icon={PlayCircle} label="Watching" value={stats.watching} color="bg-primary/10 text-primary" />
        <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="bg-green-50 text-green-600" />
        <StatCard icon={PauseCircle} label="Paused" value={stats.paused} color="bg-amber-50 text-amber-600" />
      </div>

      <div className="space-y-4">
        {watchlist?.map((entry) => {
          const isCompleted = entry.status === 'Completed';
          const progress = (entry.lastEpisode / entry.totalEpisodes) * 100;
          const isEditing = editingId === entry.id;

          return (
            <Card key={entry.id} className={cn(
              "border-none shadow-sm overflow-hidden transition-all",
              isCompleted ? "bg-muted/30 opacity-80" : "bg-card"
            )}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-xl",
                        isCompleted ? "bg-green-100 text-green-700" :
                        entry.status === 'Paused' ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                      )}>
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> :
                         entry.status === 'Paused' ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className={cn("font-black text-xl leading-tight truncate", isCompleted && "text-muted-foreground")}>
                          {entry.title}
                        </h3>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          {entry.status} {!isCompleted && `• ${entry.lastEpisode}/${entry.totalEpisodes} Eps`}
                        </p>
                      </div>
                    </div>

                    {!isCompleted && (
                      <div className="space-y-1">
                        <Progress value={progress} className="h-1.5" />
                        <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground/60">
                          <span>Progres Menonton</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                      </div>
                    )}
                    
                    {isCompleted && (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-tight">
                         <Film className="h-3 w-3" /> Laporan: {entry.totalEpisodes} Episode Selesai
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 justify-end">
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
                      !isCompleted && (
                        <Button variant="outline" size="sm" className="rounded-full gap-2 font-bold uppercase text-[10px] h-9" onClick={() => {
                          setEditingId(entry.id);
                          setEditEpisode(entry.lastEpisode);
                        }}>
                          <Edit2 className="h-3 w-3" /> Update
                        </Button>
                      )
                    )}
                    <Button variant="ghost" size="icon" className="text-destructive rounded-full hover:bg-destructive/10 h-9 w-9" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {watchlist?.length === 0 && (
          <div className="py-24 text-center border-4 border-dashed rounded-[40px] opacity-20 bg-muted/20">
             <Tv className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
             <p className="font-black text-xl uppercase tracking-tighter">Watchlist Kosong</p>
             <p className="text-muted-foreground text-xs mt-2 uppercase font-bold">Hiburan adalah bagian dari produktivitas.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  return (
    <Card className="border-none shadow-sm bg-card">
      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
        <div className={cn("p-2 rounded-xl mb-2", color)}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-lg font-black">{value}</p>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{label}</p>
      </CardContent>
    </Card>
  );
}

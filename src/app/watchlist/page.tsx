'use client';

import { useState, useMemo } from 'react';
import { Plus, Tv, CheckCircle2, PlayCircle, PauseCircle, Trash2, Edit2, Save, X, ListVideo, Film, CheckCircle, Info } from 'lucide-react';
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
    const trimmedTitle = newEntry.title.trim();
    if (!user || !db || !trimmedTitle) {
      toast({ variant: "destructive", title: "Input Salah", description: "Silakan masukkan judul film atau series." });
      return;
    }

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'watchlist'), {
      userId: user.uid,
      title: trimmedTitle,
      totalEpisodes: Number(newEntry.totalEpisodes) || 1,
      lastEpisode: newEntry.status === 'Completed' ? Number(newEntry.totalEpisodes) : 0,
      status: newEntry.status,
      lastWatched: serverTimestamp(),
    });

    setNewEntry({ title: '', totalEpisodes: 1, status: 'Watching' });
    setIsOpen(false);
    toast({ title: "Berhasil!", description: `"${trimmedTitle}" telah ditambahkan ke daftar.` });
  };

  const updateEpisode = (entry: any, newEp: number) => {
    if (!user || !db) return;
    const clampedEp = Math.min(Math.max(0, newEp), entry.totalEpisodes);
    const isNowCompleted = clampedEp === entry.totalEpisodes;
    const newStatus = isNowCompleted ? 'Completed' : entry.status;

    setDoc(doc(db, 'users', user.uid, 'watchlist', entry.id), {
      lastEpisode: clampedEp,
      status: newStatus,
      lastWatched: serverTimestamp(),
    }, { merge: true });

    setEditingId(null);
    toast({ title: "Updated", description: isNowCompleted ? `${entry.title} Selesai!` : `Episode ${clampedEp} tercatat.` });
  };

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDoc(doc(db, 'users', user.uid, 'watchlist', id));
    toast({ title: "Dihapus", description: "Item telah dihapus dari daftar." });
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="container px-4 py-8 md:px-6 max-w-5xl pb-32">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-5xl font-black tracking-tight mb-2">Watchlist</h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
            <Tv className="h-4 w-4 text-primary" /> Penyeimbang Produktivitas & Hiburan
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg gap-3 h-14 px-8 font-black uppercase text-xs tracking-widest">
              <Plus className="h-5 w-5" /> Tambah Watchlist
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Daftar Tontonan Baru</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="font-black text-[10px] uppercase tracking-widest">Judul Film / Series</Label>
                <Input
                  id="title"
                  placeholder="Contoh: Breaking Bad, Inception"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="episodes" className="font-black text-[10px] uppercase tracking-widest">Total Episode</Label>
                  <Input
                    id="episodes"
                    type="number"
                    min="1"
                    value={newEntry.totalEpisodes}
                    onChange={(e) => setNewEntry({ ...newEntry, totalEpisodes: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest">Status Awal</Label>
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
              <Button onClick={handleAddEntry} className="w-full h-12 font-black uppercase text-xs">Simpan ke Daftar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatCard icon={ListVideo} label="Total Koleksi" value={stats.total} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={PlayCircle} label="Sedang Ditonton" value={stats.watching} color="bg-primary/10 text-primary" />
        <StatCard icon={CheckCircle} label="Sudah Selesai" value={stats.completed} color="bg-green-50 text-green-600" />
        <StatCard icon={PauseCircle} label="Dijeda (Paused)" value={stats.paused} color="bg-amber-50 text-amber-600" />
      </div>

      <div className="space-y-6">
        {watchlist?.map((entry) => {
          const isCompleted = entry.status === 'Completed';
          const progress = (entry.lastEpisode / entry.totalEpisodes) * 100;
          const isEditing = editingId === entry.id;

          return (
            <Card key={entry.id} className={cn(
              "border-none shadow-xl overflow-hidden rounded-[32px] transition-all duration-300",
              isCompleted ? "bg-muted/30 opacity-70" : "bg-card hover:translate-x-1"
            )}>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex-1 space-y-5">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors",
                        isCompleted ? "bg-green-100 text-green-700" :
                        entry.status === 'Paused' ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary shadow-inner"
                      )}>
                        {isCompleted ? <CheckCircle2 className="h-7 w-7" /> :
                         entry.status === 'Paused' ? <PauseCircle className="h-7 w-7" /> : <PlayCircle className="h-7 w-7" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className={cn("font-black text-2xl tracking-tighter leading-none mb-1", isCompleted && "text-muted-foreground line-through")}>
                          {entry.title}
                        </h3>
                        <div className="flex items-center gap-2">
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                             isCompleted ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                           )}>
                             {entry.status}
                           </span>
                           {!isCompleted && (
                             <span className="text-[9px] font-bold text-muted-foreground">
                               Episode {entry.lastEpisode} / {entry.totalEpisodes}
                             </span>
                           )}
                        </div>
                      </div>
                    </div>

                    {!isCompleted ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-primary">
                          <span>Progress Menonton</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2 rounded-full" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 w-fit px-3 py-1 rounded-lg">
                         <Film className="h-3.5 w-3.5" /> Laporan: {entry.totalEpisodes} Episode Selesai Dikonfirmasi
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 justify-end">
                    {isEditing ? (
                      <div className="flex items-center gap-2 bg-muted p-2 rounded-2xl shadow-inner animate-in fade-in zoom-in-95">
                        <Input
                          type="number"
                          className="w-20 h-10 text-center bg-transparent border-none font-black text-lg"
                          value={editEpisode}
                          onChange={(e) => setEditEpisode(parseInt(e.target.value) || 0)}
                          autoFocus
                        />
                        <Button size="icon" className="h-10 w-10 rounded-xl bg-primary shadow-lg" onClick={() => updateEpisode(entry, editEpisode)}>
                          <Save className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl" onClick={() => setEditingId(null)}>
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    ) : (
                      !isCompleted && (
                        <Button variant="secondary" size="sm" className="rounded-full gap-2 font-black uppercase text-[10px] h-10 px-6 shadow-sm hover:bg-primary hover:text-white transition-all" onClick={() => {
                          setEditingId(entry.id);
                          setEditEpisode(entry.lastEpisode);
                        }}>
                          <Edit2 className="h-3.5 w-3.5" /> Update Eps
                        </Button>
                      )
                    )}
                    <Button variant="ghost" size="icon" className="text-destructive rounded-full hover:bg-destructive/10 h-10 w-10" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {watchlist?.length === 0 && (
          <div className="py-32 text-center border-4 border-dashed rounded-[60px] opacity-20 bg-muted/20">
             <ListVideo className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
             <p className="font-black text-3xl uppercase tracking-tighter">Watchlist Kosong</p>
             <p className="text-muted-foreground text-sm mt-2 uppercase font-bold max-w-xs mx-auto">
               Input film atau series favoritmu sebagai pengingat waktu istirahat.
             </p>
          </div>
        )}
      </div>

      <div className="mt-20 p-10 bg-primary/5 rounded-[48px] border border-primary/10 flex items-start gap-6">
         <Info className="h-10 w-10 text-primary shrink-0" />
         <div>
            <h4 className="font-black text-lg mb-2">Philosophy of Balance</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kami menyertakan Watchlist bukan untuk mengalihkan fokus, tapi sebagai <strong>Laporan Keseimbangan</strong>. 
              Siswa yang hebat tahu kapan harus belajar keras dan kapan harus mengistirahatkan pikiran. 
              Lacak hiburanmu di sini agar kamu tetap sadar akan penggunaan waktumu.
            </p>
         </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  return (
    <Card className="border-none shadow-xl bg-card rounded-[32px] overflow-hidden group">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <div className={cn("p-4 rounded-2xl mb-3 transition-transform duration-300 group-hover:scale-110", color)}>
          <Icon className="h-6 w-6" />
        </div>
        <p className="text-3xl font-black tracking-tight">{value}</p>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

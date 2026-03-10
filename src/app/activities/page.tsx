'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, BookOpen, Timer, Layers, ChevronDown, ChevronUp, Check, Hash } from 'lucide-react';
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  
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

  // Get unique categories for selection
  const uniqueCategories = useMemo(() => {
    if (!activities) return [];
    const cats = activities.map(a => a.category).filter(Boolean);
    return Array.from(new Set(cats)).sort();
  }, [activities]);

  // Grouping activities by category
  const groupedActivities = useMemo(() => {
    if (!activities) return {};
    return activities.reduce((acc, act) => {
      const cat = act.category || 'Materi Umum';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(act);
      return acc;
    }, {} as Record<string, any[]>);
  }, [activities]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

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

    setNewActivity({ ...newActivity, title: '' }); // Keep category for easier batch adding
    setIsOpen(false);
    setIsAddingNewCategory(false);
    toast({ title: "Berhasil", description: `Materi "${newActivity.title}" ditambahkan ke ${newActivity.category}.` });
  };

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDoc(doc(db, 'users', user.uid, 'activities', id));
    toast({ title: "Dihapus", description: "Materi telah dihapus." });
  };

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-4xl font-black tracking-tight">Katalog Kurikulum</h1>
          <p className="text-muted-foreground text-sm font-medium">Kelola kategori subjek dan detail materi belajar Anda.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setIsAddingNewCategory(false);
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg gap-2 h-12 px-6">
              <Plus className="h-5 w-5" /> Tambah Materi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Tambah Materi Belajar</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Pilih Subjek / Kategori</Label>
                
                {!isAddingNewCategory && uniqueCategories.length > 0 ? (
                  <div className="flex gap-2">
                    <Select 
                      value={newActivity.category} 
                      onValueChange={(v) => setNewActivity({...newActivity, category: v})}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Pilih subjek yang ada" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => {
                      setIsAddingNewCategory(true);
                      setNewActivity({...newActivity, category: ''});
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        id="category" 
                        placeholder="Masukkan nama subjek baru" 
                        value={newActivity.category} 
                        onChange={(e) => setNewActivity({...newActivity, category: e.target.value})}
                        autoFocus
                      />
                      {uniqueCategories.length > 0 && (
                        <Button variant="outline" size="icon" onClick={() => setIsAddingNewCategory(false)}>
                          <Layers className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">Contoh: UTBK Inggris, Matematika, Biologi.</p>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">Nama Materi / Topik</Label>
                <Input 
                  id="title" 
                  placeholder="Contoh: Noun Clause, Fotosintesis" 
                  value={newActivity.title} 
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tingkat Kesulitan</Label>
                  <Select value={newActivity.difficulty} onValueChange={(v) => setNewActivity({...newActivity, difficulty: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Target Waktu (Menit)</Label>
                  <Input id="duration" type="number" value={newActivity.durationMinutes} onChange={(e) => setNewActivity({...newActivity, durationMinutes: e.target.value})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button onClick={handleAddActivity}>Simpan ke Katalog</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([category, items]) => {
          const isExpanded = !expandedCategories.has(category); // Default expanded
          return (
            <Card key={category} className="border-none shadow-sm overflow-hidden bg-card">
              <CardHeader className="p-0 border-b">
                <button 
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Layers className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black">{category}</CardTitle>
                      <span className="text-xs font-bold text-muted-foreground uppercase">{items.length} Topik Tersedia</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </button>
              </CardHeader>
              {isExpanded && (
                <CardContent className="p-0">
                  <div className="divide-y divide-muted">
                    {items.map((activity) => (
                      <div key={activity.id} className="group flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-bold text-sm">{activity.title}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={cn(
                                "text-[9px] uppercase font-black px-1.5 py-0.5 rounded",
                                activity.difficulty === 'Hard' ? "bg-red-100 text-red-700" : 
                                activity.difficulty === 'Easy' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                              )}>{activity.difficulty || 'Medium'}</span>
                              <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                                <Timer className="h-3 w-3" /> {activity.durationMinutes || 25} menit
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-destructive rounded-full hover:bg-destructive/10 transition-opacity" onClick={() => handleDelete(activity.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {activities?.length === 0 && (
          <div className="py-24 text-center border-2 border-dashed rounded-3xl opacity-50 bg-muted/20">
             <Layers className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
             <p className="font-bold text-xl mb-1">Katalog Masih Kosong</p>
             <p className="text-muted-foreground text-sm">Mulai buat kategori subjek dan tambahkan materi belajar Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
}

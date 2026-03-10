
'use client';

import { useState, useEffect } from 'react';
import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { query, collection, orderBy, where, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Star, NotebookPen, Calendar, Quote, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function JournalPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [detailedContent, setDetailedContent] = useState('');
  const [rating, setRating] = useState(0);

  const reflectionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'reflections'), orderBy('date', 'desc'));
  }, [db, user]);

  const { data: reflections, isLoading } = useCollection(reflectionsQuery);

  const todayReflection = reflections?.find(r => r.date === today);

  useEffect(() => {
    if (todayReflection) {
      setDetailedContent(todayReflection.content || '');
      setRating(todayReflection.productivityRating || 0);
    }
  }, [todayReflection]);

  const handleSaveJournal = () => {
    if (!user || !db || !detailedContent) {
      toast({ variant: "destructive", title: "Error", description: "Isi jurnal terlebih dahulu." });
      return;
    }
    const refId = todayReflection?.id || `${user.uid}_${today}`;
    setDoc(doc(db, 'users', user.uid, 'reflections', refId), {
      userId: user.uid,
      date: today,
      content: detailedContent,
      productivityRating: rating,
      timestamp: serverTimestamp(),
    }, { merge: true });
    toast({ title: "Jurnal Tersimpan", description: "Catatan detail hari ini telah diperbarui." });
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl">
      <div className="mb-10">
        <h1 className="font-headline text-4xl font-black tracking-tight mb-2">Jurnal Belajar</h1>
        <p className="text-muted-foreground font-medium">Tuliskan detail aktivitasmu hari ini secara mendalam.</p>
      </div>

      {/* Write Journal Section */}
      <Card className="mb-12 border-none shadow-md overflow-hidden bg-card">
        <CardHeader className="bg-primary/5 border-b p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary" />
              <div className="text-left">
                <CardTitle className="text-lg font-black uppercase">Jurnal Hari Ini</CardTitle>
                <p className="text-xs font-bold text-muted-foreground">{format(new Date(), 'EEEE, d MMMM yyyy', { locale: idLocale })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground mr-2">Produktivitas:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setRating(s)}
                    className={cn(
                      "p-1 transition-colors",
                      rating >= s ? "text-yellow-500" : "text-muted-foreground opacity-30"
                    )}
                  >
                    <Star className={cn("h-6 w-6", rating >= s && "fill-current")} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-muted-foreground">Detail Aktivitas (Jam, Insight, Materi)</label>
            <Textarea 
              placeholder="08:00 - Belajar Noun Clause... 10:00 - Latihan soal reading... Menurutku hari ini sangat produktif karena..."
              className="min-h-[250px] text-base leading-relaxed p-4 bg-muted/20 border-none focus-visible:ring-primary"
              value={detailedContent}
              onChange={(e) => setDetailedContent(e.target.value)}
            />
          </div>
          <Button className="w-full h-12 rounded-full gap-2 shadow-lg" onClick={handleSaveJournal}>
            <Save className="h-5 w-5" /> Simpan Jurnal Detail
          </Button>
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <NotebookPen className="h-5 w-5 text-primary" /> Riwayat Jurnal
        </h2>
      </div>

      <div className="space-y-6">
        {reflections?.map((ref) => (
          <Card key={ref.id} className="border-none shadow-sm overflow-hidden bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b p-4 bg-muted/20">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-black text-sm uppercase">
                  {format(parseISO(ref.date), 'EEEE, d MMMM yyyy', { locale: idLocale })}
                </span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    className={cn(
                      "h-4 w-4", 
                      (ref.productivityRating || 0) >= s ? "text-yellow-500 fill-current" : "text-muted-foreground opacity-20"
                    )} 
                  />
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-6 relative">
              <Quote className="absolute top-4 right-4 h-12 w-12 text-muted-foreground opacity-5" />
              {ref.shortNote && (
                <div className="mb-4 pb-4 border-b">
                  <span className="text-[10px] font-black uppercase text-primary mb-1 block">Refleksi Singkat / Target:</span>
                  <p className="text-sm font-bold text-muted-foreground">{ref.shortNote}</p>
                </div>
              )}
              {ref.content ? (
                <p className="text-lg leading-relaxed whitespace-pre-wrap font-serif italic">
                  "{ref.content}"
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Belum ada jurnal detail untuk hari ini.</p>
              )}
            </CardContent>
          </Card>
        ))}

        {reflections?.length === 0 && (
          <div className="py-24 text-center border-2 border-dashed rounded-3xl opacity-50 bg-muted/20">
             <NotebookPen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
             <p className="font-bold text-xl mb-1">Riwayat Kosong</p>
             <p className="text-muted-foreground text-sm">Mulai tulis jurnal detail pertamamu di atas.</p>
          </div>
        )}
      </div>
    </div>
  );
}

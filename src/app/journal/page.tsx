
'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { query, collection, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Star, NotebookPen, Calendar, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function JournalPage() {
  const { user } = useUser();
  const db = useFirestore();

  const reflectionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'reflections'), orderBy('date', 'desc'));
  }, [db, user]);

  const { data: reflections, isLoading } = useCollection(reflectionsQuery);

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl">
      <div className="mb-10">
        <h1 className="font-headline text-4xl font-black tracking-tight mb-2">Riwayat Jurnal</h1>
        <p className="text-muted-foreground font-medium">Kumpulan refleksi dan tingkat produktivitas harian Anda.</p>
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
              <p className="text-lg leading-relaxed whitespace-pre-wrap font-serif italic">
                "{ref.content}"
              </p>
              <div className="mt-6 pt-4 border-t flex items-center gap-2">
                <NotebookPen className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Tingkat Produktivitas: {ref.productivityRating || 'N/A'} / 5
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {reflections?.length === 0 && (
          <div className="py-24 text-center border-2 border-dashed rounded-3xl opacity-50 bg-muted/20">
             <NotebookPen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
             <p className="font-bold text-xl mb-1">Jurnal Masih Kosong</p>
             <p className="text-muted-foreground text-sm">Mulai tulis refleksi harian Anda di Dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}

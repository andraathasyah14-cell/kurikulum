import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container px-4 py-8 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="font-headline font-bold">StudyPro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} StudyPro - Mastering your materials.
          </p>
          <nav className="flex gap-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privasi</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Ketentuan</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

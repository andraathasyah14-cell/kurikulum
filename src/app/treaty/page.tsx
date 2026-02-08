import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function TreatyPage() {
  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mb-8 flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <h1 className="font-headline text-4xl font-extrabold md:text-5xl">
            Traktat Pendirian UECD
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Teks hukum lengkap dari Traktat Pendirian UECD.
          </p>
        </div>
        <Button className="mt-4 md:mt-0">
          <Download className="mr-2 h-4 w-4" />
          Unduh PDF
        </Button>
      </div>

      <article className="mx-auto max-w-4xl space-y-8">
        <h2 className="border-b pb-2 font-headline text-2xl font-bold">
          Bab I: Kerangka Konsensus dan Tata Kelola
        </h2>
        <section>
          <h3 className="mb-2 font-headline text-xl font-semibold">
            Pasal 1: Landasan Hukum
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            Traktat UECD ditetapkan sebagai UECD Consensus Version 1.0 yang
            menjadi fondasi hukum dan operasional organisasi. Seluruh kebijakan,
            struktur, dan mekanisme pengambilan keputusan mengacu pada konsensus
            ini. Perubahan hanya dapat dilakukan melalui amandemen traktat atau
            adopsi protokol tambahan dengan persetujuan kolektif.
          </p>
        </section>
        <section>
          <h3 className="mb-2 font-headline text-xl font-semibold">
            Pasal 2: Mekanisme Pengambilan Keputusan
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            Sistem pengambilan keputusan UECD menggunakan mekanisme voting dua
            komponen, yaitu suara negara dan suara berbobot ekonomi, dengan
            ambang batas berbeda untuk keputusan biasa, strategis, dan amandemen
            traktat. Mekanisme ini dirancang untuk mencegah dominasi negara
            besar sekaligus menjaga efektivitas pengambilan keputusan. Hak veto
            diberikan secara terbatas dan tunduk pada evaluasi yudisial.
          </p>
        </section>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          Bab II: Kedaulatan dan Kewenangan
        </h2>
        <section>
          <h3 className="mb-2 font-headline text-xl font-semibold">
            Pasal 3: Batas Kewenangan
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            UECD secara tegas dibatasi sebagai organisasi ekonomi non-militer
            dan tidak memiliki kewenangan politik atau keamanan. Organisasi ini
            tidak menghapus kedaulatan nasional, tidak memaksakan integrasi
            instan, dan menghormati sektor-sektor strategis nasional.
          </p>
        </section>
        <section>
          <h3 className="mb-2 font-headline text-xl font-semibold">
            Pasal 4: Prinsip Integrasi
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            Integrasi ekonomi UECD bersifat bertahap, berbasis persetujuan, dan
            dapat disesuaikan dengan kesiapan masing-masing negara anggota.
            Prinsip ini memastikan legitimasi politik domestik tetap terjaga
            sekaligus memberikan kepastian arah integrasi kawasan.
          </p>
        </section>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          Bab III: Kewajiban
        </h2>
        <section>
          <h3 className="mb-2 font-headline text-xl font-semibold">
            Pasal 5: Kewajiban Negara Anggota
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            Negara anggota berkewajiban meratifikasi traktat, mengadopsi
            regulasi UECD ke dalam hukum nasional secara bertahap, berpartisipasi
            aktif dalam badan organisasi, serta menjaga transparansi dan
            kepatuhan.
          </p>
        </section>
        <section>
          <h3 className="mb-2 font-headline text-xl font-semibold">
            Pasal 6: Kewajiban UECD
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            UECD sebagai institusi berkewajiban menjaga netralitas,
            transparansi, akuntabilitas, dan perlindungan terhadap kepentingan
            negara kecil dan berkembang. UECD juga wajib menyediakan mekanisme
            penyelesaian sengketa yang adil, membuka konsultasi publik untuk
            regulasi strategis, serta mengelola dana kawasan secara profesional
            dan dapat diaudit.
          </p>
        </section>
      </article>
    </div>
  );
}

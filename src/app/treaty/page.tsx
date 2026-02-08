import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function TreatyPage() {
  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mb-8 flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <h1 className="font-headline text-4xl font-extrabold md:text-5xl">
            Kerangka Dasar Pembentukan UECD
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Prinsip, Tujuan, Arsitektur Kelembagaan, dan Mekanisme Tata Kelola
          </p>
        </div>
        <Button className="mt-4 md:mt-0">
          <Download className="mr-2 h-4 w-4" />
          Unduh PDF
        </Button>
      </div>

      <article className="mx-auto max-w-4xl space-y-8">
        <h2 className="border-b pb-2 font-headline text-2xl font-bold">
          Prakata
        </h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Union of Economic Cooperation and Development (UECD) dibentuk
            sebagai kerangka kerja sama ekonomi regional yang bersifat
            sukarela, berbasis aturan, dan berorientasi jangka panjang. UECD
            bertujuan untuk memperkuat ketahanan ekonomi bersama, meningkatkan
            daya saing kolektif, serta mendorong pembangunan berkelanjutan di
            antara negara-negara anggotanya.
          </p>
          <p>
            Kerangka ini dirancang untuk memungkinkan integrasi ekonomi secara
            bertahap dengan tetap menjaga kedaulatan kebijakan ekonomi
            nasional, memastikan pembangunan yang berimbang, serta membangun
            mekanisme koordinasi melalui institusi bersama, harmonisasi
            standar, dan penyelarasan kebijakan strategis.
          </p>
          <p>
            Dokumen Kerangka Dasar ini berfungsi sebagai dokumen rujukan utama
            bagi pengembangan kebijakan sektoral, perjanjian lanjutan, serta
            kemungkinan pembentukan instrumen hukum yang lebih mengikat di
            masa depan.
          </p>
        </div>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          I. Prinsip Dasar UECD
        </h2>
        <section>
          <h3 className="mb-2 font-headline text-xl font-semibold">
            1. Integrasi Ekonomi Bertahap
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            UECD menerapkan pendekatan integrasi ekonomi secara bertahap
            melalui pengurangan hambatan perdagangan, harmonisasi standar
            teknis, dan pengembangan ruang ekonomi bersama guna meningkatkan
            efisiensi, kepastian pasar, dan keterpaduan ekonomi kawasan.
          </p>
        </section>
        <section>
          <h3 className="mb-2 font-headline text-xl font-semibold">
            2. Perlindungan Kedaulatan Ekonomi Nasional
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            Kerja sama dalam UECD dilaksanakan tanpa mengalihkan kewenangan
            utama negara anggota atas kebijakan fiskal, moneter, dan ekonomi
            domestik.
          </p>
        </section>
        <section>
          <h3 className="mb-2 font-headline text-xl font-semibold">
            3. Kesetaraan Antar Negara Anggota
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            UECD berlandaskan prinsip non-dominasi dan kesetaraan kelembagaan.
          </p>
        </section>
        <section>
          <h3 className="mb-2 font-headline text-xl font-semibold">
            4. Pembangunan yang Berimbang dan Inklusif
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            UECD mengembangkan mekanisme untuk mendukung negara dan wilayah
            dengan kapasitas ekonomi lebih rendah.
          </p>
        </section>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          II. Tujuan Strategis UECD
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Menciptakan stabilitas pasar regional, meningkatkan perdagangan dan
          investasi, menyatukan standar, mengembangkan infrastruktur,
          membangun mekanisme pembiayaan, dan memperkuat daya saing global.
        </p>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          III. Mekanisme Integrasi
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Model integrasi tiga tahap: Harmonisasi Awal, Kawasan Perdagangan
          Terpadu, dan Ruang Ekonomi Bersama.
        </p>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          IV. Arsitektur Kelembagaan UECD
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Dewan Tingkat Tinggi, Dewan Menteri, Sekretariat Jenderal, Badan
          Teknis UECD, dan Badan Peradilan UECD.
        </p>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          V. Kerangka Hukum dan Regulasi
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Instrumen dasar, regulasi turunan, dan mekanisme penyelesaian
          sengketa.
        </p>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          VI. Standarisasi dan Sertifikasi
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Proses harmonisasi dan sertifikasi tunggal UECD.
        </p>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          VII. Perdagangan, Tarif, dan Integrasi Pasar
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Sistem tarif, akses pasar, persaingan usaha, dan mobilitas
          investasi.
        </p>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          VIII. Pembiayaan, Utang, dan Pembangunan
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Bank Sentral UECD, Dana Pembangunan dan Kohesi, serta koordinasi
          fiskal.
        </p>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          IX. Tata Kelola, Keanggotaan, dan Evaluasi
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Presidensi bergilir, kategori keanggotaan, dan mekanisme peninjauan.
        </p>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          Penutup
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Kerangka Dasar UECD dirancang sebagai arsitektur kelembagaan yang
          dinamis dan adaptif.
        </p>
      </article>
    </div>
  );
}

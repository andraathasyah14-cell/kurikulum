import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function TreatyPage() {
  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mb-8 flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <h1 className="font-headline text-4xl font-extrabold md:text-5xl">
            WERJIA CONSENSUS
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Kerangka Kebijakan Ekonomi Modern Uni Mirdiy Modern
          </p>
          <p className="text-sm text-muted-foreground">Republik Leiysia - Dokumen Konsensus Kebijakan</p>
        </div>
        <Button className="mt-4 md:mt-0">
          <Download className="mr-2 h-4 w-4" />
          Unduh PDF
        </Button>
      </div>

      <article className="prose prose-lg mx-auto max-w-4xl space-y-8 dark:prose-invert">
        <h2 className="border-b pb-2 font-headline text-2xl font-bold">
          Visi Dasar
        </h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Werjia Consensus merupakan kerangka kebijakan ekonomi modern yang
            dianut oleh negara-negara anggota Uni Mirdiy Modern. Pendekatan ini
            menekankan pertumbuhan ekonomi yang inklusif, adaptif, dan
            berkelanjutan, dengan tetap menghormati mekanisme pasar, kepastian
            hukum, serta kebebasan individu.
          </p>
          <p>
            Negara berperan sebagai fasilitator dan pengawas—bukan pengganti
            pasar—untuk memastikan bahwa pasar berfungsi secara efisien, adil,
            dan stabil dalam jangka panjang.
          </p>
        </div>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          Prinsip Inti
        </h2>
        <ol className="list-decimal space-y-4 pl-6 text-muted-foreground">
          <li>
            <strong>Disiplin Fiskal yang Fleksibel:</strong> Pemerintah menjaga
            defisit dan utang dalam batas berkelanjutan, namun tetap memiliki
            ruang ekspansi fiskal saat krisis ekonomi atau guncangan sistemik.
          </li>
          <li>
            <strong>Investasi Produktif dan Strategis:</strong> Belanja publik
            difokuskan pada infrastruktur, pendidikan, kesehatan, inovasi
            teknologi, dan sektor industri strategis.
          </li>
          <li>
            <strong>Liberalitas Pasar yang Terkontrol:</strong> Pasar menjadi
            mekanisme utama alokasi sumber daya, dengan intervensi negara
            terbatas pada sektor vital dan kegagalan pasar.
          </li>
          <li>
            <strong>Hak Milik dan Kepastian Hukum:</strong> Hak milik dan
            kontrak dilindungi secara kuat, disertai kebijakan persaingan usaha
            dan anti-monopoli.
          </li>
          <li>
            <strong>Keterbukaan Perdagangan Selektif:</strong> Perdagangan
            internasional dilakukan secara bertahap, dengan proteksi sementara
            bagi industri baru dan sektor strategis.
          </li>
          <li>
            <strong>Privatisasi dengan Kendali Negara Strategis:</strong>{' '}
            Privatisasi bersifat parsial dan selektif, dengan kontrol negara
            atas sektor dan aset kritis.
          </li>
          <li>
            <strong>Deregulasi yang Adaptif:</strong> Regulasi bisnis
            disederhanakan tanpa menghilangkan kapasitas negara untuk bertindak
            cepat menghadapi risiko sistemik.
          </li>
          <li>
            <strong>Perlindungan Sosial yang Inklusif:</strong> Negara menjamin
            akses pendidikan, kesehatan, jaminan pengangguran, dan perlindungan
            kelompok rentan.
          </li>
          <li>
            <strong>Tata Kelola dan Transparansi:</strong> Akuntabilitas publik,
            penegakan hukum, dan pemberantasan korupsi menjadi fondasi
            kebijakan.
          </li>
          <li>
            <strong>Partisipasi Publik dan Inovasi Kebijakan:</strong> Kebijakan
            dirancang secara partisipatif dan diuji melalui pendekatan berbasis
            data dan evaluasi berkelanjutan.
          </li>
        </ol>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          Pendekatan Kebijakan
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Pendekatan Werjia Consensus bersifat pragmatis namun berlandaskan
          etika dan keadilan sosial. Keberhasilan ekonomi tidak semata diukur
          dari pertumbuhan PDB, tetapi juga dari distribusi pendapatan,
          stabilitas sosial, dan ketahanan jangka panjang. Negara bertindak
          sebagai fasilitator dan pengawas pasar, memastikan keseimbangan antara
          integrasi global dan penguatan kapasitas ekonomi domestik.
        </p>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          Strategi Implementasi
        </h2>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            Kebijakan makroekonomi adaptif dengan instrumen fiskal dan moneter
            yang fleksibel.
          </li>
          <li>
            Kebijakan industri selektif untuk teknologi maju, energi bersih, dan
            sektor strategis.
          </li>
          <li>
            Pasar modal dan investasi asing terbuka dengan syarat alih teknologi
            dan kepatuhan sosial-lingkungan.
          </li>
          <li>
            Liberalisasi perdagangan bertahap dengan proteksi sementara untuk
            sektor kritis.
          </li>
          <li>
            Investasi jangka panjang pada infrastruktur dan sumber daya manusia.
          </li>
          <li>
            Policy labs dan proyek percontohan sebelum implementasi nasional.
          </li>
          <li>
            Pengelolaan risiko sosial dan politik melalui komunikasi publik dan
            jaring pengaman sosial.
          </li>
        </ul>

        <h2 className="border-b pt-8 pb-2 font-headline text-2xl font-bold">
          Kekuatan Utama
        </h2>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Fleksibel dan relevan bagi negara berkembang maupun ekonomi menengah.</li>
          <li>Menjaga keseimbangan antara pertumbuhan ekonomi, stabilitas sosial, dan inovasi teknologi.</li>
          <li>Menghindari rigiditas ideologis dalam perumusan kebijakan ekonomi.</li>
        </ul>
      </article>
    </div>
  );
}

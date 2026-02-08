import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

export default function AboutPage() {
  return (
    <>
      <div className="container px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-headline text-lg font-semibold text-primary">
            Werjia Consensus
          </p>
          <h1 className="mt-2 font-headline text-4xl font-extrabold md:text-5xl">
            Visi dan Prinsip Inti
          </h1>
        </div>
      </div>
      <article className="container mx-auto max-w-4xl space-y-12 px-4 pb-24 md:px-6">
        <section>
          <h2 className="mb-4 font-headline text-3xl font-bold">Visi Dasar</h2>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>
              Werjia Consensus merupakan kerangka kebijakan ekonomi modern yang
              dianut oleh negara-negara anggota Uni Mirdiy Modern. Pendekatan
              ini menekankan pertumbuhan ekonomi yang inklusif, adaptif, dan
              berkelanjutan, dengan tetap menghormati mekanisme pasar,
              kepastian hukum, serta kebebasan individu.
            </p>
            <p>
              Negara berperan sebagai fasilitator dan pengawas—bukan pengganti
              pasar—untuk memastikan bahwa pasar berfungsi secara efisien, adil,
              dan stabil dalam jangka panjang.
            </p>
          </div>
        </section>

        <div className="relative h-96 w-full overflow-hidden rounded-lg">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
            />
          )}
        </div>

        <section>
          <h2 className="mb-4 font-headline text-3xl font-bold">
            10 Prinsip Inti
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground">
                1. Disiplin Fiskal yang Fleksibel
              </h3>
              <p>
                Pemerintah menjaga defisit dan utang dalam batas berkelanjutan,
                namun tetap memiliki ruang ekspansi fiskal saat krisis ekonomi
                atau guncangan sistemik.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                2. Investasi Produktif dan Strategis
              </h3>
              <p>
                Belanja publik difokuskan pada infrastruktur, pendidikan,
                kesehatan, inovasi teknologi, dan sektor industri strategis.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                3. Liberalitas Pasar yang Terkontrol
              </h3>
              <p>
                Pasar menjadi mekanisme utama alokasi sumber daya, dengan
                intervensi negara terbatas pada sektor vital dan kegagalan
                pasar.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                4. Hak Milik dan Kepastian Hukum
              </h3>
              <p>
                Hak milik dan kontrak dilindungi secara kuat, disertai
                kebijakan persaingan usaha dan anti-monopoli.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                5. Keterbukaan Perdagangan Selektif
              </h3>
              <p>
                Perdagangan internasional dilakukan secara bertahap, dengan
                proteksi sementara bagi industri baru dan sektor strategis.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                6. Privatisasi dengan Kendali Negara Strategis
              </h3>
              <p>
                Privatisasi bersifat parsial dan selektif, dengan kontrol
                negara atas sektor dan aset kritis.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                7. Deregulasi yang Adaptif
              </h3>
              <p>
                Regulasi bisnis disederhanakan tanpa menghilangkan kapasitas
                negara untuk bertindak cepat menghadapi risiko sistemik.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                8. Perlindungan Sosial yang Inklusif
              </h3>
              <p>
                Negara menjamin akses pendidikan, kesehatan, jaminan
                pengangguran, dan perlindungan kelompok rentan.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                9. Tata Kelola dan Transparansi
              </h3>
              <p>
                Akuntabilitas publik, penegakan hukum, dan pemberantasan
                korupsi menjadi fondasi kebijakan.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                10. Partisipasi Publik dan Inovasi Kebijakan
              </h3>
              <p>
                Kebijakan dirancang secara partisipatif dan diuji melalui
                pendekatan berbasis data dan evaluasi berkelanjutan.
              </p>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}

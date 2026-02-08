import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

export default function AboutPage() {
  return (
    <>
      <div className="container px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-headline text-lg font-semibold text-primary">
            Tentang Kami
          </p>
          <h1 className="mt-2 font-headline text-4xl font-extrabold md:text-5xl">
            Membangun Daya Saing Kolektif
          </h1>
        </div>
      </div>
      <article className="container mx-auto max-w-4xl space-y-12 px-4 pb-24 md:px-6">
        <section>
          <h2 className="mb-4 font-headline text-3xl font-bold">
            Pendahuluan Strategis
          </h2>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>
              Union of Economic Cooperation and Development (UECD) dibentuk
              sebagai respons strategis terhadap fragmentasi ekonomi regional,
              meningkatnya ketidakpastian global, serta kebutuhan negara-negara
              kawasan untuk membangun daya saing kolektif tanpa mengorbankan
              kedaulatan nasional. Dalam konteks global yang ditandai oleh
              volatilitas pasar, disrupsi rantai pasok, proteksionisme
              terselubung, dan percepatan transformasi teknologi, pendekatan
              ekonomi unilateral semakin tidak memadai.
            </p>
            <p>
              UECD dirancang sebagai organisasi kerja sama ekonomi multinasional
              non-militer yang berfokus pada integrasi ekonomi bertahap,
              harmonisasi kebijakan, dan pembangunan berimbang. Berbeda dari
              model integrasi ekstrem yang bersifat supranasional penuh, UECD
              mengadopsi prinsip <em>shared rules, not shared sovereignty</em>,
              sehingga memberikan ruang fleksibilitas bagi negara anggota dengan
              tingkat pembangunan dan struktur ekonomi yang beragam.
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
            Visi dan Orientasi Jangka Panjang
          </h2>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>
              Visi UECD adalah mewujudkan kawasan ekonomi yang terintegrasi, adil,
              inovatif, dan berkelanjutan melalui kerja sama multidimensi yang
              memperkuat ketahanan ekonomi, membuka peluang pertumbuhan baru,
              serta memastikan kesejahteraan jangka panjang bagi seluruh negara
              anggota.
            </p>
            <p>
              Orientasi jangka panjang UECD tidak semata-mata mengejar
              pertumbuhan ekonomi kuantitatif, melainkan transformasi struktural
              kawasan menuju sistem ekonomi yang resilien, inklusif, dan adaptif
              terhadap perubahan global. Integrasi ekonomi diposisikan sebagai
              instrumen, bukan tujuan akhir, untuk meningkatkan kualitas
              pembangunan dan daya saing kolektif.
            </p>
          </div>
        </section>
      </article>
    </>
  );
}

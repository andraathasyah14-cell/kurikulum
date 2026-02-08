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
            Kerangka Kerja Sama Ekonomi Regional
          </h1>
        </div>
      </div>
      <article className="container mx-auto max-w-4xl space-y-12 px-4 pb-24 md:px-6">
        <section>
          <h2 className="mb-4 font-headline text-3xl font-bold">
            Prakata
          </h2>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>
              Union of Economic Cooperation and Development (UECD) dibentuk
              sebagai kerangka kerja sama ekonomi regional yang bersifat
              sukarela, berbasis aturan, dan berorientasi jangka panjang. UECD
              bertujuan untuk memperkuat ketahanan ekonomi bersama,
              meningkatkan daya saing kolektif, serta mendorong pembangunan
              berkelanjutan di antara negara-negara anggotanya.
            </p>
            <p>
              Kerangka ini dirancang untuk memungkinkan integrasi ekonomi
              secara bertahap dengan tetap menjaga kedaulatan kebijakan
              ekonomi nasional, memastikan pembangunan yang berimbang, serta
              membangun mekanisme koordinasi melalui institusi bersama,
              harmonisasi standar, dan penyelarasan kebijakan strategis.
            </p>
            <p>
              Dokumen Kerangka Dasar ini berfungsi sebagai dokumen rujukan
              utama bagi pengembangan kebijakan sektoral, perjanjian lanjutan,
              serta kemungkinan pembentukan instrumen hukum yang lebih
              mengikat di masa depan.
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
            Prinsip Dasar UECD
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground">
                1. Integrasi Ekonomi Bertahap
              </h3>
              <p>
                UECD menerapkan pendekatan integrasi ekonomi secara bertahap
                melalui pengurangan hambatan perdagangan, harmonisasi standar
                teknis, dan pengembangan ruang ekonomi bersama guna
                meningkatkan efisiensi, kepastian pasar, dan keterpaduan
                ekonomi kawasan.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                2. Perlindungan Kedaulatan Ekonomi Nasional
              </h3>
              <p>
                Kerja sama dalam UECD dilaksanakan tanpa mengalihkan
                kewenangan utama negara anggota atas kebijakan fiskal, moneter,
                dan ekonomi domestik.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                3. Kesetaraan Antar Negara Anggota
              </h3>
              <p>
                UECD berlandaskan prinsip non-dominasi dan kesetaraan
                kelembagaan.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                4. Pembangunan yang Berimbang dan Inklusif
              </h3>
              <p>
                UECD mengembangkan mekanisme untuk mendukung negara dan
                wilayah dengan kapasitas ekonomi lebih rendah.
              </p>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}

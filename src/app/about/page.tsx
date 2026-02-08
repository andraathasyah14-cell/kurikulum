import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

export default function AboutPage() {
  return (
    <>
      <div className="container px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-headline text-lg font-semibold text-primary">
            Union of Economic Cooperation and Development
          </p>
          <h1 className="mt-2 font-headline text-4xl font-extrabold md:text-5xl">
            Visi, Misi, dan Peran Strategis
          </h1>
        </div>
      </div>
      <article className="container mx-auto max-w-4xl space-y-12 px-4 pb-24 md:px-6">
        <section>
          <h2 className="mb-4 font-headline text-3xl font-bold">Pendahuluan Strategis</h2>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>
             Union of Economic Cooperation and Development (UECD) dibentuk sebagai respons strategis terhadap fragmentasi ekonomi regional, meningkatnya ketidakpastian global, serta kebutuhan negara-negara kawasan untuk membangun daya saing kolektif tanpa mengorbankan kedaulatan nasional.
            </p>
            <p>
             UECD dirancang sebagai organisasi kerja sama ekonomi multinasional non-militer yang berfokus pada integrasi ekonomi bertahap, harmonisasi kebijakan, dan pembangunan berimbang. Berbeda dari model integrasi ekstrem yang bersifat supranasional penuh, UECD mengadopsi prinsip <strong>shared rules, not shared sovereignty</strong>, sehingga memberikan ruang fleksibilitas bagi negara anggota dengan tingkat pembangunan dan struktur ekonomi yang beragam.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-headline text-3xl font-bold">Visi dan Orientasi Jangka Panjang</h2>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>
             Visi UECD adalah mewujudkan kawasan ekonomi yang terintegrasi, adil, inovatif, dan berkelanjutan melalui kerja sama multidimensi yang memperkuat ketahanan ekonomi, membuka peluang pertumbuhan baru, serta memastikan kesejahteraan jangka panjang bagi seluruh negara anggota.
            </p>
             <p>
             Orientasi jangka panjang UECD tidak semata-mata mengejar pertumbuhan ekonomi kuantitatif, melainkan transformasi struktural kawasan menuju sistem ekonomi yang resilien, inklusif, dan adaptif terhadap perubahan global.
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

        <section className="rounded-lg bg-card p-8 text-center shadow-sm">
           <h2 className="mb-4 font-headline text-3xl font-bold">Konsensus Werjia: Fondasi Kebijakan UECD</h2>
           <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Untuk mencapai visinya, UECD beroperasi berdasarkan <strong>Werjia Consensus</strong>, sebuah kerangka kebijakan ekonomi modern yang pragmatis. Konsensus ini menjadi pedoman utama dalam setiap inisiatif dan regulasi yang dikeluarkan UECD.
           </p>
           <Button asChild className="mt-6">
             <Link href="/treaty">
                Jelajahi 10 Prinsip Inti Konsensus Werjia <ArrowRight className="ml-2 h-4 w-4" />
             </Link>
           </Button>
        </section>

        <section>
          <h2 className="mb-4 font-headline text-3xl font-bold">
            6 Peran Strategis UECD
          </h2>
          <div className="grid gap-6 text-lg md:grid-cols-2">
            <div className="rounded-md border bg-card p-6">
              <h3 className="font-semibold text-foreground">1. Policy Coordinator</h3>
              <p className="text-muted-foreground">
                Menyelaraskan kebijakan fiskal, moneter, industri, dan regulasi antarnegara anggota untuk mengurangi friksi kebijakan.
              </p>
            </div>
             <div className="rounded-md border bg-card p-6">
              <h3 className="font-semibold text-foreground">2. Market Integrator</h3>
              <p className="text-muted-foreground">
                Memfasilitasi pengurangan hambatan tarif dan non-tarif, standardisasi teknis, serta sertifikasi tunggal kawasan.
              </p>
            </div>
             <div className="rounded-md border bg-card p-6">
              <h3 className="font-semibold text-foreground">3. Economic Stability Anchor</h3>
              <p className="text-muted-foreground">
                Menyediakan sistem pemantauan makroekonomi dan mekanisme stabilisasi krisis.
              </p>
            </div>
             <div className="rounded-md border bg-card p-6">
              <h3 className="font-semibold text-foreground">4. Development Equalizer</h3>
              <p className="text-muted-foreground">
                Mengurangi ketimpangan antarnegara melalui Dana Kohesi dan bantuan teknis.
              </p>
            </div>
             <div className="rounded-md border bg-card p-6">
              <h3 className="font-semibold text-foreground">5. Innovation and Technology Catalyst</h3>
              <p className="text-muted-foreground">
                Mempercepat riset bersama dan transformasi digital di seluruh kawasan.
              </p>
            </div>
            <div className="rounded-md border bg-card p-6">
              <h3 className="font-semibold text-foreground">6. Collective Economic Diplomat</h3>
              <p className="text-muted-foreground">
                Memperjuangkan kepentingan ekonomi kawasan di tingkat global secara kolektif.
              </p>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}

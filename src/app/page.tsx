import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Landmark,
  Scale,
  ShieldCheck,
  Globe,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const heroImage = PlaceHolderImages.find(p => p.id === 'hero');
const investmentImage = PlaceHolderImages.find(p => p.id === 'sector-investment');
const tradeImage = PlaceHolderImages.find(p => p.id === 'sector-trade');
const socialImage = PlaceHolderImages.find(p => p.id === 'sector-social');

const stats = [
  {
    value: '11',
    label: 'Misi Utama',
    icon: Landmark,
  },
  {
    value: '6',
    label: 'Peran Strategis',
    icon: Scale,
  },
  {
    value: '20 th',
    label: 'Roadmap Integrasi',
    icon: Globe,
  },
  {
    value: '1',
    label: 'Konsensus Inti',
    icon: ShieldCheck,
  },
];

const sectors = [
  {
    title: 'Integrasi Pasar & Investasi',
    description:
      'Memfasilitasi arus modal, standardisasi teknis, dan pengurangan hambatan untuk pertumbuhan bersama.',
    image: investmentImage,
    href: '/about',
  },
  {
    title: 'Inovasi dan Konektivitas',
    description:
      'Mendorong kebijakan industri berbasis inovasi, transformasi digital, dan pembangunan infrastruktur.',
    image: tradeImage,
    href: '/about',
  },
  {
    title: 'Pembangunan Inklusif & Tata Kelola',
    description:
      'Menjamin pemerataan pembangunan, stabilitas ekonomi, dan supremasi hukum yang transparan.',
    image: socialImage,
    href: '/about',
  },
];

export default function Home() {
  return (
    <>
      <section className="relative flex h-[60vh] w-full items-center justify-center text-center text-primary-foreground md:h-[80vh]">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 mx-auto max-w-4xl p-4">
          <h1 className="font-headline text-4xl font-extrabold leading-tight drop-shadow-md md:text-6xl">
            Union of Economic Cooperation and Development (UECD)
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg drop-shadow md:text-xl">
            Mewujudkan kawasan ekonomi yang terintegrasi, adil, inovatif, dan berkelanjutan melalui kerja sama yang memperkuat ketahanan dan membuka peluang pertumbuhan baru.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/about">
                Pelajari UECD
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-accent"
              asChild
            >
              <Link href="/treaty">Baca Konsensus Werjia</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-card py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-4">
                <stat.icon className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-headline text-3xl font-bold md:text-4xl">
              Pilar Operasional UECD
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              UECD dibangun di atas pilar-pilar strategis untuk mencapai transformasi struktural kawasan yang resilien, inklusif, dan adaptif.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sectors.map(sector => (
              <Card key={sector.title} className="group overflow-hidden">
                <div className="relative h-56 w-full">
                  {sector.image && (
                    <Image
                      src={sector.image.imageUrl}
                      alt={sector.image.description}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={sector.image.imageHint}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="font-headline">{sector.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-muted-foreground">
                    {sector.description}
                  </p>
                  <Button variant="link" className="p-0" asChild>
                    <Link href={sector.href}>
                      Selengkapnya <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-12 bg-card py-12 md:py-24 lg:grid-cols-2">
        <div className="container px-4 md:px-6">
          <h2 className="mb-4 font-headline text-3xl font-bold">
            Berita & Informasi Terbaru
          </h2>
          <div className="space-y-4">
            <NewsItem
              date="26 Oktober 2024"
              title="UECD Summit: Pemimpin Negara Anggota Bahas Roadmap Integrasi Tahap II"
            />
            <NewsItem
              date="22 Oktober 2024"
              title="Badan Teknis UECD Rilis Standar Baru untuk Perdagangan Digital"
            />
            <NewsItem
              date="18 Oktober 2024"
              title="UECD Luncurkan Dana Kohesi untuk Proyek Infrastruktur Lintas Batas"
            />
          </div>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/news">Lihat Semua Berita <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="container px-4 md:px-6">
          <h2 className="mb-4 font-headline text-3xl font-bold">
            Laporan Unggulan
          </h2>
          <div className="space-y-4">
            <ReportItem
              title="Laporan Stabilitas Ekonomi Kawasan UECD 2024"
              description="Analisis komprehensif kesehatan makroekonomi kawasan."
            />
            <ReportItem
              title="Indeks Daya Saing Digital UECD 2024"
              description="Melacak kemajuan transformasi digital di negara anggota."
            />
            <ReportItem
              title="Peta Jalan Pembangunan Berkelanjutan UECD"
              description="Evaluasi implementasi target keberlanjutan lingkungan."
            />
          </div>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/data">Buka Data & Laporan <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function NewsItem({ date, title }: { date: string; title: string }) {
  return (
    <div className="border-b pb-4">
      <p className="text-sm text-muted-foreground">{date}</p>
      <h3 className="cursor-pointer font-semibold transition-colors hover:text-primary">
        {title}
      </h3>
    </div>
  );
}

function ReportItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b pb-4">
      <h3 className="cursor-pointer font-semibold transition-colors hover:text-primary">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

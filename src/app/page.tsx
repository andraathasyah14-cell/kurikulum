import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Landmark,
  Ship,
  Workflow,
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
const energyImage = PlaceHolderImages.find(p => p.id === 'sector-energy');
const tradeImage = PlaceHolderImages.find(p => p.id === 'sector-trade');
const techImage = PlaceHolderImages.find(p => p.id === 'sector-tech');

const stats = [
  {
    value: '25',
    label: 'Negara Anggota',
    icon: Landmark,
  },
  {
    value: '$45T',
    label: 'PDB Kolektif',
    icon: BarChart3,
  },
  {
    value: '$18T',
    label: 'Volume Perdagangan Tahunan',
    icon: Ship,
  },
  {
    value: '2045',
    label: 'Peta Jalan Integrasi',
    icon: Workflow,
  },
];

const sectors = [
  {
    title: 'Perdagangan dan Konektivitas',
    description:
      'Memfasilitasi pengurangan hambatan tarif dan non-tarif untuk menciptakan pasar tunggal yang dinamis.',
    image: tradeImage,
    href: '/sectors/trade',
  },
  {
    title: 'Inovasi dan Teknologi',
    description:
      'Mempercepat riset bersama dan transformasi digital untuk meningkatkan daya saing kawasan.',
    image: techImage,
    href: '/sectors/technology',
  },
  {
    title: 'Ketahanan Pangan & Energi',
    description:
      'Menjamin ketersediaan pangan dan energi yang berkelanjutan bagi seluruh negara anggota.',
    image: energyImage,
    href: '/sectors/energy',
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
            Mewujudkan Kawasan Ekonomi yang Terintegrasi, Adil, Inovatif, dan
            Berkelanjutan
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg drop-shadow md:text-xl">
            UECD dibentuk sebagai respons strategis terhadap fragmentasi ekonomi
            regional dan ketidakpastian global, bertujuan membangun daya saing
            kolektif tanpa mengorbankan kedaulatan nasional.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/about">
                Jelajahi Misi Kami
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-accent"
              asChild
            >
              <Link href="/treaty">Baca Traktat</Link>
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
              Sektor Kebijakan Inti
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              Pekerjaan UECD diatur dalam sektor-sektor kunci yang penting untuk
              pertumbuhan ekonomi dan integrasi regional.
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
              date="26 Oktober 2023"
              title="KTT UECD Diakhiri dengan Perjanjian Penting tentang Perdagangan Digital"
            />
            <NewsItem
              date="22 Oktober 2023"
              title="Proyek Dana Kohesi Baru Diumumkan untuk Pembangunan Infrastruktur"
            />
            <NewsItem
              date="18 Oktober 2023"
              title="Konsultasi Publik Dibuka untuk Peta Jalan Netralitas Iklim 2035"
            />
          </div>
          <Button variant="outline" className="mt-6">
            Lihat Semua Berita <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="container px-4 md:px-6">
          <h2 className="mb-4 font-headline text-3xl font-bold">
            Laporan Unggulan
          </h2>
          <div className="space-y-4">
            <ReportItem
              title="Prospek Ekonomi Tahunan 2023"
              description="Analisis komprehensif wilayah ekonomi UECD."
            />
            <ReportItem
              title="Indeks Integrasi Regional 2023"
              description="Melacak kemajuan menuju pasar yang terintegrasi penuh."
            />
            <ReportItem
              title="Masa Depan Ketenagakerjaan di UECD"
              description="Penilaian kebijakan tentang transformasi pasar kerja."
            />
          </div>
          <Button variant="outline" className="mt-6">
            Buka Data & Laporan <ArrowRight className="ml-2 h-4 w-4" />
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

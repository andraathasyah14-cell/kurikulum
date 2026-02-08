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
import { Translate } from '@/components/translate';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const heroImage = PlaceHolderImages.find(p => p.id === 'hero');
const energyImage = PlaceHolderImages.find(p => p.id === 'sector-energy');
const tradeImage = PlaceHolderImages.find(p => p.id === 'sector-trade');
const techImage = PlaceHolderImages.find(p => p.id === 'sector-tech');

const stats = [
  {
    value: '25',
    label: 'Member States',
    icon: Landmark,
  },
  {
    value: '$45T',
    label: 'Collective GDP',
    icon: BarChart3,
  },
  {
    value: '$18T',
    label: 'Annual Trade Volume',
    icon: Ship,
  },
  {
    value: '2045',
    label: 'Integration Roadmap',
    icon: Workflow,
  },
];

const sectors = [
  {
    title: 'Energy & Climate',
    description:
      'Pioneering a sustainable energy transition and robust climate action for a resilient future.',
    image: energyImage,
    href: '/sectors/energy',
  },
  {
    title: 'Trade & Market Access',
    description:
      'Fostering a seamless single market with standardized regulations and open trade policies.',
    image: tradeImage,
    href: '/sectors/trade',
  },
  {
    title: 'Technology & Digital',
    description:
      'Driving the digital transformation to enhance competitiveness and innovation across the Union.',
    image: techImage,
    href: '/sectors/technology',
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
            <Translate>
              Building an Integrated, Open, and Sustainable Economic Space
            </Translate>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg drop-shadow md:text-xl">
            <Translate>
              The Union of Economic Cooperation and Development (UECD) is
              committed to fostering regional economic integration, promoting
              sustainable development, and ensuring financial stability for all
              its member states.
            </Translate>
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/about">
                <Translate>Discover Our Mission</Translate>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-accent"
              asChild
            >
              <Link href="/treaty">
                <Translate>Read the Treaty</Translate>
              </Link>
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
                  <p className="text-sm text-muted-foreground">
                    <Translate>{stat.label}</Translate>
                  </p>
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
              <Translate>Core Policy Sectors</Translate>
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              <Translate>
                UECD&apos;s work is organized around key sectors essential for
                economic growth and regional integration.
              </Translate>
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
                  <CardTitle className="font-headline">
                    <Translate>{sector.title}</Translate>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-muted-foreground">
                    <Translate>{sector.description}</Translate>
                  </p>
                  <Button variant="link" className="p-0" asChild>
                    <Link href={sector.href}>
                      <Translate>Learn More</Translate>{' '}
                      <ArrowRight className="ml-1 h-4 w-4" />
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
            <Translate>Latest News & Updates</Translate>
          </h2>
          <div className="space-y-4">
            <NewsItem
              date="October 26, 2023"
              title="UECD Summit Concludes with Landmark Agreement on Digital Trade"
            />
            <NewsItem
              date="October 22, 2023"
              title="New Cohesion Fund Projects Announced for Infrastructure Development"
            />
            <NewsItem
              date="October 18, 2023"
              title="Public Consultation Opens for the 2035 Climate Neutrality Roadmap"
            />
          </div>
          <Button variant="outline" className="mt-6">
            <Translate>View All News</Translate>{' '}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="container px-4 md:px-6">
          <h2 className="mb-4 font-headline text-3xl font-bold">
            <Translate>Featured Reports</Translate>
          </h2>
          <div className="space-y-4">
            <ReportItem
              title="Annual Economic Outlook 2023"
              description="Comprehensive analysis of the UECD economic area."
            />
            <ReportItem
              title="Regional Integration Index 2023"
              description="Tracking progress towards a fully integrated market."
            />
            <ReportItem
              title="The Future of Work in the UECD"
              description="Policy assessment on labor market transformations."
            />
          </div>
          <Button variant="outline" className="mt-6">
            <Translate>Go to Data & Reports</Translate>{' '}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </>
  );
}

function NewsItem({ date, title }: { date: string; title: string }) {
  return (
    <div className="border-b pb-4">
      <p className="text-sm text-muted-foreground">
        <Translate>{date}</Translate>
      </p>
      <h3 className="cursor-pointer font-semibold transition-colors hover:text-primary">
        <Translate>{title}</Translate>
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
        <Translate>{title}</Translate>
      </h3>
      <p className="text-sm text-muted-foreground">
        <Translate>{description}</Translate>
      </p>
    </div>
  );
}

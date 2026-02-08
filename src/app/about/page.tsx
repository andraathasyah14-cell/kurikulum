import { Translate } from '@/components/translate';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

export default function AboutPage() {
  return (
    <>
      <div className="container px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-headline text-lg font-semibold text-primary">
            <Translate>Our Mission</Translate>
          </p>
          <h1 className="mt-2 font-headline text-4xl font-extrabold md:text-5xl">
            <Translate>
              Fostering a prosperous and integrated economic future for all.
            </Translate>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            <Translate>
              The Union of Economic Cooperation and Development (UECD) was founded on
              the principles of open markets, shared democratic values, and a
              commitment to sustainable progress. We work to build a more resilient,
              inclusive, and competitive economic space for our member states.
            </Translate>
          </p>
        </div>
      </div>
      <div className="container max-w-5xl px-4 md:px-6 pb-12 md:pb-24">
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
      </div>
    </>
  );
}

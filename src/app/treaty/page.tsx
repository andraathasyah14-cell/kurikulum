import { Translate } from '@/components/translate';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function TreatyPage() {
  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mb-8 flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <h1 className="font-headline text-4xl font-extrabold md:text-5xl">
            <Translate>Founding Treaty</Translate>
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            <Translate>
              The complete legal text of the UECD Founding Treaty.
            </Translate>
          </p>
        </div>
        <Button className="mt-4 md:mt-0">
          <Download className="mr-2 h-4 w-4" />
          <Translate>Download PDF</Translate>
        </Button>
      </div>

      <article className="mx-auto max-w-4xl space-y-8">
        <h2 className="border-b pb-2 font-headline text-2xl font-bold">
          <Translate>Chapter I: Principles and Objectives</Translate>
        </h2>
        <section>
          <h3 className="mb-2 font-headline text-xl font-semibold">
            <Translate>Article 1: Establishment of the Union</Translate>
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            <Translate>
              By this Treaty, the HIGH CONTRACTING PARTIES establish among
              themselves a UNION OF ECONOMIC COOPERATION AND DEVELOPMENT,
              hereinafter referred to as &apos;the Union&apos;.
            </Translate>
          </p>
        </section>
        <section>
          <h3 className="mb-2 font-headline text-xl font-semibold">
            <Translate>Article 2: Objectives</Translate>
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            <Translate>
              The Union&apos;s objective is to contribute to economic progress
              and world trade expansion on a multilateral, non-discriminatory
              basis by promoting policies designed to achieve the highest
              sustainable economic growth and employment and a rising standard of
              living in Member countries, while maintaining financial stability,
              and thus to contribute to the development of the world economy.
            </Translate>
          </p>
        </section>
        <p className="mt-12 text-center font-style: italic text-muted-foreground">
          (<Translate>Full document text will be displayed here.</Translate>)
        </p>
      </article>
    </div>
  );
}

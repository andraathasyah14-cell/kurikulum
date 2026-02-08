import Link from 'next/link';

import { Logo } from '@/components/logo';
import { Translate } from '@/components/translate';

const footerNav = {
  'About UECD': [
    { label: 'Overview', href: '/about' },
    { label: 'History & Rationale', href: '/about' },
    { label: 'Principles & Values', href: '/about' },
    { label: 'Governance', href: '/governance' },
  ],
  Legal: [
    { label: 'Founding Treaty', href: '/treaty' },
    { label: 'Judicial Board', href: '/governance' },
    { label: 'Transparency', href: '/contact' },
    { label: 'Procurement', href: '/contact' },
  ],
  Resources: [
    { label: 'Data & Reports', href: '/data' },
    { label: 'News', href: '/news' },
    { label: 'Events & Summits', href: '/news' },
    { label: 'Contact Us', href: '/contact' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center gap-2">
              <Logo />
              <span className="font-headline text-lg font-bold">
                <Translate>
                  Union of Economic Cooperation and Development
                </Translate>
              </span>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              <Translate>
                Building an Integrated, Open, and Sustainable Economic Space.
              </Translate>
            </p>
          </div>
          {Object.entries(footerNav).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 font-headline font-semibold">
                <Translate>{title}</Translate>
              </h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Translate>{link.label}</Translate>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()}{' '}
            <Translate>
              Union of Economic Cooperation and Development. All rights
              reserved.
            </Translate>
          </p>
        </div>
      </div>
    </footer>
  );
}

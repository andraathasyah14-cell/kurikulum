'use client';

import { useEffect } from 'react';

import { useLanguage } from '@/context/language-provider';
import { Skeleton } from './ui/skeleton';

export function Translate({ children }: { children: string }) {
  const { language, requestTranslation, getTranslation } = useLanguage();

  useEffect(() => {
    if (children) {
      requestTranslation(children);
    }
  }, [children, language, requestTranslation]);

  if (!children) {
    return null;
  }

  const translatedText = getTranslation(children);

  if (!translatedText) {
    return <Skeleton className="inline-block h-5 w-3/4" />;
  }

  return <>{translatedText}</>;
}

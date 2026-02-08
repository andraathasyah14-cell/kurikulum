'use client';

import { useEffect, useState, useTransition } from 'react';

import { translateWebsiteContent } from '@/ai/flows/translate-website-content';
import { useLanguage } from '@/context/language-provider';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

export function Translate({ children }: { children: string }) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [translatedText, setTranslatedText] = useState(children);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!children) return;
    
    if (language.toLowerCase() === 'english') {
      setTranslatedText(children);
      return;
    }

    startTransition(async () => {
      try {
        const result = await translateWebsiteContent({
          text: children,
          targetLanguage: language,
        });
        setTranslatedText(result.translatedText);
      } catch (error) {
        console.error('Translation failed:', error);
        toast({
          variant: 'destructive',
          title: 'Translation Error',
          description: 'Could not translate content. Please try again later.',
        });
        setTranslatedText(children); // Fallback to original text
      }
    });
  }, [language, children, toast]);

  if (isPending) {
    return <Skeleton className="inline-block h-5 w-3/4" />;
  }

  return <>{translatedText}</>;
}

'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useCallback, useRef, useState } from 'react';
import { translateWebsiteContent } from '@/ai/flows/translate-website-content';
import { useToast } from '@/hooks/use-toast';

// Cache: originalText -> (language -> translatedText)
type TranslationCache = Map<string, Map<string, string>>;

type LanguageContextType = {
  language: string;
  getTranslation: (text: string) => string | undefined;
  requestTranslation: (text: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = 'Indonesian';
  const [translationCache, setTranslationCache] = useState<TranslationCache>(new Map());
  const translationQueue = useRef<Set<string>>(new Set());
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isProcessing = useRef(false);
  const { toast } = useToast();

  const processQueue = useCallback(async () => {
    if (translationQueue.current.size === 0 || isProcessing.current) {
      return;
    }

    isProcessing.current = true;
    const textsToTranslate = Array.from(translationQueue.current);
    translationQueue.current.clear();

    try {
      const result = await translateWebsiteContent({
        texts: textsToTranslate,
        targetLanguage: language,
      });

      setTranslationCache(prevCache => {
        const newCache = new Map(prevCache);
        result.translatedTexts.forEach((translated, index) => {
          const originalText = textsToTranslate[index];
          if (!newCache.has(originalText)) {
            newCache.set(originalText, new Map());
          }
          newCache.get(originalText)!.set(language, translated);
        });
        return newCache;
      });
    } catch (error) {
      console.error('Batch translation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Translation Error',
        description: 'Could not translate some content.',
      });
      // Fallback to original text to avoid infinite loading
      setTranslationCache(prevCache => {
        const newCache = new Map(prevCache);
        textsToTranslate.forEach(originalText => {
          if (!newCache.has(originalText)) {
            newCache.set(originalText, new Map());
          }
          newCache.get(originalText)!.set(language, originalText);
        });
        return newCache;
      });
    } finally {
      isProcessing.current = false;
    }
  }, [language, toast]);

  const requestTranslation = useCallback((text: string) => {
    if (!text) return;
    
    const isCached = translationCache.has(text) && translationCache.get(text)!.has(language);
    if (isCached) return;

    translationQueue.current.add(text);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(processQueue, 50);
  }, [language, processQueue, translationCache]);
  
  const getTranslation = useCallback((text: string): string | undefined => {
    return translationCache.get(text)?.get(language);
  }, [language, translationCache]);

  const value = { language, getTranslation, requestTranslation };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

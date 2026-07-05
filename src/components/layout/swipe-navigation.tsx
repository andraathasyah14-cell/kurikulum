
'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const ROUTES = [
  '/',
  '/activities',
  '/schedule',
  '/stats',
  '/calendar',
  '/ranking',
  '/settings',
];

export function SwipeNavigation({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum distance for a swipe to be registered
  const minSwipeDistance = 70;

  const onTouchStart = (e: React.TouchEvent) => {
    // Jika lebih dari satu jari (zoom), abaikan swipe navigation
    if (e.targetTouches.length > 1) {
      setTouchStart(null);
      return;
    }
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    // Jika lebih dari satu jari, abaikan
    if (e.targetTouches.length > 1) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = ROUTES.indexOf(pathname);
      if (currentIndex === -1) return;

      if (isLeftSwipe && currentIndex < ROUTES.length - 1) {
        // Swipe Left: Next Page
        router.push(ROUTES[currentIndex + 1]);
      } else if (isRightSwipe && currentIndex > 0) {
        // Swipe Right: Previous Page
        router.push(ROUTES[currentIndex - 1]);
      }
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div 
      onTouchStart={onTouchStart} 
      onTouchMove={onTouchMove} 
      onTouchEnd={onTouchEnd}
      className="min-h-screen touch-pan-y" // Hint browser untuk prioritas scroll vertikal
    >
      {children}
    </div>
  );
}

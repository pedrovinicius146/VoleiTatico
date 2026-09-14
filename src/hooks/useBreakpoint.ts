import { useState, useEffect } from 'react';

export type BreakpointCategory = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointInfo {
  width: number;
  height: number;
  isMobile: boolean; // < 768px
  isTablet: boolean; // 768px - 1023px
  isDesktop: boolean; // >= 1024px
  isSmallPhone: boolean; // <= 375px
  breakpoint: BreakpointCategory;
  isLandscape: boolean;
}

export function useBreakpoint(): BreakpointInfo {
  const [info, setInfo] = useState<BreakpointInfo>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const h = typeof window !== 'undefined' ? window.innerHeight : 768;
    return getBreakpointInfo(w, h);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setInfo(getBreakpointInfo(window.innerWidth, window.innerHeight));
      }, 60);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return info;
}

function getBreakpointInfo(width: number, height: number): BreakpointInfo {
  const isSmallPhone = width <= 375;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isLandscape = width > height;

  let breakpoint: BreakpointCategory = 'xs';
  if (width >= 1536) breakpoint = '2xl';
  else if (width >= 1280) breakpoint = 'xl';
  else if (width >= 1024) breakpoint = 'lg';
  else if (width >= 768) breakpoint = 'md';
  else if (width >= 640) breakpoint = 'sm';

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isSmallPhone,
    breakpoint,
    isLandscape,
  };
}

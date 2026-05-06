import { useEffect, useRef, useState } from 'react';

export interface UseIntersectionOptions {
  rootMargin?: string;
  threshold?: number | number[];
  /** When true, disconnects after the first intersection. Useful for one-shot triggers. */
  once?: boolean;
}

/**
 * Observe an element with IntersectionObserver. Returns a ref to attach and a
 * boolean for whether it's currently intersecting. Used by the infinite-scroll
 * sentinel in search/fridge results.
 */
export function useIntersection<T extends Element>(
  options: UseIntersectionOptions = {},
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const { rootMargin, threshold, once } = options;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const init: IntersectionObserverInit = {};
    if (rootMargin !== undefined) init.rootMargin = rootMargin;
    if (threshold !== undefined) init.threshold = threshold;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && once) io.disconnect();
    }, init);
    io.observe(node);
    return () => io.disconnect();
  }, [rootMargin, threshold, once]);

  return [ref, isIntersecting];
}

import { useEffect, RefObject } from "react";

export interface UseInfiniteScrollOptions {
  rootMargin?: string;
  disabled?: boolean;
  hasMore: boolean;
  onReachEnd: () => void;
}

export function useInfiniteScroll(
  ref: RefObject<Element | null>,
  {
    rootMargin = "300px 0px 0px 0px",
    disabled,
    hasMore,
    onReachEnd,
  }: UseInfiniteScrollOptions
) {
  useEffect(() => {
    if (disabled) return;
    const node = ref.current;
    if (!node) return;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting) onReachEnd();
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin, disabled, hasMore, onReachEnd]);
}

export default useInfiniteScroll;

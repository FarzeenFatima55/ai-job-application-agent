import * as React from "react";

const COMPACT_BREAKPOINT = 1024;

export function useIsCompact() {
  const [isCompact, setIsCompact] = React.useState(() =>
    typeof window !== "undefined"
      ? window.innerWidth < COMPACT_BREAKPOINT
      : false
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${COMPACT_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsCompact(mql.matches);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isCompact;
}

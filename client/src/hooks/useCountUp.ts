
import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0);
  const frame = useRef<number>();
  const start = useRef<number>();

  useEffect(() => {
    start.current = undefined;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      if (start.current === undefined) start.current = now;
      const elapsed = now - start.current;
      const progress = Math.min(elapsed / durationMs, 1);
      setValue(Math.round(easeOut(progress) * target));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, durationMs]);

  return value;
}

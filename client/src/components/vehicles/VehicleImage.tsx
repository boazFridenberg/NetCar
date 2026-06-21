
import { useEffect, useState } from 'react';
import { FALLBACK_IMAGE } from '@/lib/format';

interface VehicleImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  
  fallback?: string;
}

export function VehicleImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  fallback = FALLBACK_IMAGE,
}: VehicleImageProps) {
  const initial = src && src.trim() ? src : fallback;
  const [current, setCurrent] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCurrent(src && src.trim() ? src : fallback);
    setLoaded(false);
  }, [src, fallback]);

  const isFallback = current === fallback;

  return (
    <div className={`relative overflow-hidden glass-surface ${className}`}>
      {!loaded && <div className="absolute inset-0 skeleton" aria-hidden />}
      <img
        src={current}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!isFallback) {
            setCurrent(fallback);
          } else {
            setLoaded(true);
          }
        }}
        className={[
          'h-full w-full transition-opacity duration-500',
          isFallback && fallback === FALLBACK_IMAGE
            ? 'object-contain p-6 opacity-80'
            : 'object-cover',
          loaded ? 'opacity-100' : 'opacity-0',
          imgClassName,
        ].join(' ')}
      />
    </div>
  );
}

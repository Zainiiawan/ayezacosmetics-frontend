import { cn } from '@/lib/utils';

/**
 * The AZEEORA logo. Sized by the font-size of its container (the drawing is
 * 1.15em tall), so a `text-[..]` class on the parent sets its size.
 */
export default function Wordmark({ className, light = false, priority = false }: { className?: string; light?: boolean; priority?: boolean }) {
  return (
    <span className={cn('inline-flex items-center leading-none select-none', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={light ? '/brand/azeeora-logo-light.svg' : '/brand/azeeora-logo.svg'}
        alt="AZEEORA"
        width={1114}
        height={218}
        draggable={false}
        fetchPriority={priority ? 'high' : undefined}
        style={{ height: '1.15em', width: 'auto', display: 'block' }}
      />
    </span>
  );
}

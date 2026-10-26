import type { ReactNode } from 'react';

export function Screen({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <main
      className={`relative h-[67.5rem] w-[120rem] overflow-hidden bg-panel font-vcr uppercase leading-[1.1] text-osd [word-spacing:0.2em] ${className}`}
    >
      {children}
      <div aria-hidden className="crt pointer-events-none absolute inset-x-0 inset-y-0" />
    </main>
  );
}

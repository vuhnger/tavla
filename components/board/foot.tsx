import type { ReactNode } from 'react';

export function Foot({ children }: { children: ReactNode }) {
  return (
    <footer className="absolute inset-x-24 bottom-[4.5rem] flex gap-16 whitespace-nowrap border-t-2 border-rule pt-7 text-[2.25rem] text-soft">
      {children}
    </footer>
  );
}

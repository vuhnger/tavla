import type { ReactNode } from 'react';

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[23.75rem_1fr] items-start justify-items-start border-t-2 border-rule py-8 first:border-t-0">
      <span className="py-1.5 text-soft">{label}</span>
      {children}
    </div>
  );
}

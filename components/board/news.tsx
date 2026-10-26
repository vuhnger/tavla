export function News({ headline }: { headline: string }) {
  return <p className="absolute inset-x-24 bottom-[10.5rem] truncate text-[2.25rem] text-soft">{headline}</p>;
}

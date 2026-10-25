export function Workouts({ lines }: { lines: string[] }) {
  return (
    <p className="absolute right-24 top-[38.5rem] max-w-[44rem] text-right text-[2.5rem] leading-[1.35]">
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </p>
  );
}

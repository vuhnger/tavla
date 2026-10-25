export function Workouts({ titles }: { titles: string[] }) {
  return (
    <p className="absolute right-24 top-[38.5rem] max-w-[40rem] text-right text-[2.5rem] leading-[1.35]">
      {titles.map((title, i) => (
        <span key={i} className="block truncate">
          {title}
        </span>
      ))}
    </p>
  );
}

import { Scene } from '@/components/scene/scene';
import type { SceneSpec } from '@/components/scene/spec';
import { outfitWords } from '@/lib/weather/outfit';

export function Clothing({ spec }: { spec: SceneSpec }) {
  return (
    <div className="absolute right-24 top-[15.625rem] flex items-end gap-10">
      <p className="text-right text-[2.5rem] leading-[1.35]">
        {outfitWords(spec.outfit).map((word) => (
          <span key={word} className="block">
            {word}
          </span>
        ))}
      </p>
      <Scene spec={spec} />
    </div>
  );
}

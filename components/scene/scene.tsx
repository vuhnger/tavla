'use client';

import { useEffect, useRef } from 'react';
import { FIGURE_X, FIGURE_Y, SCENE_FPS } from '@/lib/constants/scene';
import { HEIGHT, WIDTH, drawBackdrop } from './backdrop';
import { paintGrid, rasterFigure } from './figure';
import { makeParticles, stepParticles } from './particles';
import type { SceneSpec } from './spec';

export function Scene({ spec }: { spec: SceneSpec }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const key = JSON.stringify(spec);

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const { look, outfit, precip, mm, wind }: SceneSpec = JSON.parse(key);
    const backdrop = drawBackdrop(look);
    const figure = rasterFigure(outfit);
    const particles = makeParticles(precip, mm);
    let tick = 0;
    const frame = () => {
      ctx.drawImage(backdrop, 0, 0);
      paintGrid(ctx, figure, FIGURE_X, FIGURE_Y);
      stepParticles(ctx, particles, wind, tick++);
    };
    frame();
    if (particles.length === 0) return;
    const id = setInterval(frame, 1000 / SCENE_FPS);
    return () => clearInterval(id);
  }, [key]);

  return (
    <div className="relative h-[20.25rem] w-[27rem] flex-none overflow-hidden rounded-[1.25rem] shadow-[0_0_0_2px] shadow-rule">
      <canvas
        ref={ref}
        width={WIDTH}
        height={HEIGHT}
        aria-hidden
        className="absolute left-[-27.375rem] top-[-9.75rem] h-[33.75rem] w-[60rem] [image-rendering:pixelated]"
      />
    </div>
  );
}

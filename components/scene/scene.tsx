'use client';

import { useEffect, useRef } from 'react';
import { FIGURE_X, FIGURE_Y, SCENE_FPS, SCENE_SCALE, VIEW } from '@/lib/constants/scene';
import { HEIGHT, WIDTH, drawBackdrop } from './backdrop';
import { paintGrid, rasterFigure } from './figure';
import { makeParticles, stepParticles } from './particles';
import type { SceneSpec } from './spec';

const rem = (pixels: number) => `${(pixels * SCENE_SCALE) / 16}rem`;

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
      if (particles) stepParticles(ctx, particles, wind, tick++);
    };
    frame();
    if (!particles) return;
    const id = setInterval(frame, 1000 / SCENE_FPS);
    return () => clearInterval(id);
  }, [key]);

  return (
    <div
      className="relative flex-none overflow-hidden rounded-[1.25rem] shadow-[0_0_0_2px] shadow-rule"
      style={{ width: rem(VIEW.w), height: rem(VIEW.h) }}
    >
      <canvas
        ref={ref}
        width={WIDTH}
        height={HEIGHT}
        aria-hidden
        className="absolute [image-rendering:pixelated]"
        style={{ left: `-${rem(VIEW.x)}`, top: `-${rem(VIEW.y)}`, width: rem(WIDTH), height: rem(HEIGHT) }}
      />
    </div>
  );
}

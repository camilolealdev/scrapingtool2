import { useEffect, useRef } from 'react';
import createGlobe, { type COBEOptions } from 'cobe';

const COLOMBIA: [number, number] = [4.5709, -74.2973];

const MARKERS: COBEOptions['markers'] = [
  { location: COLOMBIA,              size: 0.10 },
  { location: [-23.5505, -46.6333], size: 0.08 }, // Brazil
  { location: [19.4326,  -99.1332], size: 0.08 }, // Mexico
  { location: [40.7128,  -74.0060], size: 0.07 }, // USA
  { location: [-34.6037, -58.3816], size: 0.06 }, // Argentina
  { location: [40.4168,   -3.7038], size: 0.06 }, // Spain
  { location: [-33.4489, -70.6693], size: 0.05 }, // Chile
  { location: [-12.0464, -77.0428], size: 0.05 }, // Peru
  { location: [-0.1807,  -78.4678], size: 0.05 }, // Ecuador
  { location: [18.4861,  -69.9312], size: 0.05 }, // Dominican Republic
];

const ARCS: COBEOptions['arcs'] = [
  { from: COLOMBIA, to: [-23.5505, -46.6333] },
  { from: COLOMBIA, to: [19.4326,  -99.1332] },
  { from: COLOMBIA, to: [40.7128,  -74.0060] },
  { from: COLOMBIA, to: [-34.6037, -58.3816] },
  { from: COLOMBIA, to: [40.4168,   -3.7038] },
  { from: COLOMBIA, to: [-33.4489, -70.6693] },
  { from: COLOMBIA, to: [-12.0464, -77.0428] },
  { from: COLOMBIA, to: [-0.1807,  -78.4678] },
  { from: COLOMBIA, to: [18.4861,  -69.9312] },
];

interface GlobeHeroProps {
  isLight: boolean;
}

export function GlobeHero({ isLight }: GlobeHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isLightRef = useRef(isLight);
  const phiRef = useRef(0.6);

  useEffect(() => {
    isLightRef.current = isLight;
  }, [isLight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: 520,
      height: 520,
      phi: phiRef.current,
      theta: 0.28,
      dark: 1,
      diffuse: 1.6,
      mapSamples: 16000,
      mapBrightness: 5.5,
      baseColor: [0.08, 0.08, 0.30],
      markerColor: [0.1, 1.0, 1.0],
      glowColor: [0.25, 0.25, 0.85],
      arcColor: [0.1, 0.6, 1.0],
      arcWidth: 1.5,
      arcHeight: 0.35,
      markers: MARKERS,
      arcs: ARCS,
    });

    let rafId: number;
    const animate = () => {
      phiRef.current += 0.0025;
      const light = isLightRef.current;
      globe.update({
        phi: phiRef.current,
        dark: light ? 0 : 1,
        baseColor: light ? [0.72, 0.72, 0.96] : [0.08, 0.08, 0.30],
        glowColor: light ? [0.55, 0.55, 1.0] : [0.25, 0.25, 0.85],
        markerColor: light ? [0.16, 0.36, 0.96] : [0.1, 1.0, 1.0],
        arcColor: light ? [0.16, 0.36, 0.96] : [0.1, 0.6, 1.0],
      });
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      globe.destroy();
    };
  }, []);

  return (
    <div className="relative w-[260px] h-[260px] shrink-0 select-none pointer-events-none">
      <canvas
        ref={canvasRef}
        style={{ width: 260, height: 260 }}
        width={520}
        height={520}
        className="opacity-85"
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle at 70% 30%, transparent 55%, var(--color-bg0) 82%)' }}
      />
    </div>
  );
}

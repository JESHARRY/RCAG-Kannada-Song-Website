import React, { useEffect, useState, useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

export const HeavenlyLightOverlay: React.FC = () => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  // Generate a fixed, stable set of subtle ambient dust particles
  const particles: Particle[] = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: (i * 17 + 7) % 95,
      y: (i * 23 + 13) % 90,
      size: (i % 3) + 2,
      opacity: 0.12 + (i % 4) * 0.05,
      duration: 12 + (i % 5) * 4,
      delay: (i % 4) * 2,
    }));
  }, []);

  useEffect(() => {
    // Only enable mouse cursor tracking on desktop fine-pointer devices
    if (window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      animationFrameId = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
      });
    };

    const handleMouseLeave = () => {
      setPos(null);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="pointer-events-none select-none">
      {/* 1. Top Sanctuary Heavenly Light Beam (Atmospheric Background) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] pointer-events-none z-0 opacity-25 blur-3xl animate-ray-beam">
        <div
          className="w-full h-full"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.28) 0%, rgba(251, 191, 36, 0.12) 45%, transparent 75%)'
          }}
        />
      </div>

      {/* 2. Floating Heavenly Ambient Light Motes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-amber-200/40 blur-[1px] animate-pulse"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 3. Soft Cursor-Following Light Spotlight (Desktop Only) */}
      {pos && (
        <div
          className="fixed pointer-events-none z-30 transition-opacity duration-300 select-none"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            transform: 'translate(-50%, -50%)',
            width: '320px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(251, 191, 36, 0.05) 35%, transparent 70%)',
            borderRadius: '50%',
            mixBlendMode: 'screen'
          }}
        />
      )}
    </div>
  );
};

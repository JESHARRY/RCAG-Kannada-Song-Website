import React from 'react';

/**
 * 🍇 BIBLICAL GRAPEVINE VISUAL SYSTEM
 * Inspired by John 15:5 - "I am the vine; you are the branches."
 *
 * Muted natural botanical tones (amber, gold, olive, bronze)
 * Lightweight, pure SVG vector paths + CSS keyframe animations.
 */

// Shared SVG Definitions for Gradients and Filters
const GrapevineSvgDefs: React.FC = () => (
  <defs>
    {/* Main Stem Gradient */}
    <linearGradient id="vineStemGradient" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#78350f" stopOpacity="0.85" />
      <stop offset="40%" stopColor="#b45309" stopOpacity="0.75" />
      <stop offset="80%" stopColor="#d97706" stopOpacity="0.65" />
      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.45" />
    </linearGradient>

    {/* Leaf Fill Gradient */}
    <linearGradient id="vineLeafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#b45309" stopOpacity="0.65" />
      <stop offset="50%" stopColor="#d97706" stopOpacity="0.5" />
      <stop offset="100%" stopColor="#4d7c0f" stopOpacity="0.35" />
    </linearGradient>

    {/* Favorite Leaf Gold Gradient */}
    <linearGradient id="vineLeafGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
      <stop offset="60%" stopColor="#d97706" stopOpacity="0.75" />
      <stop offset="100%" stopColor="#b45309" stopOpacity="0.6" />
    </linearGradient>

    {/* Grape Cluster Gradient */}
    <radialGradient id="grapeBerryGradient" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
      <stop offset="30%" stopColor="#d97706" stopOpacity="0.8" />
      <stop offset="75%" stopColor="#7c2d12" stopOpacity="0.85" />
      <stop offset="100%" stopColor="#451a03" stopOpacity="0.9" />
    </radialGradient>

    {/* Soft Glow Filter */}
    <filter id="vineSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
);

/**
 * 1. HOME HERO GRAPEVINE OVERLAY
 * Outer Perimeter Golden Travelling Line + Four-Corner Grapevine & Berry Decorations.
 * Interior of hero card remains 100% clean and unobstructed.
 */
export const HomeHeroGrapevine: React.FC = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 460"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <GrapevineSvgDefs />

      {/* =========================================================================
          PART 1: OUTER PERIMETER BORDER & RUNNING GOLDEN LIGHT SHIMMER
          ========================================================================= */}
      
      {/* 1A. Base Golden Border Line (Follows card perimeter: rx=16) */}
      <rect
        x="2"
        y="2"
        width="996"
        height="456"
        rx="16"
        ry="16"
        fill="none"
        stroke="url(#vineStemGradient)"
        strokeWidth="1.8"
        opacity="0.45"
        vectorEffect="non-scaling-stroke"
      />

      {/* 1B. Continuous Travelling Golden Light Shimmer (Revolves along card perimeter) */}
      <rect
        x="2"
        y="2"
        width="996"
        height="456"
        rx="16"
        ry="16"
        fill="none"
        stroke="#fef08a"
        strokeWidth="2.2"
        filter="url(#vineSoftGlow)"
        className="animate-hero-border-shimmer"
        vectorEffect="non-scaling-stroke"
        opacity="0.85"
      />

      {/* =========================================================================
          PART 2: FOUR CORNER GRAPEVINE & BERRY DECORATIONS
          ========================================================================= */}

      {/* --- CORNER 1: TOP-LEFT CORNER (Delay: 0s) --- */}
      <g id="corner-top-left" className="animate-leaf-sway-corner-1">
        {/* Corner Stem Branch */}
        <path
          d="M 2,75 C 6,32 32,6 75,2"
          fill="none"
          stroke="url(#vineStemGradient)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M 12,42 C 22,25 35,22 48,12"
          fill="none"
          stroke="url(#vineStemGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Leaf 1 */}
        <g transform="translate(38, 22) rotate(-35)">
          <path
            d="M 0,0 C -8,-12 -16,-10 -18,-2 C -20,6 -10,16 0,18 C 10,16 20,6 18,-2 C 16,-10 8,-12 0,0 Z"
            fill="url(#vineLeafGradient)"
            stroke="#b45309"
            strokeWidth="0.7"
          />
          <path d="M 0,0 L 0,14" stroke="#f59e0b" strokeWidth="0.5" opacity="0.7" />
        </g>
        {/* Leaf 2 */}
        <g transform="translate(18, 48) rotate(30)">
          <path
            d="M 0,0 C -6,-10 -12,-8 -14,-1 C -15,5 -7,12 0,14 C 7,12 15,5 14,-1 C 12,-8 6,-10 0,0 Z"
            fill="url(#vineLeafGradient)"
            stroke="#d97706"
            strokeWidth="0.6"
          />
        </g>
        {/* Grape Cluster */}
        <g transform="translate(28, 28)" className="animate-grape-pulse">
          <path d="M 0,0 L -3,6" stroke="#78350f" strokeWidth="1" />
          <circle cx="-6" cy="9" r="3.8" fill="url(#grapeBerryGradient)" />
          <circle cx="0" cy="10" r="3.8" fill="url(#grapeBerryGradient)" />
          <circle cx="-3" cy="14" r="3.2" fill="url(#grapeBerryGradient)" />
          <circle cx="-7.2" cy="7.8" r="0.9" fill="#fef08a" opacity="0.8" />
        </g>
        {/* Spiral tendril */}
        <path d="M 52,8 Q 58,2 62,7 T 65,14" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.7" />
      </g>

      {/* --- CORNER 2: TOP-RIGHT CORNER (Delay: 2.5s) --- */}
      <g id="corner-top-right" className="animate-leaf-sway-corner-2">
        {/* Corner Stem Branch */}
        <path
          d="M 925,2 C 968,6 994,32 998,75"
          fill="none"
          stroke="url(#vineStemGradient)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M 952,12 C 965,22 978,25 988,42"
          fill="none"
          stroke="url(#vineStemGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Leaf 1 */}
        <g transform="translate(962, 22) rotate(35)">
          <path
            d="M 0,0 C -8,-12 -16,-10 -18,-2 C -20,6 -10,16 0,18 C 10,16 20,6 18,-2 C 16,-10 8,-12 0,0 Z"
            fill="url(#vineLeafGradient)"
            stroke="#b45309"
            strokeWidth="0.7"
          />
        </g>
        {/* Leaf 2 */}
        <g transform="translate(982, 48) rotate(-30)">
          <path
            d="M 0,0 C -6,-10 -12,-8 -14,-1 C -15,5 -7,12 0,14 C 7,12 15,5 14,-1 C 12,-8 6,-10 0,0 Z"
            fill="url(#vineLeafGradient)"
            stroke="#d97706"
            strokeWidth="0.6"
          />
        </g>
        {/* Grape Cluster */}
        <g transform="translate(972, 28)" className="animate-grape-pulse">
          <path d="M 0,0 L 3,6" stroke="#78350f" strokeWidth="1" />
          <circle cx="6" cy="9" r="3.8" fill="url(#grapeBerryGradient)" />
          <circle cx="0" cy="10" r="3.8" fill="url(#grapeBerryGradient)" />
          <circle cx="3" cy="14" r="3.2" fill="url(#grapeBerryGradient)" />
          <circle cx="4.8" cy="7.8" r="0.9" fill="#fef08a" opacity="0.8" />
        </g>
        {/* Spiral tendril */}
        <path d="M 948,8 Q 942,2 938,7 T 935,14" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.7" />
      </g>

      {/* --- CORNER 3: BOTTOM-RIGHT CORNER (Delay: 5.0s) --- */}
      <g id="corner-bottom-right" className="animate-leaf-sway-corner-3">
        {/* Corner Stem Branch */}
        <path
          d="M 998,385 C 994,428 968,454 925,458"
          fill="none"
          stroke="url(#vineStemGradient)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M 988,418 C 978,435 965,438 952,448"
          fill="none"
          stroke="url(#vineStemGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Leaf 1 */}
        <g transform="translate(962, 438) rotate(-145)">
          <path
            d="M 0,0 C -8,-12 -16,-10 -18,-2 C -20,6 -10,16 0,18 C 10,16 20,6 18,-2 C 16,-10 8,-12 0,0 Z"
            fill="url(#vineLeafGradient)"
            stroke="#b45309"
            strokeWidth="0.7"
          />
        </g>
        {/* Leaf 2 */}
        <g transform="translate(982, 412) rotate(-120)">
          <path
            d="M 0,0 C -6,-10 -12,-8 -14,-1 C -15,5 -7,12 0,14 C 7,12 15,5 14,-1 C 12,-8 6,-10 0,0 Z"
            fill="url(#vineLeafGradient)"
            stroke="#d97706"
            strokeWidth="0.6"
          />
        </g>
        {/* Grape Cluster */}
        <g transform="translate(972, 432)" className="animate-grape-pulse">
          <path d="M 0,0 L 3,-6" stroke="#78350f" strokeWidth="1" />
          <circle cx="6" cy="-9" r="3.8" fill="url(#grapeBerryGradient)" />
          <circle cx="0" cy="-10" r="3.8" fill="url(#grapeBerryGradient)" />
          <circle cx="3" cy="-14" r="3.2" fill="url(#grapeBerryGradient)" />
          <circle cx="4.8" cy="-10.8" r="0.9" fill="#fef08a" opacity="0.8" />
        </g>
        {/* Spiral tendril */}
        <path d="M 948,452 Q 942,458 938,453 T 935,446" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.7" />
      </g>

      {/* --- CORNER 4: BOTTOM-LEFT CORNER (Delay: 7.5s) --- */}
      <g id="corner-bottom-left" className="animate-leaf-sway-corner-4">
        {/* Corner Stem Branch */}
        <path
          d="M 75,458 C 32,454 6,428 2,385"
          fill="none"
          stroke="url(#vineStemGradient)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M 48,448 C 35,438 22,435 12,418"
          fill="none"
          stroke="url(#vineStemGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Leaf 1 */}
        <g transform="translate(38, 438) rotate(145)">
          <path
            d="M 0,0 C -8,-12 -16,-10 -18,-2 C -20,6 -10,16 0,18 C 10,16 20,6 18,-2 C 16,-10 8,-12 0,0 Z"
            fill="url(#vineLeafGradient)"
            stroke="#b45309"
            strokeWidth="0.7"
          />
        </g>
        {/* Leaf 2 */}
        <g transform="translate(18, 412) rotate(120)">
          <path
            d="M 0,0 C -6,-10 -12,-8 -14,-1 C -15,5 -7,12 0,14 C 7,12 15,5 14,-1 C 12,-8 6,-10 0,0 Z"
            fill="url(#vineLeafGradient)"
            stroke="#d97706"
            strokeWidth="0.6"
          />
        </g>
        {/* Grape Cluster */}
        <g transform="translate(28, 432)" className="animate-grape-pulse">
          <path d="M 0,0 L -3,-6" stroke="#78350f" strokeWidth="1" />
          <circle cx="-6" cy="-9" r="3.8" fill="url(#grapeBerryGradient)" />
          <circle cx="0" cy="-10" r="3.8" fill="url(#grapeBerryGradient)" />
          <circle cx="-3" cy="-14" r="3.2" fill="url(#grapeBerryGradient)" />
          <circle cx="-7.2" cy="-10.8" r="0.9" fill="#fef08a" opacity="0.8" />
        </g>
        {/* Spiral tendril */}
        <path d="M 52,452 Q 58,458 62,453 T 65,446" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.7" />
      </g>
    </svg>
  );
};

/**
 * 2. SONG CARD VINE ACCENT SYSTEM
 * Deterministic botanical accent variations for Song Cards.
 * Restrained, lightweight SVG motifs that respond gracefully to hover and favorite states.
 */
interface SongCardVineAccentProps {
  variant: number; // 0, 1, 2, or 3
  isFavorite?: boolean;
}

export const SongCardVineAccent: React.FC<SongCardVineAccentProps> = ({ variant, isFavorite }) => {
  const leafFill = isFavorite ? 'url(#vineLeafGoldGradient)' : 'url(#vineLeafGradient)';
  const strokeColor = isFavorite ? '#f59e0b' : '#b45309';

  // Variant 0: Delicate Top-Left Corner Branch
  if (variant === 0) {
    return (
      <svg
        className="absolute top-0 left-0 w-24 h-24 pointer-events-none z-0 overflow-hidden select-none opacity-40 group-hover:opacity-90 transition-opacity duration-300"
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <GrapevineSvgDefs />
        <path
          d="M -5,25 C 15,22 25,12 42,5 C 55,0 70,2 85,-5"
          stroke="url(#vineStemGradient)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M -5,25 C 10,35 15,50 12,70"
          stroke="url(#vineStemGradient)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Leaves */}
        <g transform="translate(25, 15) rotate(-30)" className="group-hover:animate-leaf-sway">
          <path
            d="M 0,0 C -6,-10 -12,-8 -14,-2 C -15,4 -7,11 0,14 C 7,11 15,4 14,-2 C 12,-8 6,-10 0,0 Z"
            fill={leafFill}
            stroke={strokeColor}
            strokeWidth="0.6"
          />
        </g>
        <g transform="translate(50, 4) rotate(20)">
          <path
            d="M 0,0 C -4,-8 -9,-6 -10,-1 C -11,3 -5,8 0,10 C 5,8 11,3 10,-1 C 9,-8 4,-8 0,0 Z"
            fill={leafFill}
            stroke={strokeColor}
            strokeWidth="0.5"
          />
        </g>
        {isFavorite && (
          <circle cx="28" cy="18" r="2.5" fill="url(#grapeBerryGradient)" />
        )}
      </svg>
    );
  }

  // Variant 1: Subtle Top-Right Corner Creeper
  if (variant === 1) {
    return (
      <svg
        className="absolute top-0 right-0 w-24 h-24 pointer-events-none z-0 overflow-hidden select-none opacity-35 group-hover:opacity-85 transition-opacity duration-300"
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <GrapevineSvgDefs />
        <path
          d="M 100,20 C 80,15 70,8 50,5 C 38,2 25,8 10,-2"
          stroke="url(#vineStemGradient)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <g transform="translate(62, 10) rotate(45)" className="group-hover:animate-leaf-sway">
          <path
            d="M 0,0 C -5,-9 -11,-7 -12,-1 C -13,4 -6,10 0,12 C 6,10 13,4 12,-1 C 11,-7 5,-9 0,0 Z"
            fill={leafFill}
            stroke={strokeColor}
            strokeWidth="0.6"
          />
        </g>
        {isFavorite && (
          <g transform="translate(42, 6)">
            <circle cx="0" cy="0" r="2.2" fill="url(#grapeBerryGradient)" />
            <circle cx="4" cy="2" r="2" fill="url(#grapeBerryGradient)" />
          </g>
        )}
      </svg>
    );
  }

  // Variant 2: Subtle Bottom-Left Corner Accent
  if (variant === 2) {
    return (
      <svg
        className="absolute bottom-0 left-0 w-24 h-20 pointer-events-none z-0 overflow-hidden select-none opacity-35 group-hover:opacity-85 transition-opacity duration-300"
        viewBox="0 0 96 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <GrapevineSvgDefs />
        <path
          d="M -5,55 C 20,50 35,62 60,68 C 75,72 88,68 100,75"
          stroke="url(#vineStemGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <g transform="translate(32, 58) rotate(-25)" className="group-hover:animate-leaf-sway">
          <path
            d="M 0,0 C -5,-8 -10,-6 -11,-1 C -12,4 -6,9 0,11 C 6,9 12,4 11,-1 C 10,-6 5,-8 0,0 Z"
            fill={leafFill}
            stroke={strokeColor}
            strokeWidth="0.5"
          />
        </g>
        {isFavorite && (
          <path d="M 55,68 Q 62,60 66,66" stroke="#f59e0b" strokeWidth="1" fill="none" />
        )}
      </svg>
    );
  }

  // Variant 3: Top-Center Subtle Botanical Sprig
  return (
    <svg
      className="absolute top-0 left-1/3 w-32 h-16 pointer-events-none z-0 overflow-hidden select-none opacity-30 group-hover:opacity-80 transition-opacity duration-300"
      viewBox="0 0 128 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <GrapevineSvgDefs />
      <path
        d="M -10,5 C 20,2 45,12 70,6 C 90,1 110,8 135,0"
        stroke="url(#vineStemGradient)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <g transform="translate(48, 8) rotate(15)" className="group-hover:animate-leaf-sway">
        <path
          d="M 0,0 C -4,-7 -9,-5 -10,-1 C -11,3 -5,8 0,10 C 5,8 11,3 10,-1 C 9,-5 4,-7 0,0 Z"
          fill={leafFill}
          stroke={strokeColor}
          strokeWidth="0.5"
        />
      </g>
      {isFavorite && (
        <circle cx="72" cy="8" r="2.2" fill="url(#grapeBerryGradient)" />
      )}
    </svg>
  );
};

/**
 * 3. SONG DETAIL PAGE GRAPEVINE HEADER FRAME
 * Elegant framing branch for the top header section of SongDetailPage.tsx.
 */
export const SongDetailGrapevine: React.FC = () => {
  return (
    <svg
      className="absolute top-0 right-0 w-80 h-48 pointer-events-none z-0 overflow-hidden select-none opacity-60"
      viewBox="0 0 320 192"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <GrapevineSvgDefs />
      <g className="animate-vine-sway">
        <path
          d="M 330,-10 C 270,25 240,65 190,85 C 140,105 80,95 20,130 C -10,148 -30,175 -50,190"
          stroke="url(#vineStemGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#vineSoftGlow)"
        />
        <path
          d="M 240,65 C 200,45 150,40 100,25"
          stroke="url(#vineStemGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Leaves */}
        <g transform="translate(210, 75) rotate(-35)" className="animate-leaf-sway">
          <path
            d="M 0,0 C -10,-16 -22,-14 -24,-3 C -26,7 -12,20 0,24 C 12,20 26,7 24,-3 C 22,-14 10,-16 0,0 Z"
            fill="url(#vineLeafGradient)"
            stroke="#b45309"
            strokeWidth="0.8"
          />
        </g>
        <g transform="translate(130, 95) rotate(25)" className="animate-leaf-sway-staggered">
          <path
            d="M 0,0 C -8,-14 -18,-12 -20,-2 C -22,6 -10,16 0,20 C 10,16 22,6 20,-2 C 18,-12 8,-14 0,0 Z"
            fill="url(#vineLeafGradient)"
            stroke="#d97706"
            strokeWidth="0.7"
          />
        </g>

        {/* Grape Cluster */}
        <g transform="translate(195, 90)" className="animate-grape-pulse">
          <path d="M 0,0 L -4,8" stroke="#78350f" strokeWidth="1" />
          <circle cx="-6" cy="12" r="3.8" fill="url(#grapeBerryGradient)" />
          <circle cx="1" cy="13" r="3.8" fill="url(#grapeBerryGradient)" />
          <circle cx="-2.5" cy="18" r="3.2" fill="url(#grapeBerryGradient)" />
        </g>
      </g>
    </svg>
  );
};

/**
 * 4. SECTION VINE ACCENT
 * Small botanical header/divider accent for pages and categories.
 */
export const SectionVineAccent: React.FC<{ className?: string }> = ({ className = 'w-16 h-6' }) => {
  return (
    <svg
      className={`inline-block pointer-events-none select-none ${className}`}
      viewBox="0 0 64 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <GrapevineSvgDefs />
      <path
        d="M 2,12 C 18,6 30,18 46,12 C 54,9 58,13 62,10"
        stroke="url(#vineStemGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <g transform="translate(24, 11) rotate(-20)">
        <path
          d="M 0,0 C -3,-6 -7,-5 -8,-1 C -9,3 -4,7 0,8 C 4,7 9,3 8,-1 C 7,-5 3,-6 0,0 Z"
          fill="url(#vineLeafGradient)"
          stroke="#b45309"
          strokeWidth="0.5"
        />
      </g>
    </svg>
  );
};

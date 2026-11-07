import React from 'react';

interface FrogeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  showTagline?: boolean;
}

export const FrogeLogo: React.FC<FrogeLogoProps> = ({
  className = '',
  size = 'md',
  showBadge = true,
  showTagline = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
  };

  const titleSizes = {
    sm: 'text-sm font-bold tracking-tight',
    md: 'text-base font-bold tracking-tight',
    lg: 'text-2xl font-extrabold tracking-tight',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Original FROGÉ Geometric Crest Icon */}
      <div
        className={`relative flex items-center justify-center ${iconSizes[size]} rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-xs border border-emerald-600/30 overflow-hidden shrink-0`}
      >
        {/* Geometric frog silhouette */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5 text-white"
        >
          {/* Frog Eyes */}
          <circle cx="9" cy="11" r="4.5" fill="white" fillOpacity="0.95" />
          <circle cx="23" cy="11" r="4.5" fill="white" fillOpacity="0.95" />
          <circle cx="9" cy="11" r="2" fill="#047857" />
          <circle cx="23" cy="11" r="2" fill="#047857" />
          <circle cx="10" cy="10" r="0.7" fill="white" />
          <circle cx="24" cy="10" r="0.7" fill="white" />

          {/* Frog Head Contour */}
          <path
            d="M9 16C9 13.5 12 12.5 16 12.5C20 12.5 23 13.5 23 16C23 20 20.5 22.5 16 22.5C11.5 22.5 9 20 9 16Z"
            fill="white"
            fillOpacity="0.25"
          />
          {/* Zen Smile */}
          <path
            d="M12.5 18.2C13.5 19.3 18.5 19.3 19.5 18.2"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Luminous Emerald Dot */}
          <circle cx="16" cy="15" r="1" fill="#a7f3d0" />
        </svg>

        {/* Gloss overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
      </div>

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className={`text-zinc-900 ${titleSizes[size]} font-sans`}>
            FROGÉ
          </span>
          {showBadge && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              App 1
            </span>
          )}
        </div>
        {showTagline && (
          <span className="text-[11px] text-zinc-400 font-medium">
            One AI. Every Possibility.
          </span>
        )}
      </div>
    </div>
  );
};


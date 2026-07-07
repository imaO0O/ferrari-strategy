/* Фирменные line-иконки в стиле системы: штрих 1.8, currentColor. */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const BoltIcon = ({ className = "h-6 w-6" }) => (
  <svg {...base} className={className}>
    <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" />
  </svg>
);

export const HelmetIcon = ({ className = "h-6 w-6" }) => (
  <svg {...base} className={className}>
    <path d="M4 13a8 8 0 0 1 16 0v4.5a1.5 1.5 0 0 1-1.5 1.5H14l-2-4H4.2A8 8 0 0 1 4 13Z" />
    <path d="M12 15h8" />
  </svg>
);

export const WrenchIcon = ({ className = "h-6 w-6" }) => (
  <svg {...base} className={className}>
    <path d="M14.5 6.5a4 4 0 0 1 5-5l-3 3 1 2 2 1 3-3a4 4 0 0 1-5 5L8 19.5a2.1 2.1 0 0 1-3-3l9.5-10Z" />
  </svg>
);

export const TrophyIcon = ({ className = "h-6 w-6" }) => (
  <svg {...base} className={className}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />
    <path d="M12 14v3m-4 4h8m-6 0v-3h4v3" />
  </svg>
);

export const GradIcon = ({ className = "h-6 w-6" }) => (
  <svg {...base} className={className}>
    <path d="m12 4 10 5-10 5L2 9l10-5Z" />
    <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v5" />
  </svg>
);

export const MapIcon = ({ className = "h-6 w-6" }) => (
  <svg {...base} className={className}>
    <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
    <path d="M9 4v14m6-12v14" />
  </svg>
);

export const ClipboardIcon = ({ className = "h-6 w-6" }) => (
  <svg {...base} className={className}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4a3 3 0 0 1 6 0M9 10h6M9 14h6M9 18h3" />
  </svg>
);

export const ToolboxIcon = ({ className = "h-6 w-6" }) => (
  <svg {...base} className={className}>
    <rect x="3" y="9" width="18" height="10" rx="2" />
    <path d="M9 9V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18M10 13v2m4-2v2" />
  </svg>
);

export const FlagIcon = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M5 2v20h1.8v-7.2H19L16 9.4 19 4H6.8V2H5Zm1.8 3.8h2.8v2.8H6.8V5.8Zm5.6 0h2.8v2.8h-2.8V5.8Zm-2.8 2.8h2.8v2.8H9.6V8.6Zm5.6 0h2.4l-1.5 2.8h-.9V8.6Z" />
  </svg>
);

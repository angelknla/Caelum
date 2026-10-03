type BrandMarkProps = {
  size?: number;
  color?: string;
  accent?: string;
};

export default function BrandMark({
  size = 30,
  color = '#f5f5f2',
  accent = '#e4ff7a',
}: BrandMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M36.8 14.4A16 16 0 1 0 39.8 26.5"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="22"
        ry="8"
        transform="rotate(-40 24 24)"
        stroke={color}
        strokeWidth="2.2"
      />
      <circle cx="24" cy="24" r="4" fill={accent} />
      <circle cx="40.85" cy="9.86" r="3.2" fill={color} />
    </svg>
  );
}

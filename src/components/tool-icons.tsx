// SVG icons por slug de tool.
// ViewBox 24×24, stroke="currentColor" pra herdar cor do container.

const icons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  "og-image": (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <rect x="2" y="4" width="20" height="2.5" rx="1" opacity="0.15" />
      <rect x="4" y="9" width="10" height="2.5" rx="1.25" />
      <rect x="4" y="13" width="14" height="2.5" rx="1.25" />
      <rect x="17" y="17" width="4" height="1.5" rx="0.75" opacity="0.4" />
    </svg>
  ),
};

export function ToolIcon({
  slug,
  className,
  size,
}: {
  slug: string;
  className?: string;
  size?: number;
}) {
  const Icon = icons[slug];
  if (!Icon) return null;
  return (
    <Icon
      className={className}
      width={size ?? 24}
      height={size ?? 24}
      aria-hidden="true"
    />
  );
}

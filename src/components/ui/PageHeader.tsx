import type { ReactNode } from "react";

/**
 * The muted-eyebrow + heading + description block at the top of a page.
 * Extracted from src/app/dashboard/page.tsx and src/app/analytics/page.tsx,
 * which previously duplicated this exact markup (same font sizes, same
 * spacing) with only the copy differing.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  className = "",
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[15px] font-medium text-[var(--color-text-muted)]">
        {eyebrow}
      </p>
      <h1
        className="font-display mt-[6px] text-[clamp(30px,3.5vw,38px)]"
        style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
      >
        {title}
      </h1>
      {description && (
        <p className="mt-[10px] max-w-[640px] text-base leading-[1.6] text-[var(--color-text-muted)]">
          {description}
        </p>
      )}
    </div>
  );
}

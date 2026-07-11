import Link from "next/link";
import { LucideIcon } from "lucide-react";

export default function QuickAccessCard({
  href,
  label,
  description,
  icon: Icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-3 p-5 rounded-2xl transition-colors"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "var(--color-surface-hover)" }}
      >
        <Icon size={18} color="var(--color-accent)" />
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          {label}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            marginTop: 4,
          }}
        >
          {description}
        </div>
      </div>
    </Link>
  );
}

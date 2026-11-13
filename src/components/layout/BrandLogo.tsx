/**
 * Geometric Print Sheet emblem shared across header, footer, 404, and metadata.
 */
export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="32" height="32" rx="7" fill="#262628" />
      <rect x="6" y="6" width="9" height="9" rx="2" fill="#f4f4f5" />
      <rect x="17" y="6" width="9" height="9" rx="2" fill="#84cc16" />
      <rect x="6" y="17" width="9" height="9" rx="2" fill="#4d7c0f" />
      <rect x="17" y="17" width="9" height="9" rx="2" fill="#f4f4f5" />
    </svg>
  );
}

/**
 * Full brand lockup combining the Print Sheet emblem and wordmark.
 */
export function BrandLogo({
  size = "header",
}: {
  size?: "header" | "footer";
}) {
  const isFooter = size === "footer";

  return (
    <span className="inline-flex items-center gap-2.5">
      <BrandMark
        className={isFooter ? "h-8 w-8 shrink-0" : "h-9 w-9 shrink-0"}
      />
      <span
        className={
          isFooter
            ? "text-sm font-extrabold tracking-tight text-zinc-950"
            : "text-[15px] font-extrabold tracking-tight text-zinc-950"
        }
      >
        Print Sheet <span className="text-[#3f6212]">Maker</span>
      </span>
    </span>
  );
}

import type { ReactNode } from "react";

type TooltipProps = {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  className?: string;
};

const alignmentClassNames = {
  start: "left-0 translate-x-0",
  center: "left-1/2 -translate-x-1/2",
  end: "right-0 translate-x-0",
} as const;

const sideClassNames = {
  top: "bottom-full mb-2",
  bottom: "top-full mt-2",
} as const;

export function Tooltip({
  label,
  children,
  side = "bottom",
  align = "center",
  className = "",
}: TooltipProps) {
  return (
    <span className={`group inline-flex ${className}`.trim()}>
      <span className="relative inline-flex">
        <span className="inline-flex">{children}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute z-[60] inline-flex whitespace-nowrap rounded-full border-[0.5px] border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] opacity-0 transition duration-150 ease-out [font-family:var(--font-dm-mono),monospace] group-hover:opacity-100 group-focus-within:opacity-100 ${sideClassNames[side]} ${alignmentClassNames[align]}`}
        >
          {label}
        </span>
      </span>
    </span>
  );
}

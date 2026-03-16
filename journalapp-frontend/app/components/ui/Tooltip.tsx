import type { ReactNode } from "react";

type TooltipProps = {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  className?: string;
};

const alignmentClassNames = {
  start: "left-0",
  center: "left-1/2 -translate-x-1/2",
  end: "right-0",
} as const;

const sideClassNames = {
  top: "bottom-full mb-1.5",
  bottom: "top-full mt-1.5",
} as const;

export function Tooltip({
  label,
  children,
  side = "bottom",
  align = "center",
  className = "",
}: TooltipProps) {
  return (
    <span className={`group/tooltip inline-flex ${className}`.trim()}>
      <span className="relative inline-flex overflow-visible">
        <span className="inline-flex">{children}</span>
        <span
          aria-hidden="true"
          role="tooltip"
          className={`pointer-events-none absolute z-[60] inline-flex whitespace-nowrap rounded-md border border-[var(--line)] bg-[var(--surface-solid)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--muted)] shadow-[var(--shadow-soft)] [font-family:var(--font-dm-mono),monospace]
            invisible opacity-0 transition duration-75 ease-out delay-0
            group-hover/tooltip:visible group-hover/tooltip:opacity-100 group-hover/tooltip:delay-150
            group-has-[:focus-visible]/tooltip:visible group-has-[:focus-visible]/tooltip:opacity-100 group-has-[:focus-visible]/tooltip:delay-150
            ${sideClassNames[side]} ${alignmentClassNames[align]}`}
        >
          {label}
        </span>
      </span>
    </span>
  );
}

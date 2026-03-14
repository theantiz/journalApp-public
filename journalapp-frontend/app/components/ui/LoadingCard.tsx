type LoadingCardProps = {
  label: string;
  title: string;
  copy: string;
};

export function LoadingCard({ label, title, copy }: LoadingCardProps) {
  return (
    <div className="grid min-h-screen min-h-[100svh] place-items-center px-4 py-8 sm:px-6">
      <div className="animate-fade-up grid w-full max-w-[520px] gap-4 rounded-[26px] border border-[var(--line)] bg-[var(--surface-strong)] px-7 py-8 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-3">
          <p className="m-0 text-[0.72rem] uppercase tracking-[0.2em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace]">
            {label}
          </p>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="animate-pulse-ink inline-flex size-2 rounded-full bg-[var(--text-strong)]" />
            <span
              className="animate-pulse-ink inline-flex size-2 rounded-full bg-[var(--muted)]"
              style={{ animationDelay: "120ms" }}
            />
            <span
              className="animate-pulse-ink inline-flex size-2 rounded-full bg-[var(--muted-soft)]"
              style={{ animationDelay: "240ms" }}
            />
          </div>
        </div>
        <h1 className="m-0 text-[clamp(2.3rem,5vw,3rem)] font-semibold leading-[0.98] text-[var(--text-strong)] [font-family:var(--font-caveat),serif]">
          {title}
        </h1>
        <p className="m-0 max-w-[34ch] leading-7 text-[var(--muted)]">{copy}</p>
        <div className="mt-1 rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace]">
          Loading data
        </div>
      </div>
    </div>
  );
}

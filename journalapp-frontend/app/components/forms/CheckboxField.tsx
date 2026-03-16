type CheckboxFieldProps = {
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
};

export function CheckboxField({
  label,
  description,
  error,
  children,
}: CheckboxFieldProps) {
  return (
    <label className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3.5 rounded-[16px] border-[0.5px] border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4">
      <span className="pt-0.5">{children}</span>
      <span className="grid gap-1">
        <span className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace]">
          {label}
        </span>
        {description ? <span className="leading-6 text-[var(--muted)]">{description}</span> : null}
        <span className="min-h-[1.5rem] text-[0.82rem] leading-6 text-[var(--danger)] empty:invisible" aria-live="polite">
          {error ?? ""}
        </span>
      </span>
    </label>
  );
}

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
};

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <label className="grid gap-2.5" htmlFor={htmlFor}>
      <span className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace]">
        {label}
      </span>
      {children}
      {hint ? <span className="text-[0.92rem] leading-6 text-[var(--muted)]">{hint}</span> : null}
      {error ? <span className="text-[0.82rem] leading-6 text-[var(--danger)]">{error}</span> : null}
    </label>
  );
}

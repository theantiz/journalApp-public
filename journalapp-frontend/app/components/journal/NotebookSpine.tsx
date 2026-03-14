import { BookOpen, PencilLine, Sparkles } from "lucide-react";

type NotebookSpineProps = {
  onCreateEntry: () => void;
};

const iconButtonClass =
  "inline-flex size-8 items-center justify-center rounded-[10px] text-[var(--text)] transition hover:bg-[var(--surface-muted)]";

export function NotebookSpine({ onCreateEntry }: NotebookSpineProps) {
  return (
    <aside
      className="row-span-2 flex flex-col items-center justify-between border-r-[0.5px] border-[var(--line)] bg-[var(--bg)] py-4 md:row-auto"
      aria-label="Journal navigation"
    >
      <button
        aria-current="page"
        aria-label="Journal"
        className="inline-flex size-8 items-center justify-center rounded-[10px] bg-[#E8E4DC] text-[var(--text)]"
        type="button"
      >
        <BookOpen className="size-4" strokeWidth={1.7} />
      </button>

      <button
        aria-label="AI"
        className={iconButtonClass}
        type="button"
      >
        <Sparkles className="size-4" strokeWidth={1.7} />
      </button>

      <button
        aria-label="New entry"
        className={iconButtonClass}
        type="button"
        onClick={onCreateEntry}
      >
        <PencilLine className="size-4" strokeWidth={1.7} />
      </button>
    </aside>
  );
}

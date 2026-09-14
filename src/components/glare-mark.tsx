export function GlareMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-2 tracking-tight">
      <span
        className={`font-display italic text-ink ${compact ? "text-2xl" : "text-3xl sm:text-4xl"}`}
      >
        Glare
      </span>
      <span
        className={`font-sans font-medium uppercase text-glare/80 ${
          compact
            ? "text-[11px] tracking-[0.28em]"
            : "text-xs tracking-[0.34em] sm:text-sm"
        }`}
      >
        Room
      </span>
    </span>
  );
}

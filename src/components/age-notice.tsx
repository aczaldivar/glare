import { AGE_NOTICE } from "@/lib/legal";

export function AgeNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-5 text-muted ${className}`.trim()}>
      {AGE_NOTICE}
    </p>
  );
}

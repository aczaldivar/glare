import Link from "next/link";

const LINKS = [
  { href: "/guidelines", label: "Community Guidelines" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
] as const;

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      className={`flex flex-col gap-3 border-t border-line text-xs text-muted ${
        compact ? "pt-4" : "pt-6"
      } sm:flex-row sm:items-end sm:justify-between`}
    >
      <div className="space-y-1">
        <p>
          No illegal content. We may hide messages, remove rooms, or block
          access.
        </p>
        {!compact ? (
          <p>Rooms are public. Messages are ephemeral. Be decent.</p>
        ) : null}
      </div>
      <nav className="flex flex-wrap gap-x-4 gap-y-1">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-glare/80 underline-offset-4 hover:text-glare-hot hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}

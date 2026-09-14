import Link from "next/link";
import { AGE_NOTICE } from "@/lib/legal";
import { getOperatorContactEmail } from "@/lib/operator";

const LINKS = [
  { href: "/guidelines", label: "Community Guidelines" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
] as const;

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  const operatorEmail = getOperatorContactEmail();

  return (
    <footer
      className={`flex flex-col gap-3 border-t border-line text-xs text-muted ${
        compact ? "pt-4" : "pt-6"
      } sm:flex-row sm:items-end sm:justify-between`}
    >
      <div className="space-y-1">
        <p>{AGE_NOTICE} No analytics or advertising cookies in v1.</p>
        <p>
          No illegal content. We may hide messages, remove rooms, or block
          access.
        </p>
        {!compact ? (
          <p>Rooms are public. Messages are ephemeral. Be decent.</p>
        ) : null}
        <p>
          Contact{" "}
          <a
            href={`mailto:${operatorEmail}`}
            className="text-glare/80 underline-offset-4 hover:text-glare-hot hover:underline"
          >
            {operatorEmail}
          </a>
        </p>
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

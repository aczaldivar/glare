import Link from "next/link";
import { GlareMark } from "@/components/glare-mark";
import { SiteFooter } from "@/components/site-footer";
import type { BotGuardMode, RealtimeProvider } from "@/lib/realtime/types";

export function DeployNotReady({
  provider,
  botGuard,
}: {
  provider: RealtimeProvider | null;
  botGuard: BotGuardMode;
}) {
  const needsAbly = provider === "unconfigured";
  const needsTurnstile = botGuard === "missing";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 py-8">
      <Link href="/" aria-label="Back to Glare Room">
        <GlareMark compact />
      </Link>
      <div className="panel mt-10 flex-1 rounded-[28px] p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-muted">
          This deploy is not ready
        </p>
        <h1 className="mt-3 font-display text-4xl italic text-ink">Hold the door</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Public chat is closed on this host until the production keys below are set
          in Vercel, then the app is redeployed.
        </p>
        <ul className="mt-6 space-y-3 text-sm leading-6 text-ink">
          {needsAbly ? (
            <li>
              Add <span className="font-mono text-glare/90">ABLY_API_KEY</span> so rooms can go
              live.
            </li>
          ) : null}
          {needsTurnstile ? (
            <li>
              Add <span className="font-mono text-glare/90">TURNSTILE_SECRET_KEY</span> and{" "}
              <span className="font-mono text-glare/90">NEXT_PUBLIC_TURNSTILE_SITE_KEY</span>{" "}
              from a free Cloudflare Turnstile widget. Token minting stays off until both are
              present.
            </li>
          ) : null}
        </ul>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl border border-line px-5 text-sm text-muted"
        >
          Back
        </Link>
      </div>
      <div className="mt-8">
        <SiteFooter compact />
      </div>
    </div>
  );
}

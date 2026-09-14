"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { HoneypotField } from "@/components/honeypot-field";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { GlareMark } from "@/components/glare-mark";
import { SiteFooter } from "@/components/site-footer";
import { requestHumanSession } from "@/lib/entry-client";
import { honeypotFilled } from "@/lib/honeypot";
import { AGE_NOTICE, SAFETY_BANNER } from "@/lib/legal";
import { roomDisplayName } from "@/lib/rooms";

export function RoomGate({
  room,
  onAccept,
  needsLegal = true,
  needsHuman = false,
  turnstileSiteKey = null,
}: {
  room: string;
  onAccept: () => void;
  needsLegal?: boolean;
  needsHuman?: boolean;
  turnstileSiteKey?: string | null;
}) {
  const [agreed, setAgreed] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const title = roomDisplayName(room);
  const legalReady = !needsLegal || agreed;
  const humanReady = !needsHuman || Boolean(turnstileToken);
  const canSubmit = legalReady && humanReady && !submitting;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!legalReady) return;
    if (needsHuman && !turnstileToken) {
      setError("Complete the check to enter.");
      return;
    }
    if (honeypotFilled(honeypot)) {
      setError("Could not enter.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await requestHumanSession({
      honeypot,
      turnstileToken,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      setTurnstileToken(null);
      return;
    }
    onAccept();
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 py-8">
      <Link href="/" aria-label="Back to Glare Room">
        <GlareMark compact />
      </Link>

      <form onSubmit={onSubmit} className="panel mt-10 flex-1 rounded-[28px] p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-muted">
          Before you enter
        </p>
        <h1 className="mt-3 font-display text-4xl italic text-ink">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Public room. No accounts. Anyone with the link can read what you send.
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">{AGE_NOTICE}</p>

        <ul className="mt-6 space-y-2 text-sm text-ink">
          <li>No illegal content, exploitation, or abuse.</li>
          <li>No harassment, doxxing, or spam.</li>
          <li>We may hide messages, remove rooms, or block access.</li>
        </ul>

        <p className="mt-6 text-sm leading-6 text-ember">{SAFETY_BANNER}</p>

        <HoneypotField value={honeypot} onChange={setHoneypot} />

        {needsLegal ? (
          <label htmlFor="legal-ack" className="mt-6 flex min-h-11 items-start gap-3 text-sm leading-6 text-muted">
            <input
              id="legal-ack"
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="mt-1 size-4 shrink-0 accent-[#e8a15a]"
            />
            <span>
              I agree to the{" "}
              <Link href="/guidelines" className="text-glare underline-offset-4 hover:underline">
                Community Guidelines
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="text-glare underline-offset-4 hover:underline">
                Terms
              </Link>
              . I have read the{" "}
              <Link href="/privacy" className="text-glare underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        ) : null}

        {needsHuman && turnstileSiteKey ? (
          <div className="mt-6 space-y-2">
            <p className="text-sm text-muted">A quick check before the room opens.</p>
            <TurnstileWidget siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-ember">{error}</p> : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={!canSubmit}
            className="h-12 rounded-2xl bg-glare px-5 text-sm font-semibold text-[#2a1c0a] transition hover:bg-glare-hot disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Checking…" : `Enter ${title}`}
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-line px-5 text-sm text-muted"
          >
            Back
          </Link>
        </div>
      </form>

      <div className="mt-8">
        <SiteFooter compact />
      </div>
    </div>
  );
}

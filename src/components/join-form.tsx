"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { AgeNotice } from "@/components/age-notice";
import { HoneypotField } from "@/components/honeypot-field";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { useLegalAck } from "@/hooks/use-legal-ack";
import { useRealtimeConfig } from "@/hooks/use-realtime-config";
import { requestHumanSession } from "@/lib/entry-client";
import { honeypotFilled } from "@/lib/honeypot";
import { isValidRoomSlug, roomPath, slugifyRoom } from "@/lib/rooms";

export function JoinForm() {
  const router = useRouter();
  const legal = useLegalAck();
  const config = useRealtimeConfig();
  const [value, setValue] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = useMemo(() => slugifyRoom(value || "lobby"), [value]);
  const valid = isValidRoomSlug(slug);
  const needsAck = legal.ready && !legal.acknowledged;
  const needsHuman = config.ready && config.botGuard === "turnstile" && !config.verified;
  const canSubmit =
    valid &&
    (!needsAck || agreed) &&
    (!needsHuman || Boolean(turnstileToken)) &&
    !submitting &&
    config.ready &&
    legal.ready;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = slugifyRoom(value || "lobby");
    if (!isValidRoomSlug(next)) {
      setError("Use 2–32 letters, numbers, or hyphens. Start with a letter.");
      return;
    }
    if (needsAck && !agreed) {
      setError("Agree to the Community Guidelines and Terms to enter a room.");
      return;
    }
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
    if (config.botGuard !== "missing") {
      const result = await requestHumanSession({
        honeypot,
        turnstileToken,
      });
      if (!result.ok) {
        setSubmitting(false);
        setError(result.error);
        setTurnstileToken(null);
        return;
      }
    }
    setSubmitting(false);

    if (needsAck) legal.acknowledge();
    config.markVerified();
    router.push(roomPath(next));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm text-muted" htmlFor="room-name">
        Room name
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="room-name"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          placeholder="lobby"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="h-14 flex-1 rounded-2xl border border-line bg-black/30 px-4 text-lg text-ink transition placeholder:text-muted/70 focus:border-glare/50"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="h-14 rounded-2xl bg-glare px-6 text-sm font-semibold tracking-wide text-[#2a1c0a] transition hover:bg-glare-hot disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Checking…" : "Enter room"}
        </button>
      </div>
      <p className="font-mono text-xs text-muted">
        {valid ? (
          <>
            Shareable link{" "}
            <span className="text-glare/90">/r/{slug}</span>
          </>
        ) : (
          <span className="text-ember">That name cannot be used.</span>
        )}
      </p>
      <HoneypotField value={honeypot} onChange={setHoneypot} />
      {needsAck ? (
        <label htmlFor="landing-legal-ack" className="flex min-h-11 items-start gap-3 text-sm leading-6 text-muted">
          <input
            id="landing-legal-ack"
            type="checkbox"
            checked={agreed}
            onChange={(event) => {
              setAgreed(event.target.checked);
              if (error) setError(null);
            }}
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
      {needsHuman && config.turnstileSiteKey ? (
        <div className="space-y-2">
          <p className="text-sm text-muted">A quick check before the room opens.</p>
          <TurnstileWidget siteKey={config.turnstileSiteKey} onToken={setTurnstileToken} />
        </div>
      ) : null}
      {error ? <p className="text-sm text-ember">{error}</p> : null}
      <AgeNotice />
    </form>
  );
}

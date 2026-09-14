"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useLegalAck } from "@/hooks/use-legal-ack";
import { isValidRoomSlug, roomPath, slugifyRoom } from "@/lib/rooms";

export function JoinForm() {
  const router = useRouter();
  const legal = useLegalAck();
  const [value, setValue] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = useMemo(() => slugifyRoom(value || "lobby"), [value]);
  const valid = isValidRoomSlug(slug);
  const needsAck = legal.ready && !legal.acknowledged;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
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
    if (needsAck) legal.acknowledge();
    setError(null);
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
          className="h-14 flex-1 rounded-2xl border border-line bg-black/30 px-4 text-lg text-ink outline-none transition placeholder:text-muted/70 focus:border-glare/50 focus:shadow-[0_0_0_4px_rgba(255,217,160,0.12)]"
        />
        <button
          type="submit"
          className="h-14 rounded-2xl bg-glare px-6 text-sm font-semibold tracking-wide text-[#2a1c0a] transition hover:bg-glare-hot"
        >
          Enter room
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
      {needsAck ? (
        <label className="flex items-start gap-3 text-sm leading-6 text-muted">
          <input
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
            .
          </span>
        </label>
      ) : null}
      {error ? <p className="text-sm text-ember">{error}</p> : null}
    </form>
  );
}

"use client";

import Link from "next/link";
import { GlareMark } from "@/components/glare-mark";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
      <GlareMark />
      <h1 className="mt-8 font-display text-4xl italic text-ink">
        Something flared out.
      </h1>
      <p className="mt-3 text-muted">
        The room hit an unexpected error. Try again, or go back to the lobby.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-glare px-5 py-3 text-sm font-semibold text-[#2a1c0a]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-line px-5 py-3 text-sm text-ink"
        >
          Home
        </Link>
      </div>
    </div>
  );
}

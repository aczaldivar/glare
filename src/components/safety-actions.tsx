"use client";

import { FormEvent, useState } from "react";
import { REPORT_REASONS, type ReportReason } from "@/lib/legal";
import type { Identity } from "@/lib/identity";

export function SafetyActions({
  room,
  identity,
  targetType,
  targetId,
  targetName,
  messageId,
  messageText,
  blocked,
  onHideMessage,
  onBlock,
  onUnblock,
}: {
  room: string;
  identity: Identity;
  targetType: "message" | "user";
  targetId: string;
  targetName: string;
  messageId?: string;
  messageText?: string;
  blocked: boolean;
  onHideMessage?: () => void;
  onBlock: () => void;
  onUnblock: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("spam");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onReport(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room,
          reason,
          reporterId: identity.id,
          reporterName: identity.name,
          targetType,
          targetId,
          targetName,
          messageId,
          messageText,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error || "Could not send that report.");
      }
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not send that report.");
    }
  }

  if (blocked) {
    return (
      <button
        type="button"
        onClick={onUnblock}
        className="inline-flex min-h-11 min-w-11 items-center text-[11px] text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        Unmute / Unblock
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="report-form"
          className="inline-flex min-h-11 min-w-11 items-center text-[11px] text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          {status === "done" ? "Reported" : "Report"}
        </button>
        {onHideMessage ? (
          <button
            type="button"
            onClick={onHideMessage}
            className="inline-flex min-h-11 min-w-11 items-center text-[11px] text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Hide
          </button>
        ) : null}
        <button
          type="button"
          onClick={onBlock}
          className="inline-flex min-h-11 min-w-11 items-center text-[11px] text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          {onHideMessage ? "Mute" : "Block"}
        </button>
      </div>
      {open && status !== "done" ? (
        <form
          id="report-form"
          onSubmit={onReport}
          className="panel absolute z-10 mt-2 w-56 rounded-2xl p-3"
        >
          <label
            htmlFor="report-reason"
            className="block text-[11px] uppercase tracking-[0.16em] text-muted"
          >
            Why?
          </label>
          <select
            id="report-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value as ReportReason)}
            className="mt-2 min-h-11 w-full rounded-xl border border-line bg-black/40 px-2 py-2 text-xs text-ink"
          >
            {REPORT_REASONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          {error ? <p className="mt-2 text-[11px] text-ember">{error}</p> : null}
          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-3 h-11 min-h-11 w-full rounded-xl bg-glare text-xs font-semibold text-[#2a1c0a] disabled:opacity-40"
          >
            {status === "sending" ? "Sending…" : "Send report"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

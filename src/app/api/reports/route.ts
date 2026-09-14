import { NextRequest } from "next/server";
import { validateDisplayName } from "@/lib/identity";
import { REPORT_REASONS, type ReportReason } from "@/lib/legal";
import { isUuid } from "@/lib/messages";
import { clientIp, hitRateLimit } from "@/lib/rate-limit";
import { addReport, type SafetyReport } from "@/lib/reports";
import { isValidRoomSlug, slugifyRoom } from "@/lib/rooms";

export const dynamic = "force-dynamic";

const REASON_IDS = new Set(REPORT_REASONS.map((item) => item.id));

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const {
    room,
    reason,
    reporterId,
    reporterName,
    targetType,
    targetId,
    targetName,
    messageId,
    messageText,
  } = body as Record<string, unknown>;

  const slug = typeof room === "string" ? slugifyRoom(room) : "";
  if (!isValidRoomSlug(slug)) {
    return Response.json({ error: "Invalid room." }, { status: 400 });
  }
  if (typeof reason !== "string" || !REASON_IDS.has(reason as ReportReason)) {
    return Response.json({ error: "Pick a report reason." }, { status: 400 });
  }
  if (targetType !== "message" && targetType !== "user") {
    return Response.json({ error: "Invalid report target." }, { status: 400 });
  }
  if (typeof reporterId !== "string" || !isUuid(reporterId)) {
    return Response.json({ error: "A valid reporter id is required." }, { status: 400 });
  }
  if (typeof targetId !== "string" || targetId.length < 8) {
    return Response.json({ error: "A valid target is required." }, { status: 400 });
  }

  const reporter =
    typeof reporterName === "string"
      ? validateDisplayName(reporterName)
      : { ok: false as const, error: "A display name is required." };
  if (!reporter.ok) {
    return Response.json({ error: reporter.error }, { status: 400 });
  }

  const namedTarget =
    typeof targetName === "string" && targetName.trim()
      ? targetName.trim().slice(0, 24)
      : "Unknown";

  const limited = await hitRateLimit(`report:${clientIp(request)}`);
  if (!limited.ok) {
    return Response.json(
      { error: "Thanks — wait a moment before sending another report." },
      { status: 429 },
    );
  }

  const report: SafetyReport = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    room: slug,
    reason: reason as ReportReason,
    reporterId,
    reporterName: reporter.name,
    targetType,
    targetId,
    targetName: namedTarget,
    messageId:
      typeof messageId === "string" && isUuid(messageId) ? messageId : undefined,
    messageText:
      typeof messageText === "string"
        ? messageText.slice(0, 500)
        : undefined,
  };

  addReport(report);
  return Response.json({ ok: true, id: report.id });
}

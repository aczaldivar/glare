import type { ReportReason } from "@/lib/legal";
import { pruneByRetention } from "@/lib/retention";

export type SafetyReport = {
  id: string;
  createdAt: number;
  room: string;
  reason: ReportReason;
  reporterId: string;
  reporterName: string;
  targetType: "message" | "user";
  targetId: string;
  targetName: string;
  messageId?: string;
  messageText?: string;
};

const MAX_REPORTS = 200;

const g = globalThis as typeof globalThis & {
  __glareReports?: SafetyReport[];
};

function store() {
  if (!g.__glareReports) {
    g.__glareReports = [];
  }
  return g.__glareReports;
}

export function addReport(report: SafetyReport) {
  const reports = store();
  reports.push(report);
  const kept = pruneByRetention(reports).slice(-MAX_REPORTS);
  reports.splice(0, reports.length, ...kept);
  console.info("[glare:report]", {
    id: report.id,
    room: report.room,
    reason: report.reason,
    targetType: report.targetType,
    targetId: report.targetId,
  });
  return report;
}

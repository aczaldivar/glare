/** Transcript and episode copy is plain text only. Never render as HTML. */
export function sanitizeTranscriptText(input: string) {
  const withoutScripts = input.replace(
    /<(script|style)[^>]*>[\s\S]*?<\/\1>/gi,
    " ",
  );
  const withoutTags = withoutScripts.replace(/<[^>]*>/g, " ");
  const decoded = withoutTags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
  return decoded
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

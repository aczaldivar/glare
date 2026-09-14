import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LEGAL_ACK_VERSION,
  LEGAL_DRAFT_DISCLAIMER,
  PRIVACY,
  TERMS,
} from "./legal";

function podcastSection(doc: { sections: { heading: string; body: string[] }[] }) {
  return doc.sections.find((section) => section.heading === "Podcast rooms");
}

test("podcast addendum is in Terms and Privacy, not a docs-unpatched blocker", () => {
  const terms = podcastSection(TERMS);
  const privacy = podcastSection(PRIVACY);
  assert.ok(terms);
  assert.ok(privacy);

  const termsText = terms.body.join(" ");
  const privacyText = privacy.body.join(" ");
  const combined = `${termsText} ${privacyText} ${LEGAL_DRAFT_DISCLAIMER}`;

  assert.match(termsText, /operator-curated/i);
  assert.match(termsText, /official embed/i);
  assert.match(termsText, /no user audio/i);
  assert.match(termsText, /user-generated content/i);
  assert.match(privacyText, /do not collect user-uploaded/i);
  assert.match(combined, /lawyer review is still recommended/i);
  assert.match(combined, /DMCA/i);
  assert.match(combined, /data-processing/i);

  assert.doesNotMatch(combined, /until these terms and the Privacy Policy are reviewed and patched/i);
  assert.doesNotMatch(combined, /Patch this policy before treating podcast rooms as a public product/i);
});

test("legal acknowledgment version is bumped for the podcast addendum", () => {
  assert.ok(LEGAL_ACK_VERSION >= 3);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_OPERATOR_CONTACT_EMAIL,
  OPERATOR_LEGAL_ADDRESS,
} from "./constants";
import {
  GUIDELINES,
  LEGAL_ACK_VERSION,
  LEGAL_DRAFT_DISCLAIMER,
  PRIVACY,
  TERMS,
} from "./legal";

function sectionBody(
  doc: { sections: { heading: string; body: string[] }[] },
  heading: string,
) {
  return doc.sections.find((section) => section.heading === heading);
}

function podcastSection(doc: { sections: { heading: string; body: string[] }[] }) {
  return sectionBody(doc, "Podcast rooms");
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

test("Terms, Privacy, and Guidelines contact include operator email and postal address", () => {
  assert.equal(DEFAULT_OPERATOR_CONTACT_EMAIL, "contact@glareroom.com");

  for (const doc of [TERMS, PRIVACY, GUIDELINES]) {
    const contact = sectionBody(doc, "Contact");
    assert.ok(contact);
    const text = contact.body.join(" ");
    assert.match(text, /contact@glareroom\.com/);
    assert.ok(text.includes(OPERATOR_LEGAL_ADDRESS));
    assert.doesNotMatch(text, /@glare\.com/);
    assert.doesNotMatch(text, /feedback@glare\.com/);
    assert.doesNotMatch(text, /feedback@glareroom\.com/);
  }

  const allLegalText = [TERMS, PRIVACY, GUIDELINES]
    .flatMap((doc) => doc.sections.flatMap((section) => section.body))
    .join(" ");
  assert.match(allLegalText, /contact@glareroom\.com/);
  assert.doesNotMatch(allLegalText, /@glare\.com/);
  assert.doesNotMatch(allLegalText, /feedback@/);
});

test("Terms governing law names California and a California venue", () => {
  const governing = sectionBody(TERMS, "Governing law and venue");
  assert.ok(governing);
  const text = governing.body.join(" ");
  assert.match(text, /laws of the State of California, USA/);
  assert.match(text, /courts located in California/);
  assert.match(text, /product draft/i);
});

test("legal acknowledgment version is bumped for operator address and governing law", () => {
  assert.ok(LEGAL_ACK_VERSION >= 4);
});

test("legal acknowledgment version is bumped for glareroom.com contact", () => {
  assert.ok(LEGAL_ACK_VERSION >= 5);
});

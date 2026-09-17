import { OPERATOR_LEGAL_ADDRESS } from "@/lib/constants";

export const LEGAL_ACK_VERSION = 4;
export const LEGAL_ACK_STORAGE_KEY = "glare.legal.ack.v1";
export const LEGAL_ACK_EVENT = "glare-legal-ack";
export const BLOCKS_STORAGE_KEY = "glare.blocks.v1";
export const BLOCKS_EVENT = "glare-blocks";
export const HIDDEN_MESSAGES_STORAGE_KEY = "glare.hidden-messages.v1";
export const HIDDEN_MESSAGES_EVENT = "glare-hidden-messages";

export const LEGAL_EFFECTIVE_DATE = "September 16, 2026";

export const LEGAL_DRAFT_DISCLAIMER =
  "This is a product draft written for Glare Room, not formal legal advice. Podcast rooms are covered by the curated-only addendum on these pages, so they are not blocked solely because the documents were unpatched. Formal lawyer review is still recommended for liability, a DMCA process if user uploads are ever added, and vendor data-processing agreements (hosting and realtime).";

export const AGE_NOTICE =
  "Glare Room is for ages 13 and up. We do not verify age.";

export const SAFETY_BANNER =
  "No illegal content. Harassment, exploitation, and abuse are not allowed. We may hide messages, remove rooms, or block access.";

export const REPORT_REASONS = [
  { id: "spam", label: "Spam or flooding" },
  { id: "harassment", label: "Harassment or hate" },
  { id: "illegal", label: "Illegal or dangerous content" },
  { id: "other", label: "Something else" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["id"];

export type LegalDoc = {
  slug: "guidelines" | "terms" | "privacy";
  title: string;
  kicker: string;
  summary: string;
  sections: { heading: string; body: string[] }[];
};

export const GUIDELINES: LegalDoc = {
  slug: "guidelines",
  title: "Community Guidelines",
  kicker: "How to stay in the room",
  summary:
    "Glare Room is public. Anyone with a link can walk in. These rules are the short version of how we expect people to behave, and why we may remove messages or rooms.",
  sections: [
    {
      heading: "Be a person in the room",
      body: [
        "Talk like you would in a public space with strangers. Display names are optional and are not verified accounts.",
        "Do not impersonate someone else in a way that is meant to deceive or harm.",
      ],
    },
    {
      heading: "No illegal content",
      body: [
        "Do not post, request, or link to illegal content. That includes child sexual abuse material, exploitation, trafficking, credible threats of violence, and anything else that is unlawful where the service is offered.",
        "We may remove rooms, drop messages, and report apparent illegal activity to the appropriate authorities when we believe we must.",
      ],
    },
    {
      heading: "No harassment, hate, or abuse",
      body: [
        "Do not target people with slurs, stalking, sexual harassment, or piles of hostile messages.",
        "Do not share someone’s private information (addresses, phone numbers, IDs, intimate images) without their clear consent.",
      ],
    },
    {
      heading: "No spam or disruption",
      body: [
        "Do not flood a room, run bots that drown out conversation, or use the service only to scrape or dump ads.",
        "Messages are capped in length and rate-limited. Trying to evade those limits is itself a violation.",
      ],
    },
    {
      heading: "Rooms are public and may disappear",
      body: [
        "A room name is not a private club. If you share the link, assume anyone can read it.",
        "We may close, rename, or refuse rooms that are used for harm, including rooms whose names themselves violate these guidelines.",
      ],
    },
    {
      heading: "If something is wrong",
      body: [
        "Use Report on a message or person, or email contact@glare.com. That logs a report for the operator. Mute or block someone locally in your browser if you do not want to see them.",
        "Reporting is not a substitute for contacting law enforcement if someone is in immediate danger.",
      ],
    },
    {
      heading: "Podcast rooms",
      body: [
        "Some rooms are tied to an operator-curated episode. Read the transcript we provide and talk in chat. If you cite a line, quote it from the transcript.",
        "Episodes are official embeds or rights-clear files we ship. Chat is user-generated content under these Guidelines. There is no user audio, transcript, or other media upload.",
      ],
    },
    {
      heading: "Contact",
      body: [
        "Email contact@glare.com about these guidelines. You can also use Report in a room to flag abuse on this instance.",
        `Postal address: ${OPERATOR_LEGAL_ADDRESS}.`,
      ],
    },
  ],
};

export const TERMS: LegalDoc = {
  slug: "terms",
  title: "Terms of Service",
  kicker: "The house rules for using Glare Room",
  summary:
    "By using Glare Room you agree to these terms. If you do not agree, do not enter a room. This draft is meant to be readable. It is not a substitute for a lawyer-reviewed contract.",
  sections: [
    {
      heading: "The service",
      body: [
        "Glare Room is a public, real-time chat product. You can create or join rooms by name, choose an optional display name, and share a link.",
        "There are no accounts in this version. Your browser stores a guest identity, your legal acknowledgment, and anyone you have muted or blocked.",
      ],
    },
    {
      heading: "Eligibility and acceptable use",
      body: [
        "Glare Room is for people 13 and older. We show that notice; we do not verify age.",
        "You agree to follow the Community Guidelines. You will not post illegal content, abuse others, attempt to break the service, or use it to operate malware, scams, or unauthorized access to systems.",
      ],
    },
    {
      heading: "Public rooms, not private messages",
      body: [
        "Do not treat Glare Room as a confidential messenger. Messages may be visible to anyone who joins the room, to operators, and to the infrastructure that delivers realtime events.",
        "Messages are intended to be ephemeral. The product target is to retain chat for about 30 days, then drop it. v1 does not keep a durable message database, so history may disappear sooner.",
      ],
    },
    {
      heading: "Moderation and removal",
      body: [
        "We may refuse, rate-limit, hide, or remove messages, names, or rooms. We may block access when we believe these terms or the law require it.",
        "We do not have to give advance notice, and we are not obligated to restore a room. Automated limits (length, send rate, and a human check when configured) are part of this.",
      ],
    },
    {
      heading: "Your content",
      body: [
        "You keep whatever rights you have in the words you type. You grant us a limited license to transmit, display, and store them as needed to run the chat, moderate it, and handle reports.",
        "You are responsible for what you send. Do not submit content you do not have the right to share.",
      ],
    },
    {
      heading: "The service is provided as-is",
      body: [
        "Glare Room is offered without warranties of any kind, to the fullest extent the law allows. Rooms can go down, messages can be lost, and realtime delivery can fail.",
        "To the fullest extent allowed by law, we are not liable for indirect, incidental, or consequential damages, or for disputes between people in a room.",
      ],
    },
    {
      heading: "Changes",
      body: [
        "We may update these terms as the product changes. If we make a material change, we may ask you to acknowledge the new version before entering a room again.",
        "If a court finds a part of these terms unenforceable, the rest still applies.",
      ],
    },
    {
      heading: "Podcast rooms",
      body: [
        "A podcast room pairs an operator-curated episode with a transcript and live chat. Only the operator adds episodes. You cannot upload, submit, or host your own show.",
        "Audio is an official embed or a rights-clear file we ship with this product (including the in-repo demo). We provide a transcript with each episode. There is no user audio, transcript, or other media upload.",
        "Chat in a podcast room is user-generated content. The Community Guidelines and the rest of these terms apply to what you type, including the license in “Your content.”",
        "This addendum is the Terms patch for that format. Formal lawyer review is still recommended for liability, a DMCA process if user uploads are ever added, and vendor data-processing agreements.",
      ],
    },
    {
      heading: "Governing law and venue",
      body: [
        "These terms are governed by the laws of the State of California, USA, without regard to conflict-of-law rules. If a dispute goes to court, the venue is the state and federal courts located in California, to the extent the law allows.",
        "This section is part of a product draft, not a substitute for lawyer review of liability or related clauses.",
      ],
    },
    {
      heading: "Contact",
      body: [
        "Email contact@glare.com about these terms. You can also use Report in a room to flag abuse on this instance.",
        `Postal address: ${OPERATOR_LEGAL_ADDRESS}.`,
      ],
    },
  ],
};

export const PRIVACY: LegalDoc = {
  slug: "privacy",
  title: "Privacy Policy",
  kicker: "What this version actually stores",
  summary:
    "Glare Room v1 does not ask you to create an account. This draft describes the information that typically exists when you use the app, so you can decide whether to walk in.",
  sections: [
    {
      heading: "What we collect in this version",
      body: [
        "Guest identity: a random id and optional display name stored in your browser (localStorage).",
        "Messages you send: transmitted to others in the room through our realtime path. They are not written to a product database in v1.",
        "Technical data that comes with any web request, such as IP address, user agent, and timestamps, which we may see in server logs.",
        "Reports you submit: room, target, optional reason, and your guest id, stored so an operator can review them.",
        "Legal acknowledgment: a flag in your browser that you agreed to the Community Guidelines and Terms.",
        "Mute/block lists: stored only in your browser so you can stop seeing someone.",
      ],
    },
    {
      heading: "What stays on your device",
      body: [
        "Display name, guest id, mute/block lists, hidden messages, and the legal acknowledgment live in localStorage on this browser.",
        "Clearing site data in your browser removes that local state. It does not unsay messages already seen by other people in a room.",
      ],
    },
    {
      heading: "Processors",
      body: [
        "The site may be hosted on Vercel. Realtime delivery in production uses Ably. When configured, Cloudflare Turnstile is used as a human check before chat tokens are minted. Those providers process data according to their own terms in order to host, transmit, or protect the service.",
        "We do not sell your personal information. v1 does not use analytics SDKs, advertising cookies, or tracking pixels.",
      ],
    },
    {
      heading: "Cookies and analytics",
      body: [
        "v1 does not set advertising or analytics cookies. Guest state uses localStorage (identity, legal acknowledgment, mute/block), not a tracking cookie.",
        "When Turnstile is configured, the app sets a short-lived httpOnly cookie after a successful human check so you can receive a chat token and send messages. It is not an advertising or analytics cookie.",
        "The host or browser may still use cookies that are strictly needed to run or protect the site itself.",
      ],
    },
    {
      heading: "Why we use this information",
      body: [
        "To operate public chat: deliver messages, show who is in a room, enforce length and rate limits, run a human check when configured, and keep basic safety tools working.",
        "To review reports and respond to abuse or legal requests when we have a good-faith reason to do so.",
      ],
    },
    {
      heading: "How long it lasts",
      body: [
        "Chat history is intended to last about 30 days, then be dropped. In v1 there is no durable message database; in-memory buffers and realtime rewind are usually much shorter. The app still ignores messages older than 30 days if they appear.",
        "Reports and server logs should follow the same ~30 day cap. A scheduled deletion job for durable storage is documented in the README until it is wired to a database.",
      ],
    },
    {
      heading: "Your choices",
      body: [
        "Do not enter a room if you do not want to be in a public conversation.",
        "Change or clear your display name, mute or block people locally, and stop using the site. Because there is no account, we cannot offer a global “delete my profile” button that reaches other people’s screens.",
      ],
    },
    {
      heading: "Children",
      body: [
        "Glare Room is for ages 13 and up. We show that notice and do not verify age. Do not use it to share information about minors or to contact them. We will remove apparent child sexual abuse material and related exploitation without notice.",
      ],
    },
    {
      heading: "Podcast rooms",
      body: [
        "Podcast rooms use operator-curated episodes only. Audio is an official embed or a rights-clear file we ship. We provide the transcript with the episode. We do not collect user-uploaded audio, transcripts, or other media.",
        "Chat in a podcast room is the same public user-generated chat described above. Playback of a curated file happens in your browser from this site (or from an official embed provider if one is wired). We do not add extra analytics for podcast rooms.",
        "This addendum is the Privacy patch for that format. Formal lawyer review is still recommended for vendor data-processing agreements (hosting and realtime) and for a DMCA process if user uploads are ever added.",
      ],
    },
    {
      heading: "Contact",
      body: [
        "Email contact@glare.com about this policy, privacy questions, or legal requests. You can also use Report in a room to flag abuse on this instance.",
        `Postal address: ${OPERATOR_LEGAL_ADDRESS}.`,
      ],
    },
  ],
};

export const LEGAL_DOCS: LegalDoc[] = [GUIDELINES, TERMS, PRIVACY];

export function legalPath(slug: LegalDoc["slug"]) {
  return `/${slug}`;
}

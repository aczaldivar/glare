import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from "@/lib/constants";

const ADJECTIVES = [
  "Amber",
  "Quiet",
  "Silver",
  "Neon",
  "Velvet",
  "Copper",
  "Lucid",
  "Solar",
  "Night",
  "Soft",
  "Vivid",
  "Bright",
  "Ivory",
  "North",
  "Fable",
  "Hollow",
  "Sable",
  "Opal",
] as const;

const NOUNS = [
  "Wren",
  "Lamp",
  "Fox",
  "Harbor",
  "Glass",
  "Orchid",
  "Comet",
  "Studio",
  "Signal",
  "Mirror",
  "Spark",
  "Echo",
  "Flare",
  "Grove",
  "Atlas",
  "Current",
  "Atrium",
  "Room",
] as const;

const PALETTE = [
  "#ffd9a0",
  "#f0c27a",
  "#e8a15a",
  "#d7c4ff",
  "#9ecbff",
  "#7dffb3",
  "#ffb3c7",
  "#c9e29b",
  "#b8f0e8",
  "#ffd0a8",
];

export type Identity = {
  id: string;
  name: string;
};

export function randomGuestName() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}

export function createIdentity(): Identity {
  return {
    id: crypto.randomUUID(),
    name: randomGuestName(),
  };
}

export function normalizeDisplayName(input: string): string {
  return input.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

export function validateDisplayName(input: string): {
  ok: true;
  name: string;
} | { ok: false; error: string } {
  const name = normalizeDisplayName(input);
  if (name.length < MIN_NAME_LENGTH) {
    return { ok: false, error: "Add a display name." };
  }
  if (/[\u0000-\u001F\u007F]/.test(name)) {
    return { ok: false, error: "That name contains invalid characters." };
  }
  return { ok: true, name };
}

export function colorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

"use client";

import { FormEvent } from "react";
import { MAX_NAME_LENGTH } from "@/lib/constants";
import { colorFromId, initialsFromName, type Identity } from "@/lib/identity";

export function NameChip({
  identity,
  editing,
  nameDraft,
  onNameDraft,
  onStartEdit,
  onSave,
}: {
  identity: Identity;
  editing: boolean;
  nameDraft: string;
  onNameDraft: (value: string) => void;
  onStartEdit: () => void;
  onSave: (event: FormEvent) => void;
}) {
  if (editing) {
    return (
      <form onSubmit={onSave} className="flex min-w-0 items-center gap-2">
        <input
          value={nameDraft}
          onChange={(event) => onNameDraft(event.target.value)}
          maxLength={MAX_NAME_LENGTH}
          aria-label="Display name"
          className="h-11 min-h-11 min-w-0 max-w-40 rounded-full border border-line bg-black/30 px-3 text-sm outline-none focus:border-glare/50"
          autoFocus
        />
        <button
          type="submit"
          className="inline-flex h-11 min-h-11 min-w-11 items-center justify-center rounded-full bg-glare px-3 text-xs font-semibold text-[#2a1c0a]"
        >
          Save
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={onStartEdit}
      className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-line px-2 py-1 text-left transition hover:border-glare/40"
      aria-label={`Display name ${identity.name}. Click to rename.`}
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-[#1a1208]"
        style={{ background: colorFromId(identity.id) }}
      >
        {initialsFromName(identity.name)}
      </span>
      <span className="truncate pr-2 text-sm text-ink">{identity.name}</span>
    </button>
  );
}

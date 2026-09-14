const PREVIEW = [
  { name: "Silver Wren", text: "Anyone here from the late set?", own: false },
  { name: "You", text: "Just walked in. Leave the lights on.", own: true },
  { name: "Copper Harbor", text: "Lobby is the featured room — drop a link.", own: false },
];

export function RoomPreview() {
  return (
    <aside className="panel rise-in hidden overflow-hidden rounded-[28px] lg:row-span-2 lg:block">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
            Live preview
          </p>
          <p className="mt-1 text-sm text-ink">#lobby</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-muted">
          <span className="live-dot size-1.5 rounded-full bg-live" />
          3 in the room
        </span>
      </div>
      <div className="space-y-4 px-5 py-5">
        {PREVIEW.map((message) => (
          <div
            key={message.text}
            className={`flex ${message.own ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.own
                  ? "bg-[linear-gradient(180deg,rgba(255,217,160,0.2),rgba(255,217,160,0.08))] text-glare-hot"
                  : "bg-white/5 text-ink"
              }`}
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                {message.name}
              </p>
              <p className="mt-1 text-sm leading-6">{message.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-line px-5 py-4">
        <div className="rounded-2xl border border-dashed border-line px-4 py-3 text-sm text-muted">
          Write to the room
        </div>
      </div>
    </aside>
  );
}

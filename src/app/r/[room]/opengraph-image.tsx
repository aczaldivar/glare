import { ImageResponse } from "next/og";
import { APP_NAME } from "@/lib/constants";
import { isValidRoomSlug, roomDisplayName, slugifyRoom } from "@/lib/rooms";

export const alt = `${APP_NAME} room`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room } = await params;
  const slug = slugifyRoom(room);
  const name = isValidRoomSlug(slug) ? roomDisplayName(slug) : "Room";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#08080a",
          color: "#f6f1e8",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(255,217,160,0.28), transparent 56%)",
          }}
        />
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: "#ffd9a0" }}>
          {APP_NAME}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, color: "#a39b8f" }}>#{slug || "room"}</div>
          <div style={{ fontSize: 88, fontStyle: "italic", lineHeight: 1.05 }}>{name}</div>
          <div style={{ marginTop: 24, fontSize: 28, color: "#a39b8f" }}>
            Public live chat · no account required
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

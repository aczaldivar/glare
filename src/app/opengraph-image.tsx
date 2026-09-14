import { ImageResponse } from "next/og";
import { APP_NAME } from "@/lib/constants";

export const alt = `${APP_NAME} — public live chat`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 8, textTransform: "uppercase", color: "#ffd9a0" }}>
          Public rooms
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontStyle: "italic", lineHeight: 1 }}>Glare Room</div>
          <div style={{ marginTop: 24, fontSize: 32, color: "#a39b8f" }}>
            Walk in. Talk live. Share the link.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

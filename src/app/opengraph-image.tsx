import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          color: "black",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 32, color: "#71717a" }}>cajuos.dev</div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 16 }}>
          Uma tool por semana
        </div>
      </div>
    )
  );
}

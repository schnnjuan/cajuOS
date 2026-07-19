import { ImageResponse } from "next/og";
import bgB64 from "@/lib/og-bg";

export function ogImageResponse(title: string, subtitle: string) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "64px 72px",
        backgroundImage: `url(data:image/jpeg;base64,${bgB64})`,
        backgroundSize: "1200px 630px",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <h1
        style={{
          color: "#18181b",
          fontSize: 64,
          fontWeight: 700,
          lineHeight: 1.15,
          margin: 0,
          maxWidth: 900,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            color: "#a1a1aa",
            fontSize: 28,
            fontWeight: 400,
            margin: "16px 0 0 0",
            maxWidth: 800,
            lineHeight: 1.3,
          }}
        >
          {subtitle}
        </p>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          right: 48,
          color: "#a1a1aa",
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}
      >
        cajuos.dev
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}

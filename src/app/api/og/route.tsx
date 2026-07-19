import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.slice(0, 60) || "CajuOS";
  const subtitle = searchParams.get("subtitle")?.slice(0, 90) || "";

  try {
    const [regularFont, boldFont] = await Promise.all([
      fetch(
        "https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/fonts/geist-sans/Geist-Regular.woff2",
      ).then((r) => r.arrayBuffer()),
      fetch(
        "https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/fonts/geist-sans/Geist-Bold.woff2",
      ).then((r) => r.arrayBuffer()),
    ]);

    let bgDataUri = "";
    try {
      const bgUrl = new URL("/og-bg.png", request.url).toString();
      const bgRes = await fetch(bgUrl);
      if (bgRes.ok) {
        const bgBuf = await bgRes.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(bgBuf).reduce(
            (d, b) => d + String.fromCharCode(b),
            "",
          ),
        );
        bgDataUri = `data:image/png;base64,${base64}`;
      }
    } catch {
      // fallback to solid background below
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "64px 72px",
            backgroundColor: bgDataUri ? undefined : "#ffffff",
            backgroundImage: bgDataUri ? `url(${bgDataUri})` : undefined,
            backgroundSize: "1200px 630px",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <h1
            style={{
              color: "#18181b",
              fontFamily: "Geist",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.15,
              margin: 0,
              maxWidth: 900,
              letterSpacing: "-0.02em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                color: "#a1a1aa",
                fontFamily: "Geist",
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
              fontFamily: "Geist",
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            cajuos.dev
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Geist",
            data: regularFont,
            weight: 400,
            style: "normal",
          },
          {
            name: "Geist",
            data: boldFont,
            weight: 700,
            style: "normal",
          },
        ],
      },
    );
  } catch {
    return new Response("OG generation failed", { status: 500 });
  }
}

import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "56px",
          background:
            "linear-gradient(135deg, #0b1a32 0%, #10233f 42%, #184c63 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0",
            background:
              "radial-gradient(circle at 18% 18%, rgba(96, 165, 250, 0.28), transparent 30%), radial-gradient(circle at 88% 20%, rgba(52, 211, 153, 0.2), transparent 24%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "36px",
            padding: "42px",
            background: "rgba(8, 16, 30, 0.34)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #ffffff 0%, #bfd6ff 100%)",
                color: "#10233f",
                fontSize: "32px",
                fontWeight: 800,
              }}
            >
              C
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "26px", fontWeight: 700 }}>Cognispark</div>
              <div style={{ fontSize: "18px", color: "#dbeafe" }}>
                Physics, mission by mission
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "860px" }}>
            <div
              style={{
                fontSize: "72px",
                fontWeight: 800,
                lineHeight: 0.94,
                letterSpacing: "-0.05em",
              }}
            >
              Guided physics lessons students actually want to keep opening.
            </div>
            <div style={{ fontSize: "26px", lineHeight: 1.45, color: "#d7e6fb" }}>
              Real lesson visuals, instant feedback, and a clear route from foundations to advanced modules.
            </div>
          </div>

          <div style={{ display: "flex", gap: "18px" }}>
            {["Foundations", "Core Physics", "Advanced Physics"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 18px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(255,255,255,0.08)",
                  fontSize: "18px",
                  color: "#e2e8f0",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

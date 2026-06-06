import { ImageResponse } from "next/og";

// Favicon / app icon — NhaPilot monogram on a dark tile (N blue, P silver).
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#1e293b,#020617)",
          borderRadius: 16,
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: -2,
          fontFamily: "sans-serif",
        }}
      >
        <span style={{ color: "#3b82f6" }}>N</span>
        <span style={{ color: "#cbd5e1" }}>P</span>
      </div>
    ),
    size,
  );
}

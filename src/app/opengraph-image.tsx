import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/** Default social-share card for every page without its own image. Rendered once at build time. */
export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`;
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
          justifyContent: "center",
          padding: "0 96px",
          background: "#A0153E",
          color: "#FFFFFF",
        }}
      >
        <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>{SITE_NAME}</div>
        <div style={{ marginTop: 32, fontSize: 44, opacity: 0.9 }}>{SITE_TAGLINE}</div>
        <div style={{ marginTop: 64, width: 120, height: 6, background: "#FFFFFF" }} />
      </div>
    ),
    size,
  );
}

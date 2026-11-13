import { ImageResponse } from "next/og";

export const alt =
  "Print Sheet Maker — Free Online Studio for Photo, Business Card, Label & Jar Print Sheets";
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
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#09090b",
          color: "#ffffff",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#4d7c0f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              P
            </div>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Print Sheet Maker
            </span>
          </div>

          <div
            style={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "999px",
              padding: "10px 22px",
              fontSize: "18px",
              color: "#a3e635",
              fontWeight: 600,
            }}
          >
            Free · No Sign-Up · 300 DPI PDF &amp; JPEG
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "62px",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
            }}
          >
            Passport Photos, Photo Grids, Business Cards &amp; Label Sheets
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#a1a1aa",
              lineHeight: 1.4,
            }}
          >
            Exact millimeter layouts for EU, UK, India &amp; US passport photos,
            A4/Letter label templates, and 4×6 kiosk prints.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "14px",
          }}
        >
          {[
            "EU / UK 35×45 mm",
            "US 2×2 in",
            "India 35×45 & OCI",
            "4×6 Kiosk & A4 PDF",
          ].map((pill) => (
            <div
              key={pill}
              style={{
                backgroundColor: "#27272a",
                borderRadius: "10px",
                padding: "10px 18px",
                fontSize: "18px",
                fontWeight: 600,
                color: "#e4e4e7",
              }}
            >
              {pill}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}


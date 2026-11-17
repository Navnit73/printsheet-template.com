import { PT_TO_MM, cssStack, rgbCss, type CardEl } from "./engine";

export function CardFacePreview({
  W,
  H,
  els,
  images,
  label,
}: {
  W: number;
  H: number;
  els: CardEl[];
  images: { logo?: string; qr?: string };
  label: string;
}) {
  const px = (v: number) => `${(v / W) * 100}%`;
  const py = (v: number) => `${(v / H) * 100}%`;
  const cq = (mm: number) => `${(mm / W) * 100}cqw`;
  return (
    <>
      {els.map((el, idx) => {
        if (el.kind === "rect") {
          return (
            <div
              key={idx}
              aria-hidden="true"
              className="absolute"
              style={{ left: px(el.x), top: py(el.y), width: px(el.w), height: py(el.h), backgroundColor: rgbCss(el.fill) }}
            />
          );
        }
        if (el.kind === "circle") {
          return (
            <div
              key={idx}
              aria-hidden="true"
              className="absolute rounded-full"
              style={{
                left: px(el.cx - el.r),
                top: py(el.cy - el.r),
                width: px(2 * el.r),
                height: py(2 * el.r),
                backgroundColor: rgbCss(el.fill),
              }}
            />
          );
        }
        if (el.kind === "ellipse") {
          return (
            <div
              key={idx}
              aria-hidden="true"
              className="absolute rounded-full"
              style={{
                left: px(el.cx - el.rx),
                top: py(el.cy - el.ry),
                width: px(2 * el.rx),
                height: py(2 * el.ry),
                backgroundColor: rgbCss(el.fill),
              }}
            />
          );
        }
        if (el.kind === "frame") {
          return (
            <div
              key={idx}
              aria-hidden="true"
              className="absolute"
              style={{
                left: px(el.x),
                top: py(el.y),
                width: px(el.w),
                height: py(el.h),
                border: `max(1px, ${cq(el.lineWidth)}) solid ${rgbCss(el.stroke)}`,
              }}
            />
          );
        }
        if (el.kind === "image") {
          const src = el.src ?? (el.which ? images[el.which] : undefined);
          if (!src) return null;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={idx}
              src={src}
              alt={el.which === "logo" ? "Uploaded company logo" : el.which === "qr" ? "Generated QR Code" : "Added image"}
              className="absolute"
              style={{ left: px(el.x), top: py(el.y), width: px(el.w), height: py(el.h) }}
            />
          );
        }
        const { opts, layout } = el;
        const stack = cssStack(opts.fontFamily ?? "helvetica", el.text);
        const trackMm = el.trackEm ? el.trackEm * layout.fontSize * PT_TO_MM : 0;
        return layout.lines.map((line, i) => (
          <div
            key={`${idx}-${i}`}
            className="absolute whitespace-nowrap"
            style={{
              top: py(opts.y + i * layout.lineHeightMm),
              ...(opts.align === "center"
                ? { left: px(opts.x), transform: "translateX(-50%)" }
                : opts.align === "right"
                  ? { right: px(W - opts.x) }
                  : { left: px(opts.x) }),
              fontSize: cq(layout.fontSize * PT_TO_MM),
              lineHeight: 1,
              fontFamily: stack,
              fontWeight: opts.fontStyle === "bold" || opts.fontStyle === "bolditalic" ? 700 : 400,
              fontStyle: opts.fontStyle === "italic" || opts.fontStyle === "bolditalic" ? "italic" : undefined,
              letterSpacing: trackMm ? cq(trackMm) : undefined,
              color: rgbCss(opts.color ?? [24, 24, 27]),
            }}
          >
            {line}
          </div>
        ));
      })}
      <span className="sr-only">{label}</span>
    </>
  );
}

import React, { useId } from "react";
import { getCardIcon } from "./icons";
import { PT_TO_MM, cssStack, rgbCss, type CardEl, type PatternKind, type RGB } from "./engine";

function PatternSvg({
  id,
  pattern,
  bg,
  fg,
  opacity,
  scale,
}: {
  id: string;
  pattern: PatternKind;
  bg: RGB;
  fg: RGB;
  opacity: number;
  scale: number;
}) {
  const sz = Math.max(4, Math.min(30, 8 * scale));
  const fgStr = rgbCss(fg);
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
      <defs>
        <pattern id={id} width={sz} height={sz} patternUnits="userSpaceOnUse">
          {pattern === "dots" && <circle cx={sz / 2} cy={sz / 2} r={Math.max(0.8, sz * 0.14)} fill={fgStr} fillOpacity={opacity} />}
          {pattern === "grid" && (
            <path d={`M ${sz} 0 L 0 0 0 ${sz}`} fill="none" stroke={fgStr} strokeOpacity={opacity} strokeWidth={Math.max(0.5, sz * 0.06)} />
          )}
          {pattern === "diagonal" && (
            <path
              d={`M -${sz * 0.25} ${sz * 0.25} l ${sz * 0.5} -${sz * 0.5} M 0 ${sz} l ${sz} -${sz} M ${sz * 0.75} ${sz * 1.25} l ${sz * 0.5} -${sz * 0.5}`}
              fill="none"
              stroke={fgStr}
              strokeOpacity={opacity}
              strokeWidth={Math.max(0.6, sz * 0.09)}
            />
          )}
          {pattern === "crosshatch" && (
            <path
              d={`M 0 0 L ${sz} ${sz} M ${sz} 0 L 0 ${sz}`}
              fill="none"
              stroke={fgStr}
              strokeOpacity={opacity}
              strokeWidth={Math.max(0.5, sz * 0.06)}
            />
          )}
          {pattern === "waves" && (
            <path
              d={`M 0 ${sz * 0.5} Q ${sz * 0.25} ${sz * 0.15} ${sz * 0.5} ${sz * 0.5} T ${sz} ${sz * 0.5}`}
              fill="none"
              stroke={fgStr}
              strokeOpacity={opacity}
              strokeWidth={Math.max(0.6, sz * 0.08)}
            />
          )}
          {pattern === "diamonds" && (
            <path
              d={`M ${sz / 2} 1 L ${sz - 1} ${sz / 2} L ${sz / 2} ${sz - 1} L 1 ${sz / 2} Z`}
              fill="none"
              stroke={fgStr}
              strokeOpacity={opacity}
              strokeWidth={Math.max(0.5, sz * 0.07)}
            />
          )}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={rgbCss(bg)} />
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function starPolygonPoints(): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 48 : 20;
    const angle = ((i * 36 - 90) * Math.PI) / 180;
    pts.push(`${(50 + r * Math.cos(angle)).toFixed(2)},${(50 + r * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(" ");
}

const STAR_POINTS = starPolygonPoints();

export function CardFacePreview({
  W,
  H,
  els,
  images,
  label,
  editingLayerId,
}: {
  W: number;
  H: number;
  els: CardEl[];
  images: { logo?: string; qr?: string };
  label: string;
  /** Hide this text layer while it is being edited inline on the canvas. */
  editingLayerId?: string | null;
}) {
  const patUid = useId().replace(/:/g, "");
  const px = (v: number) => `${(v / W) * 100}%`;
  const py = (v: number) => `${(v / H) * 100}%`;
  const cq = (mm: number) => `${(mm / W) * 100}cqw`;

  return (
    <>
      {els.map((el, idx) => {
        const opacity = el.opacity !== undefined && el.opacity < 1 ? el.opacity : undefined;
        const rot = el.rotation ? `rotate(${el.rotation}deg)` : undefined;

        if (el.kind === "bg-gradient") {
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
                backgroundImage: `linear-gradient(${el.angle}deg, ${rgbCss(el.from)}, ${rgbCss(el.to)})`,
              }}
            />
          );
        }

        if (el.kind === "bg-pattern") {
          return (
            <div
              key={idx}
              aria-hidden="true"
              className="absolute overflow-hidden"
              style={{ left: px(el.x), top: py(el.y), width: px(el.w), height: py(el.h) }}
            >
              <PatternSvg
                id={`pat-${patUid}-${idx}`}
                pattern={el.pattern}
                bg={el.bg}
                fg={el.fg}
                opacity={el.patternOpacity}
                scale={el.scale}
              />
            </div>
          );
        }

        if (el.kind === "bg-image") {
          return (
            <div
              key={idx}
              aria-hidden="true"
              className="absolute overflow-hidden"
              style={{ left: px(el.x), top: py(el.y), width: px(el.w), height: py(el.h) }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={el.src}
                alt=""
                className="h-full w-full"
                style={{ objectFit: el.fit, opacity: el.opacity ?? 1 }}
              />
              {el.tint && (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: rgbCss(el.tint), opacity: el.tintOpacity ?? 0.35 }}
                />
              )}
            </div>
          );
        }

        if (el.kind === "rect") {
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
                backgroundColor: rgbCss(el.fill),
                borderRadius: el.radius ? cq(el.radius) : undefined,
                border: el.stroke && el.lineWidth ? `max(1px, ${cq(el.lineWidth)}) solid ${rgbCss(el.stroke)}` : undefined,
                opacity,
                transform: rot,
                transformOrigin: "center center",
              }}
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
                opacity,
                transform: rot,
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
                border: el.stroke && el.lineWidth ? `max(1px, ${cq(el.lineWidth)}) solid ${rgbCss(el.stroke)}` : undefined,
                opacity,
                transform: rot,
                transformOrigin: "center center",
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
                borderRadius: el.radius ? cq(el.radius) : undefined,
                opacity,
                transform: rot,
                transformOrigin: "center center",
              }}
            />
          );
        }

        if (el.kind === "triangle" || el.kind === "star") {
          return (
            <svg
              key={idx}
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute overflow-visible"
              style={{
                left: px(el.x),
                top: py(el.y),
                width: px(el.w),
                height: py(el.h),
                opacity,
                transform: rot,
                transformOrigin: "center center",
              }}
            >
              {el.kind === "triangle" ? (
                <polygon
                  points="50,3 97,97 3,97"
                  fill={rgbCss(el.fill)}
                  stroke={el.stroke ? rgbCss(el.stroke) : "none"}
                  strokeWidth={el.stroke && el.lineWidth ? el.lineWidth * 4 : 0}
                />
              ) : (
                <polygon
                  points={STAR_POINTS}
                  fill={rgbCss(el.fill)}
                  stroke={el.stroke ? rgbCss(el.stroke) : "none"}
                  strokeWidth={el.stroke && el.lineWidth ? el.lineWidth * 4 : 0}
                />
              )}
            </svg>
          );
        }

        if (el.kind === "line") {
          const borderStyle = el.dash === "dashed" ? "dashed" : el.dash === "dotted" ? "dotted" : "solid";
          return (
            <div
              key={idx}
              aria-hidden="true"
              className="absolute flex items-center"
              style={{
                left: px(el.x),
                top: py(el.y),
                width: px(el.w),
                height: py(el.h),
                opacity,
                transform: rot,
                transformOrigin: "center center",
              }}
            >
              <span
                className="block w-full"
                style={{
                  borderTopWidth: `max(1px, ${cq(el.lineWidth)})`,
                  borderTopStyle: borderStyle,
                  borderTopColor: rgbCss(el.stroke),
                }}
              />
            </div>
          );
        }

        if (el.kind === "icon") {
          const def = getCardIcon(el.iconId);
          return (
            <svg
              key={idx}
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke={rgbCss(el.color)}
              strokeWidth={el.strokeWidth ?? 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute"
              style={{
                left: px(el.x),
                top: py(el.y),
                width: px(el.w),
                height: py(el.h),
                opacity,
                transform: rot,
                transformOrigin: "center center",
              }}
            >
              {def.paths.map((d, i) => (
                <path key={`p${i}`} d={d} />
              ))}
              {def.circles?.map(([cx, cy, r], i) => (
                <circle key={`c${i}`} cx={cx} cy={cy} r={r} />
              ))}
            </svg>
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
              style={{
                left: px(el.x),
                top: py(el.y),
                width: px(el.w),
                height: py(el.h),
                objectFit: el.fit ?? "contain",
                borderRadius: el.radius ? cq(el.radius) : undefined,
                opacity,
                transform: rot,
                transformOrigin: "center center",
              }}
            />
          );
        }

        // Text element
        if (editingLayerId && el.layerId === editingLayerId) {
          return null;
        }
        const { opts, layout } = el;
        const stack = cssStack(opts.fontFamily ?? "helvetica", el.text, el.fontId);
        const trackMm = el.trackEm ? el.trackEm * layout.fontSize * PT_TO_MM : 0;

        // If rotated, wrap lines inside a single rotated bounding container matching the layer box.
        if (el.rotation) {
          const bx = el.boxX ?? (opts.align === "center" ? opts.x - opts.maxWidth / 2 : opts.align === "right" ? opts.x - opts.maxWidth : opts.x);
          const bw = el.boxW ?? opts.maxWidth;
          const bh = Math.max(layout.heightMm, layout.fontSize * PT_TO_MM * (opts.lineHeightFactor ?? 1.2));
          return (
            <div
              key={idx}
              className="absolute"
              style={{
                left: px(bx),
                top: py(opts.y),
                width: px(bw),
                height: py(bh),
                opacity,
                transform: rot,
                transformOrigin: "center center",
              }}
            >
              {layout.lines.map((line, i) => (
                <div
                  key={i}
                  className="absolute whitespace-nowrap"
                  style={{
                    top: `${(i * layout.lineHeightMm / bh) * 100}%`,
                    ...(opts.align === "center"
                      ? { left: "50%", transform: "translateX(-50%)" }
                      : opts.align === "right"
                        ? { right: 0 }
                        : { left: 0 }),
                    fontSize: cq(layout.fontSize * PT_TO_MM),
                    lineHeight: 1,
                    fontFamily: stack,
                    fontWeight: opts.fontStyle === "bold" || opts.fontStyle === "bolditalic" ? 700 : 400,
                    fontStyle: opts.fontStyle === "italic" || opts.fontStyle === "bolditalic" ? "italic" : undefined,
                    textDecoration: el.underline ? "underline" : undefined,
                    letterSpacing: trackMm ? cq(trackMm) : undefined,
                    color: rgbCss(opts.color ?? [24, 24, 27]),
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          );
        }

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
              textDecoration: el.underline ? "underline" : undefined,
              letterSpacing: trackMm ? cq(trackMm) : undefined,
              color: rgbCss(opts.color ?? [24, 24, 27]),
              opacity,
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

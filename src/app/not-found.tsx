import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, IdCard } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandLogo";

export const metadata: Metadata = {
  title: "Page Not Found | Print Sheet Maker",
  description:
    "The requested print sheet page could not be found. Browse our free passport photo, photo sheet, business card, and label makers.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 text-center space-y-6">
      <BrandMark className="h-12 w-12 mx-auto" />

      <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
        Page Not Found (404)
      </h1>

      <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto leading-relaxed">
        We could not find that URL. Choose one of our free, browser-based print
        sheet tools below to continue without signing up.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-3 text-sm font-bold text-zinc-950 transition"
        >
          <IdCard className="h-4 w-4" aria-hidden="true" />
          <span>Open Passport &amp; Print Sheet Studio</span>
        </Link>

        <Link
          href="/photo-sheets/"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebeced] px-4 py-3 text-sm font-semibold text-zinc-800 transition"
        >
          <span>Browse Photo Sheets</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-left">
        {[
          {
            href: "/photo-sheets/",
            title: "Photo Sheets",
            desc: "Passport sheets, 2-up, 4-up, collages & multi-page posters.",
          },
          {
            href: "/business-cards/",
            title: "Business Cards",
            desc: "8-up and 10-up card sheets, templates & QR visiting cards.",
          },
          {
            href: "/labels-stickers/",
            title: "Labels & Stickers",
            desc: "A4/Letter label templates, round stickers, barcodes & tags.",
          },
          {
            href: "/jar-bottle-labels/",
            title: "Jar & Bottle Labels",
            desc: "Mason jar, jam, spice, candle, bottle & essential oil labels.",
          },
        ].map((hub) => (
          <Link
            key={hub.href}
            href={hub.href}
            className="rounded-3xl bg-[#f5f5f7] hover:bg-[#efeff2] p-5 transition block"
          >
            <p className="text-sm font-bold text-zinc-950">{hub.title}</p>
            <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
              {hub.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}


import Link from "next/link";
import { IdCard } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";

const NAV_LINKS = [
  { href: "/photo-sheets/", label: "Photo Sheets" },
  { href: "/business-cards/", label: "Business Cards" },
  { href: "/labels-stickers/", label: "Labels & Stickers" },
  { href: "/jar-bottle-labels/", label: "Jar & Bottle Labels" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md no-print">
      <div className="page-container flex items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="inline-flex items-center hover:opacity-85 transition"
        >
          <BrandLogo size="header" />
        </Link>

        <nav
          aria-label="Primary categories"
          className="hidden md:flex items-center gap-1 rounded-2xl bg-[#f5f5f7] p-1"
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="min-h-[34px] inline-flex items-center rounded-xl px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-white hover:text-zinc-950 transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/guides/"
            className="hidden sm:inline-flex min-h-[36px] items-center rounded-xl bg-[#f5f5f7] px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-[#ebeced] hover:text-zinc-950 transition"
          >
            Print Guides
          </Link>
          <Link
            href="/photo-sheets/passport-photo-sheet-maker/"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-600 transition"
          >
            <IdCard aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Passport Sheet</span>
          </Link>
        </div>
      </div>

      {/* Mobile category rail */}
      <nav
        aria-label="Mobile categories"
        className="page-container flex md:hidden items-center gap-1.5 overflow-x-auto pb-3 bg-white"
      >
        <Link
          href="/photo-sheets/passport-photo-sheet-maker/"
          className="shrink-0 min-h-[34px] inline-flex items-center rounded-xl bg-[#eef6e4] px-3 py-1.5 text-xs font-semibold text-[#365314]"
        >
          Passport Photos
        </Link>
        {NAV_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 min-h-[34px] inline-flex items-center rounded-xl bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-[#ebeced] hover:text-zinc-950"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

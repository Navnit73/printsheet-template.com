import Link from "next/link";
import { Printer } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-[#f5f5f7] text-zinc-700 no-print">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5 text-zinc-950">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#3f6212]"
              >
                <Printer className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold tracking-tight">Print Sheet Maker</span>
            </Link>
            <p className="text-xs leading-relaxed text-zinc-600">
              Free browser-based print layout tools for A4, A3, Letter, and 4×6 sheets. No sign-up required; all PDF rendering runs locally on your device.
            </p>
          </div>

          <nav aria-label="Photo sheets footer links" className="space-y-2.5">
            <p className="text-xs font-bold tracking-tight text-zinc-950">
              Photo Sheets
            </p>
            <ul className="space-y-1.5 text-xs text-zinc-600">
              <li>
                <Link href="/photo-sheets/" className="inline-block py-1 hover:text-[#3f6212] transition">
                  photo layout maker for printing
                </Link>
              </li>
              <li>
                <Link
                  href="/photo-sheets/photo-sheet-maker/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  arrange photos for printing
                </Link>
              </li>
              <li>
                <Link
                  href="/photo-sheets/print-4-photos-on-one-page/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  print 4 photos on one page
                </Link>
              </li>
              <li>
                <Link
                  href="/photo-sheets/print-big-picture-on-multiple-pages/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  print big picture on multiple pages
                </Link>
              </li>
              <li>
                <Link
                  href="/photo-sheets/a4-collage-maker/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  a4 collage maker
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Business cards footer links" className="space-y-2.5">
            <p className="text-xs font-bold tracking-tight text-zinc-950">
              Business Cards
            </p>
            <ul className="space-y-1.5 text-xs text-zinc-600">
              <li>
                <Link href="/business-cards/" className="inline-block py-1 hover:text-[#3f6212] transition">
                  layout for business cards
                </Link>
              </li>
              <li>
                <Link
                  href="/business-cards/business-card-template/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  business card template
                </Link>
              </li>
              <li>
                <Link
                  href="/business-cards/printable-business-cards/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  printable business cards
                </Link>
              </li>
              <li>
                <Link
                  href="/business-cards/business-card-maker/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  make business cards online
                </Link>
              </li>
              <li>
                <Link
                  href="/business-cards/visiting-card-maker/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  visiting card design template
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Labels and stickers footer links" className="space-y-2.5">
            <p className="text-xs font-bold tracking-tight text-zinc-950">
              Labels &amp; Stickers
            </p>
            <ul className="space-y-1.5 text-xs text-zinc-600">
              <li>
                <Link href="/labels-stickers/" className="inline-block py-1 hover:text-[#3f6212] transition">
                  label sticker sheet maker
                </Link>
              </li>
              <li>
                <Link
                  href="/labels-stickers/printable-label-maker/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  printable label maker
                </Link>
              </li>
              <li>
                <Link
                  href="/labels-stickers/round-label-maker/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  round labels for printer
                </Link>
              </li>
              <li>
                <Link
                  href="/labels-stickers/sticker-sheet-maker/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  sticker sheet maker online
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/a4-sticker-paper-sizes-and-types/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  sticker paper size a4
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Jar and bottle labels footer links" className="space-y-2.5">
            <p className="text-xs font-bold tracking-tight text-zinc-950">
              Jar &amp; Bottle Labels
            </p>
            <ul className="space-y-1.5 text-xs text-zinc-600">
              <li>
                <Link
                  href="/jar-bottle-labels/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  label designs for jars
                </Link>
              </li>
              <li>
                <Link
                  href="/jar-bottle-labels/jar-label-maker/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  jar label template
                </Link>
              </li>
              <li>
                <Link
                  href="/jar-bottle-labels/mason-jar-canning-label-maker/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  mason jar labels printable
                </Link>
              </li>
              <li>
                <Link
                  href="/jar-bottle-labels/candle-label-maker/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  candle label maker
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/bottle-label-printer-buying-guide/"
                  className="inline-block py-1 hover:text-[#3f6212] transition"
                >
                  bottle label printer
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 rounded-2xl bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-600">
          <p>
            Independent print layout utility. Not affiliated with Avery, Canva, Cricut, Epson, Adobe, Microsoft, Kodak, or any third-party brand mentioned in compatibility guides.
          </p>
          <p className="shrink-0 font-semibold text-zinc-800">
            Print Sheet Maker
          </p>
        </div>
      </div>
    </footer>
  );
}


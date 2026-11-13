import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ALL_PAGES } from "@/data/site-meta";

const VALID_PAGE_URLS = new Set<string>(ALL_PAGES.map((p) => p.url));

/**
 * Intercept invalid dynamic sub-routes before Cache Components PPR streaming begins
 * so unknown slugs return a true HTTP 404 status instead of a streamed 200 soft-404.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;

  if (!VALID_PAGE_URLS.has(normalized)) {
    return NextResponse.rewrite(new URL("/__not_found__", request.url), {
      status: 404,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/photo-sheets/:slug+",
    "/business-cards/:slug+",
    "/labels-stickers/:slug+",
    "/jar-bottle-labels/:slug+",
    "/guides/:slug+",
    "/how-to/:slug+",
    "/blog/:slug+",
    "/case-studies/:slug+",
  ],
};


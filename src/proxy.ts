import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Enforce trailing slashes with a clean HTTP 301 redirect and no Refresh header,
 * replacing Next.js's built-in 308 + Refresh: 0;url= response.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/" ||
    pathname.endsWith("/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/og") ||
    pathname.startsWith("/.netlify") ||
    pathname.startsWith("/.well-known") ||
    /\/[^/]+\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const normalizedPath = pathname.replace(/\/{2,}/g, "/");
  const destination = new URL(request.url);
  destination.pathname = normalizedPath.endsWith("/")
    ? normalizedPath
    : `${normalizedPath}/`;
  if (destination.hostname === "printsheet-template.com") {
    destination.protocol = "https:";
    destination.port = "";
  }

  return NextResponse.redirect(destination, 301);
}

export const config = {
  matcher: [
    "/((?!_next(?:/|$)|images(?:/|$)|og(?:/|$)|\\.netlify(?:/|$)|\\.well-known(?:/|$)|.*\\.[^/]+$).*[^/])",
  ],
};

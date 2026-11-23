"use client";

import React from "react";
import Link from "next/link";

export interface OpenStudioDetail {
  tab?: string;
  sample?: boolean;
}

export const OPEN_STUDIO_EVENT = "psm:open-studio";

export function openPrintStudio(detail: OpenStudioDetail = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<OpenStudioDetail>(OPEN_STUDIO_EVENT, { detail })
  );
}

export function hasAutoOpenHash(hash: string): boolean {
  const normalized = hash.trim().toLowerCase();
  return (
    normalized === "#open-studio" ||
    normalized === "#interactive-studio-workspace" ||
    normalized.startsWith("#card=") ||
    normalized.startsWith("#label=")
  );
}

interface StudioActionLinkProps {
  href: string;
  className?: string;
  ariaLabel?: string;
  tab?: string;
  sample?: boolean;
  children: React.ReactNode;
}

/**
 * Renders a primary/secondary CTA that opens the Normal Full-Page Studio
 * directly when targeting the current page's `#interactive-studio-workspace`,
 * or navigates via Next Link when pointing to another route.
 */
export function StudioActionLink({
  href,
  className,
  ariaLabel,
  tab,
  sample,
  children,
}: StudioActionLinkProps) {
  const isLocalWorkspace =
    href === "#interactive-studio-workspace" ||
    href.startsWith("#interactive-studio-workspace");

  if (isLocalWorkspace) {
    return (
      <button
        type="button"
        onClick={() => openPrintStudio({ tab, sample })}
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </button>
    );
  }

  return (
    <Link href={href} aria-label={ariaLabel} className={className}>
      {children}
    </Link>
  );
}

import type { HeadingNode } from "@/types/spec";

/**
 * Normalizes a heading string into a URL-safe HTML anchor fragment.
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Assigns unique DOM anchor IDs to every HeadingNode across a page render tree
 * so Table of Contents links, section anchors, and JSON-LD HowToStep URLs match
 * without duplicate HTML id collisions.
 */
export function assignHeadingIds(sections: HeadingNode[]): Map<HeadingNode, string> {
  const idMap = new Map<HeadingNode, string>();
  const usedCounts = new Map<string, number>();

  function visit(nodes: HeadingNode[]) {
    for (const node of nodes) {
      const baseSlug = slugifyHeading(node.text) || "section";
      const prevCount = usedCounts.get(baseSlug) || 0;
      const nextCount = prevCount + 1;
      usedCounts.set(baseSlug, nextCount);
      const uniqueId = nextCount === 1 ? baseSlug : `${baseSlug}-${nextCount}`;
      idMap.set(node, uniqueId);

      if (node.children && node.children.length > 0) {
        visit(node.children);
      }
    }
  }

  visit(sections);
  return idMap;
}

/**
 * Strips light markdown syntax such as inline code backticks for clean schema output.
 */
export function cleanSchemaText(text: string): string {
  return text.replace(/`([^`]+)`/g, "$1").replace(/\s+/g, " ").trim();
}


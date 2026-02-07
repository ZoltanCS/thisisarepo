"use client";

import SiteRenderer from "@/components/renderer/SiteRenderer";
import type { EditorNode } from "@/lib/schema/node";

interface Props {
  schema: { rootNodes: unknown[] };
}

export default function PublishedPageClient({ schema }: Props) {
  const nodes = (schema?.rootNodes || []) as EditorNode[];
  return (
    <main>
      <SiteRenderer nodes={nodes} />
    </main>
  );
}

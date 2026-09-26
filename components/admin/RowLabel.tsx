"use client";
/* Collapsed rows show their title or question instead of "Card 03". */
import { useRowLabel } from "@payloadcms/ui";

export function RowLabel() {
  const { data, rowNumber } = useRowLabel<{ title?: string; question?: string; name?: string; when?: string }>();
  return <span>{(data?.when && data?.title ? `${data.when}: ${data.title}` : "") || data?.title || data?.question || data?.name || `Item ${String((rowNumber ?? 0) + 1).padStart(2, "0")}`}</span>;
}

"use client";
/* Collapsed rows show their title or question instead of "Card 03". */
import { useRowLabel } from "@payloadcms/ui";

export function RowLabel() {
  const { data, rowNumber } = useRowLabel<{ title?: string; question?: string }>();
  return <span>{data?.title || data?.question || `Item ${String((rowNumber ?? 0) + 1).padStart(2, "0")}`}</span>;
}

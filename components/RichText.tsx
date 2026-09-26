/* Renders an article written in the CMS editor as plain semantic HTML, so the
   site's .prose styles apply exactly as they did to the WordPress posts. */
import {
  RichText as PayloadRichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import type { Media } from "@/payload-types";

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const m = node.value as Media;
    if (typeof m !== "object" || !m?.url) return null;
    const src = m.sizes?.large?.url ?? m.url;
    return (
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          srcSet={m.sizes?.card?.url ? `${m.sizes.card.url} 800w, ${src} ${m.sizes?.large?.width ?? m.width}w` : undefined}
          sizes="(max-width: 760px) 100vw, 720px"
          alt={m.alt}
          width={m.width ?? undefined}
          height={m.height ?? undefined}
          loading="lazy"
          decoding="async"
        />
      </figure>
    );
  },
});

export function RichText({ data, className }: { data: SerializedEditorState; className?: string }) {
  return <PayloadRichText data={data} converters={converters} className={className} disableContainer={!className} />;
}

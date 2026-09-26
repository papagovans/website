/* Renders an article written in the CMS editor as plain semantic HTML, so the
   site's .prose styles apply exactly as they did to the WordPress posts. */
import {
  RichText as PayloadRichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import type { Media } from "@/payload-types";
import { Photo } from "./Photo";

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => (
    <figure>
      <Photo m={node.value as Media} sizes="(max-width: 760px) 100vw, 720px" />
    </figure>
  ),
});

/* Inline: paragraphs run together with no <p>, for copy that sits inside
   something that is already a paragraph or a list item. */
const inlineConverters: JSXConvertersFunction = (args) => ({
  ...converters(args),
  paragraph: ({ node, nodesToJSX }) => <>{nodesToJSX({ nodes: node.children })}</>,
});

export function RichText({
  data,
  className,
  inline = false,
}: {
  data: SerializedEditorState | null | undefined;
  className?: string;
  inline?: boolean;
}) {
  if (!data) return null;
  return (
    <PayloadRichText
      data={data}
      converters={inline ? inlineConverters : converters}
      className={className}
      disableContainer={!className}
    />
  );
}

/* Small pieces the page sections share. */
import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import type { Field } from "payload";

import { DESTINATIONS } from "../lib/site";

/* For short copy inside a section: bold, italic and links, nothing that could
   turn a card or a note into a page of its own. */
export const shortText = lexicalEditor({
  features: () => [ParagraphFeature(), BoldFeature(), ItalicFeature(), LinkFeature({ enabledCollections: [] })],
});

/* Short copy that may also need a list, like an FAQ answer. */
export const answerText = lexicalEditor({
  features: () => [
    ParagraphFeature(), BoldFeature(), ItalicFeature(), LinkFeature({ enabledCollections: [] }),
    UnorderedListFeature(), OrderedListFeature(),
  ],
});

export const sectionHeading: Field = {
  name: "heading",
  type: "text",
  admin: { description: "Optional. A heading shown above this section." },
};

/* A link staff choose by name. "Somewhere else" reveals a box for any address. */
export const destination = (name: string, label: string, required = false): Field => ({
  name,
  label,
  type: "group",
  fields: [
    {
      name: "to",
      label: "Goes to",
      type: "select",
      required,
      options: [
        ...Object.entries(DESTINATIONS).map(([value, d]) => ({ value, label: d.label })),
        { value: "custom", label: "Somewhere else (type an address)" },
      ],
    },
    {
      name: "url",
      label: "Address",
      type: "text",
      admin: {
        condition: (_, sibling) => sibling?.to === "custom",
        description: "A page on this site like /financing/, or a full address like https://...",
      },
    },
    {
      name: "text",
      label: "Wording",
      type: "text",
      admin: {
        condition: (_, sibling) => Boolean(sibling?.to),
        description: "Optional. Blank uses the phone number, email or a standard label.",
      },
    },
  ],
});

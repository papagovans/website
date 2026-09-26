/**
 * The sections a page is built from. Staff add them, drag them into order and
 * remove them; how each one looks is fixed in code, so a page can never drift
 * from the rest of the site. Add a new kind of section here, then teach
 * components/PageSections.tsx to draw it.
 */
import type { Block } from "payload";

import { answerText, destination, sectionHeading, shortText } from "./fields";

const Text: Block = {
  slug: "text",
  labels: { singular: "Text", plural: "Text" },
  fields: [
    sectionHeading,
    { name: "content", type: "richText", required: true },
  ],
};

const Cards: Block = {
  slug: "cards",
  labels: { singular: "Cards", plural: "Cards" },
  fields: [
    sectionHeading,
    {
      name: "items",
      label: "Cards",
      type: "array",
      minRows: 1,
      labels: { singular: "Card", plural: "Cards" },
      admin: { initCollapsed: true, components: { RowLabel: "/components/admin/RowLabel#RowLabel" } },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "text", type: "textarea", required: true },
        destination("highlight", "Highlighted line (optional)"),
      ],
    },
  ],
};

const Steps: Block = {
  slug: "steps",
  labels: { singular: "Numbered Steps", plural: "Numbered Steps" },
  fields: [
    sectionHeading,
    {
      name: "items",
      label: "Steps",
      type: "array",
      minRows: 1,
      labels: { singular: "Step", plural: "Steps" },
      admin: { initCollapsed: true, components: { RowLabel: "/components/admin/RowLabel#RowLabel" } },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "text", type: "textarea", required: true },
      ],
    },
  ],
};

const Faq: Block = {
  slug: "faq",
  labels: { singular: "Questions & Answers", plural: "Questions & Answers" },
  fields: [
    sectionHeading,
    {
      name: "items",
      label: "Questions",
      type: "array",
      minRows: 1,
      labels: { singular: "Question", plural: "Questions" },
      admin: {
        initCollapsed: true,
        components: { RowLabel: "/components/admin/RowLabel#RowLabel" },
        description: "Each question opens to show its answer. Google can show these in search results.",
      },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "richText", editor: answerText, required: true },
      ],
    },
  ],
};

const Checklist: Block = {
  slug: "checklist",
  labels: { singular: "Checklist", plural: "Checklists" },
  fields: [
    sectionHeading,
    {
      name: "items",
      type: "array",
      minRows: 1,
      labels: { singular: "Item", plural: "Items" },
      fields: [{ name: "text", type: "richText", editor: shortText, required: true }],
    },
  ],
};

const Note: Block = {
  slug: "note",
  labels: { singular: "Highlighted Note", plural: "Highlighted Notes" },
  fields: [
    {
      name: "content",
      type: "richText",
      editor: shortText,
      required: true,
      admin: { description: "A shaded box. Start with a bold sentence, then explain." },
    },
  ],
};

const Cta: Block = {
  slug: "cta",
  labels: { singular: "Call to Action", plural: "Calls to Action" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "text", type: "textarea", admin: { description: "One short line under the heading." } },
    destination("button", "Button", true),
    {
      name: "smallPrint",
      label: "Line under the button",
      type: "richText",
      editor: shortText,
      admin: { description: 'Optional. Usually a second way in, like "Or call (480) 761-7175."' },
    },
  ],
};

const ImageText: Block = {
  slug: "imageText",
  labels: { singular: "Image and Text", plural: "Image and Text" },
  fields: [
    { name: "image", type: "upload", relationTo: "media", required: true },
    {
      name: "imageSide",
      label: "Image on the",
      type: "radio",
      defaultValue: "left",
      options: [
        { value: "left", label: "Left" },
        { value: "right", label: "Right" },
      ],
      admin: { layout: "horizontal" },
    },
    { name: "eyebrow", label: "Small label above the heading", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "subheading", type: "text" },
    { name: "content", type: "richText", editor: shortText },
  ],
};

export const blocks = [Text, ImageText, Cards, Steps, Faq, Checklist, Note, Cta];

/**
 * The sections a page is built from. Staff add them, drag them into order and
 * remove them; how each one looks is fixed in code, so a page can never drift
 * from the rest of the site. Add a new kind of section here, then teach
 * components/PageSections.tsx to draw it.
 *
 * Two kinds, and the renderer treats them differently. Content sections (Text,
 * Cards, Steps...) sit in the page's reading column. Full-width sections
 * (Hero, Image and Text, Photo Wall...) run edge to edge with their own
 * background, like the home page.
 */
import type { Block, Field } from "payload";

import { answerText, destination, sectionHeading, shortText } from "./fields";

const TOKENS =
  "Type {builds} for the number of finished builds or {team} for the number of people on the team; they update themselves.";

const rowLabel = { components: { RowLabel: "/components/admin/RowLabel#RowLabel" } };
const lede: Field = { name: "intro", label: "Introduction", type: "textarea", admin: { description: `Optional. ${TOKENS}` } };

/* ---- Content sections -------------------------------------------------- */

const Text: Block = {
  slug: "text",
  labels: { singular: "Text", plural: "Text" },
  fields: [sectionHeading, { name: "content", type: "richText", required: true }],
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
      admin: { initCollapsed: true, ...rowLabel },
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
      admin: { initCollapsed: true, ...rowLabel },
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
        ...rowLabel,
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

const PriceBox: Block = {
  slug: "priceBox",
  labels: { singular: "Price Box", plural: "Price Boxes" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "price", type: "text", required: true, admin: { description: 'As it should read, e.g. "$200,000 - $300,000".' } },
    { name: "note", type: "textarea", admin: { description: "Optional. What the price includes." } },
    {
      name: "items",
      label: "What moves the price",
      type: "array",
      labels: { singular: "Line", plural: "Lines" },
      admin: { initCollapsed: true, ...rowLabel },
      fields: [
        { name: "title", label: "Label", type: "text", required: true },
        { name: "text", type: "text", required: true },
      ],
    },
  ],
};

const Team: Block = {
  slug: "team",
  labels: { singular: "Team", plural: "Team" },
  admin: { disableBlockName: true },
  fields: [
    sectionHeading,
    lede,
    {
      type: "ui",
      name: "teamHelp",
      admin: { components: { Field: "/components/admin/Help#TeamHelp" } },
    },
  ],
};

const Timeline: Block = {
  slug: "timeline",
  labels: { singular: "Timeline", plural: "Timelines" },
  fields: [
    sectionHeading,
    {
      name: "items",
      label: "Milestones",
      type: "array",
      minRows: 1,
      labels: { singular: "Milestone", plural: "Milestones" },
      admin: { initCollapsed: true, ...rowLabel },
      fields: [
        { name: "when", type: "text", required: true, admin: { description: 'e.g. "March 2020" or just "2024".' } },
        { name: "title", type: "text", required: true },
        { name: "text", type: "textarea", required: true },
        {
          name: "provisional",
          label: "This date is a guess",
          type: "checkbox",
          admin: { description: "Tick until the date is confirmed. The pre-launch check lists every ticked milestone." },
        },
      ],
    },
  ],
};

const Cta: Block = {
  slug: "cta",
  labels: { singular: "Call to Action", plural: "Calls to Action" },
  fields: [
    {
      name: "style",
      type: "radio",
      defaultValue: "box",
      options: [
        { value: "box", label: "Shaded box in the page" },
        { value: "band", label: "Full-width band (for the end of a page)" },
      ],
      admin: { layout: "horizontal" },
    },
    { name: "eyebrow", label: "Small label above the heading", type: "text", admin: { condition: (_, s) => s?.style === "band" } },
    { name: "heading", type: "text", admin: { description: "Optional, but most calls to action read better with one." } },
    { name: "text", type: "textarea", admin: { description: "One or two short lines under the heading." } },
    destination("button", "Button", true),
    destination("secondButton", "Second button (optional, outlined)"),
    {
      name: "smallPrint",
      label: "Line under the button",
      type: "richText",
      editor: shortText,
      admin: { description: 'Optional. Usually a second way in, like "Or call (480) 761-7175."' },
    },
    {
      name: "people",
      label: "Pop-up photos",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      maxRows: 3,
      admin: {
        condition: (_, s) => s?.style === "band",
        description: "Optional. Up to three cut-outs with transparent backgrounds (PNG). One shows per visit, the next one each time the visitor comes back, rising out of the bottom-right corner as the box scrolls into view. The text moves to the left.",
      },
    },
  ],
};

const ContactFormBlock: Block = {
  slug: "contactForm",
  labels: { singular: "Contact Form", plural: "Contact Forms" },
  fields: [
    sectionHeading,
    { name: "intro", label: "Introduction", type: "textarea", admin: { description: "Optional. One line above the form." } },
    {
      name: "preset",
      label: "Which form",
      type: "select",
      options: [
        { value: "conversion", label: "Sales: HubSpot \"2026 New Contact Form - All Purpose\"" },
        { value: "service", label: "Service request" },
      ],
      admin: { description: "Blank means the sales form, edited in HubSpot. The service request asks what the van needs." },
    },
  ],
};

/* ---- Full-width sections ----------------------------------------------- */

const Hero: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Heroes" },
  admin: { disableBlockName: true },
  fields: [
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "Fills the whole screen behind the words. Use a wide photo at least 1920 pixels across, with calm space where the text sits." },
    },
    {
      name: "heading",
      type: "textarea",
      required: true,
      admin: { description: "The first thing anyone reads. Press Enter to break it onto a second line." },
    },
    { name: "text", type: "textarea" },
    destination("button", "Button", true),
    destination("secondButton", "Second button (optional, outlined)"),
  ],
};

const PathCards: Block = {
  slug: "pathCards",
  labels: { singular: "Pricing Cards", plural: "Pricing Cards" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "intro", label: "Introduction", type: "textarea" },
    {
      name: "anchor",
      label: "Jump link name",
      type: "text",
      admin: { description: 'Optional. Lets a button elsewhere scroll here: a name of "two-ways" is reached with #two-ways.' },
    },
    {
      name: "items",
      label: "Cards",
      type: "array",
      minRows: 1,
      maxRows: 3,
      labels: { singular: "Card", plural: "Cards" },
      admin: { initCollapsed: true, ...rowLabel },
      fields: [
        {
          name: "image",
          label: "Picture",
          type: "upload",
          relationTo: "media",
          admin: { description: "Optional. Shown across the top of the card, cropped to a wide 2:1 shape." },
        },
        {
          name: "video",
          label: "Video (optional)",
          type: "upload",
          relationTo: "media",
          admin: {
            description: "Plays silently on a loop in place of the picture, which still shows while it loads. MP4, under 1 MB.",
          },
        },
        { name: "title", type: "text", required: true, admin: { description: 'The option\'s name, e.g. "Tailored".' } },
        { name: "kicker", label: "Line above the name", type: "text" },
        { name: "text", type: "textarea", required: true },
        { name: "priceLabel", label: "Price label", type: "text", defaultValue: "Pricing range (includes van)" },
        { name: "price", type: "text", required: true },
        destination("button", "Button", true),
        {
          name: "featured",
          label: "Highlight this card",
          type: "checkbox",
          admin: { description: "Gold border and a gold button. Use on one card at most." },
        },
        { name: "flag", label: "Badge on a highlighted card", type: "text", admin: { condition: (_, s) => Boolean(s?.featured), description: 'e.g. "Most Popular".' } },
      ],
    },
  ],
};

/* The old site's Build Tiers page, laid out for a buyer comparing: a price
   ladder to scan first, then one card per tier with its price, who it suits
   and its headline numbers. Both run cheapest first. */
const BuildTiers: Block = {
  slug: "buildTiers",
  labels: { singular: "Build Tiers", plural: "Build Tiers" },
  fields: [
    { name: "heading", type: "text", required: true, defaultValue: "Build Tiers" },
    { name: "intro", label: "Introduction", type: "textarea", admin: { description: "A blank line starts a new paragraph." } },
    {
      name: "chassisLine",
      label: "Vans we build on",
      type: "text",
      defaultValue: "We build on all three: Mercedes-Benz Sprinter, Ford Transit and Ram ProMaster.",
    },
    {
      name: "vanAllowance",
      label: "Van allowance",
      type: "number",
      min: 0,
      defaultValue: 75000,
      admin: { description: "Added to every tier's price, so the numbers include the van. Dollars, no commas." },
    },
    {
      name: "priceNote",
      label: "Price note",
      type: "textarea",
      defaultValue:
        "Prices include a $75,000 Mercedes-Benz Sprinter allowance as a convenience. A Ford Transit averages $57,000 and a Ram ProMaster $56,000. To keep your costs down, you buy the van direct through one of our dealers.",
    },
    { name: "cardsHeading", label: "Heading over the tier cards", type: "text", defaultValue: "What each tier gets you" },
    {
      name: "tiers",
      type: "array",
      minRows: 1,
      labels: { singular: "Tier", plural: "Tiers" },
      admin: { initCollapsed: true, ...rowLabel, description: "Shown cheapest first, whatever the order here." },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "tagline", type: "text", admin: { description: 'e.g. "The Luxury Explorer".' } },
        { name: "price", label: "Build price", type: "number", required: true, min: 0, admin: { description: "The conversion alone, in dollars, no commas. The van allowance is added on the page." } },
        { name: "summary", label: "Who it suits", type: "textarea", admin: { description: "Two sentences at most." } },
        {
          name: "specs",
          label: "Headline numbers",
          type: "array",
          maxRows: 4,
          labels: { singular: "Number", plural: "Numbers" },
          fields: [
            { type: "row", fields: [
              { name: "value", type: "text", required: true, admin: { description: 'e.g. "400Ah"' } },
              { name: "label", type: "text", required: true, admin: { description: 'e.g. "Lithium battery"' } },
            ] },
          ],
        },
        { name: "link", type: "text", admin: { description: "The floor plan page, e.g. /zion/. Leave empty and the button books a call instead." } },
        { name: "photo", type: "upload", relationTo: "media", required: true },
        {
          name: "art",
          label: "Van drawing",
          type: "select",
          required: true,
          options: [
            { label: "Rainier (bare van)", value: "rainier" },
            { label: "McKinley (roof rack)", value: "mckinley" },
            { label: "Zion (rack and gear)", value: "zion" },
            { label: "Olympus (pop-top tent)", value: "olympus" },
            { label: "El Capitan (roof tent, fully kitted)", value: "el-capitan" },
          ],
        },
      ],
    },
  ],
};

const PhotoShowcase: Block = {
  slug: "photoShowcase",
  labels: { singular: "Photo Showcase", plural: "Photo Showcases" },
  fields: [
    { name: "eyebrow", label: "Small label above the heading", type: "text", admin: { description: 'Optional, e.g. "What we do".' } },
    {
      name: "heading",
      type: "textarea",
      required: true,
      admin: { description: "One plain sentence about what we do." },
    },
    {
      name: "revealFront",
      label: "Cut-out in front (reveal slider)",
      type: "upload",
      relationTo: "media",
      admin: {
        condition: (_, s) => s?.imageStyle === "reveal",
        description: "A transparent PNG exactly the size of the big photo, with the van where it sits in that photo, so the two line up. home-what-we-do-van-aligned is the current one.",
      },
    },
    {
      name: "revealGround",
      label: "Ground under the cut-out (reveal slider)",
      type: "upload",
      relationTo: "media",
      admin: {
        condition: (_, s) => s?.imageStyle === "reveal",
        description: "Optional. A transparent PNG the size of the big photo holding only a strip of ground, so the tyres rest on something before the forest comes in. It shows only where the forest has not been revealed. home-what-we-do-ground is the current one.",
      },
    },
    {
      name: "headingPlacement",
      label: "Heading goes",
      type: "radio",
      defaultValue: "above",
      options: [
        { value: "above", label: "Above the photo, on its own" },
        { value: "over", label: "Over the top left of the photo" },
      ],
      admin: {
        layout: "horizontal",
        description: "Above is calmer; over works when the photo has a plain area on the left. Ignored for a cut-out, where the words always sit beside it.",
        condition: (_, s) => s?.imageStyle !== "cutout" && s?.imageStyle !== "reveal",
      },
    },
    {
      name: "proof",
      label: "Short facts under the heading",
      type: "array",
      maxRows: 5,
      labels: { singular: "Fact", plural: "Facts" },
      admin: { description: 'Optional. A few words each, e.g. "RVIA certified". Shown in one line, separated by dots.' },
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "imageStyle",
      label: "Photo style",
      type: "radio",
      defaultValue: "photo",
      options: [
        { value: "photo", label: "Full photo with rounded corners" },
        { value: "cutout", label: "Cut-out (no background): the words sit beside it" },
        { value: "reveal", label: "Reveal slider: drag to bring the background in behind the cut-out" },
      ],
      admin: { description: "Cut-out needs a PNG with a transparent background. Reveal needs both: the full photo as the big photo, and the cut-out below." },
    },
    {
      name: "image",
      label: "Big photo",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "Full photo: a wide one, at least 1920 pixels across. Cut-out: the van alone on a transparent background. The forest photo is home-what-we-do-1 in the Media Library." },
    },
    {
      name: "photos",
      label: "Photos underneath",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      maxRows: 6,
      admin: { description: "Up to six, shown in one row under the big photo. Drag to reorder." },
    },
  ],
};

const VanTour: Block = {
  slug: "vanTour",
  labels: { singular: "3D Van Tour", plural: "3D Van Tours" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "intro", label: "Introduction", type: "textarea" },
    destination("button", "Button under the van (optional)"),
    { type: "ui", name: "vanHelp", admin: { components: { Field: "/components/admin/Help#VanHelp" } } },
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
    { name: "caption", type: "text", admin: { description: "Optional. A short line under the photo." } },
    { name: "eyebrow", label: "Small label above the heading", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "subheading", type: "text" },
    { name: "content", type: "richText", editor: shortText },
    destination("button", "Button (optional, outlined)"),
  ],
};

const PhotoWall: Block = {
  slug: "photoWall",
  labels: { singular: "Photo Wall", plural: "Photo Walls" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "text", type: "textarea", admin: { description: TOKENS } },
    destination("button", "Button"),
    {
      name: "featured",
      label: "Large photos",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      maxRows: 3,
      admin: { description: "Up to three photos shown large. The rest of the wall fills itself from the Build Gallery." },
    },
    {
      name: "mixIn",
      label: "Photos mixed into the wall",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      maxRows: 6,
      admin: { description: "Optional. Small photos placed among the build photos, near the top where they are seen. Use them to break up a run of van exteriors. They do not link anywhere." },
    },
  ],
};

const Testimonials: Block = {
  slug: "testimonials",
  labels: { singular: "Testimonials", plural: "Testimonials" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "intro", label: "Introduction", type: "textarea" },
    {
      name: "items",
      label: "Reviews",
      type: "array",
      minRows: 1,
      labels: { singular: "Review", plural: "Reviews" },
      admin: {
        initCollapsed: true,
        components: { RowLabel: "/components/admin/RowLabel#RowLabel" },
        description: "Scroll slowly across the page. Use the customer's words exactly as they wrote them.",
      },
      fields: [
        { name: "quote", type: "textarea", required: true },
        { name: "name", label: "Customer name", type: "text", required: true, admin: { description: 'As they agreed to be named, e.g. "Debi L."' } },
      ],
    },
  ],
};

const BuildGallery: Block = {
  slug: "buildGallery",
  labels: { singular: "Build Gallery", plural: "Build Galleries" },
  admin: { disableBlockName: true },
  fields: [{ type: "ui", name: "galleryHelp", admin: { components: { Field: "/components/admin/Help#GalleryHelp" } } }],
};

/* The renderer groups consecutive content sections into one reading column. */
export const WIDE = new Set(["hero", "photoShowcase", "pathCards", "vanTour", "imageText", "photoWall", "testimonials", "buildGallery", "buildTiers"]);

export const blocks = [
  Text, Cards, Steps, Faq, Checklist, Note, PriceBox, Team, Timeline, Cta, ContactFormBlock,
  Hero, PhotoShowcase, PathCards, VanTour, ImageText, PhotoWall, Testimonials, BuildGallery, BuildTiers,
];

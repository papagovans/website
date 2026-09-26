/**
 * The writing tools, trimmed to what a blog post needs.
 *
 * Payload's default editor carries around twenty tools (subscript, inline
 * code, text alignment, indent...). Each one is a button someone has to
 * understand and a way to make a post look unlike the rest of the site.
 * These are the ones the site's styles actually cover. A toolbar sits fixed
 * above the text, like Word or WordPress, rather than only appearing when
 * text is selected, so nobody has to discover it.
 */
import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

export const editor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    // H1 is the post title. One per page, set by the template.
    HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    // Web addresses only. Linking to another post is pasting its address.
    LinkFeature({ enabledCollections: [] }),
    UnorderedListFeature(),
    OrderedListFeature(),
    BlockquoteFeature(),
    UploadFeature(),
    HorizontalRuleFeature(),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
});

/**
 * The "Our Guarantee" page, owner 2026-10-20, from the vault draft
 * papago-our-guarantee-page-copy_10-20-2026.pdf, word for word. Live for
 * review at /guarantee/ but ticked "Hide from Google" and not in the nav
 * until the attorney signs off. Owner 2026-10-20: the date promise is a
 * completion date ($100 a week late, up to $1,000), and every [bracketed]
 * placeholder was taken out.
 *
 *   npx tsx scripts/create-guarantee-page.ts
 *
 * Safe to re-run: it matches on slug. Already run; edit in /admin from here on.
 */
import { createRequire } from "module";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");
const { revalidateLive } = await import("../lib/revalidate-live.ts");

/* Lexical, minimal: "**bold** rest" in a string makes the first part bold. */
type Span = string | { link: string; text: string };
const t = (text: string, bold = false) => ({ mode: "normal", text, type: "text", style: "", detail: 0, format: bold ? 1 : 0, version: 1 });
const block = { format: "", indent: 0, version: 1, direction: null };
const spans = (parts: Span[]) =>
  parts.flatMap((p) => {
    if (typeof p !== "string") return [{ type: "link", fields: { url: p.link, newTab: false, linkType: "custom" }, format: "", indent: 0, version: 3, direction: "ltr", children: [t(p.text)] }];
    const m = p.match(/^\*\*(.+?)\*\*(.*)$/s);
    return m ? [t(m[1], true), ...(m[2] ? [t(m[2])] : [])] : [t(p)];
  });
const P = (...parts: Span[]) => ({ type: "paragraph", ...block, textFormat: 0, textStyle: "", children: spans(parts) });
const H3 = (text: string) => ({ tag: "h3", type: "heading", ...block, children: [t(text)] });
const UL = (...items: (Span | Span[])[]) => ({
  tag: "ul", type: "list", listType: "bullet", start: 1, ...block,
  children: items.map((it, i) => ({ type: "listitem", value: i + 1, ...block, children: spans(Array.isArray(it) ? it : [it]) })),
});
const doc = (...children: unknown[]) => ({ root: { type: "root", ...block, children } });

const QUIZ = "/which-build-fits-you/";

const sections = [
  {
    blockType: "note",
    content: doc(P("**Draft for review.** This page is live only so the owners and our attorney can review it. It is hidden from Google and not linked anywhere on the site.")),
  },
  { blockType: "cta", style: "box", button: { to: "custom", url: QUIZ, text: "See if a Papago fits" } },
  {
    blockType: "text",
    heading: "The four promises",
    content: doc(
      H3("1. The Completion Date Guarantee"),
      P("When you sign, you get a completion date: the day your van will be finished and ready for you. A real date, not a range."),
      P("If we miss it, we pay you $100 for every week we go past it, up to $1,000."),
      P("The clock stops the day your van is finished and ready for pickup. If you collect it later than that, those weeks are yours, not ours."),
      P("We'd rather pay for our own mistakes than make you pay for them with your time."),
      H3("2. You pay as the work gets done"),
      P("You pay in stages as the work gets done:"),
      UL("A deposit to reserve your build slot", "When your van arrives and production starts", "At a mid-build checkpoint", "The balance at delivery, after your walkthrough"),
      P("You never pay far ahead of the work."),
      H3("3. Your price is locked"),
      P("The build price on your signed contract is the price you pay at delivery. No surprise surcharges for materials, labor, or \"market conditions.\""),
      P("What can change the price: changes you ask for, and any increase in the van's price from Mercedes, Ford, or Ram before your van is ordered. If either happens, you'll see it in writing and approve it before we do anything."),
      H3("4. You'll see it every week"),
      P("Once your van is in production, you get photos and a short update every week. What got done, what's next, and whether you're still on schedule."),
      P("If something's running behind, you hear it from us first, not when you call to ask."),
    ),
  },
  {
    blockType: "text",
    heading: "Why we put it in writing",
    content: doc(
      P("Most custom shops quote a long wait and hope it holds. We used to work that way too."),
      P("We rebuilt how our shop works, and that's what lets us commit to a date."),
    ),
  },
  {
    blockType: "text",
    heading: "Built right, too",
    content: doc(
      P("The guarantee covers when your van is finished and how you pay. The build itself is covered too:"),
      UL(
        "**RVIA certified.** Electrical, propane, plumbing, and fire safety are built and inspected to RV industry standards.",
        "**Authorized Mercedes, Ford, and Ram dealer.** Your van's factory warranty stays with the manufacturer, and service works like any other new van.",
        "**A shop you can visit.** 751 N Country Club Dr, Mesa, Arizona. Come see a build in progress before you put a dollar down.",
      ),
    ),
  },
  {
    blockType: "text",
    heading: "What the guarantee doesn't cover",
    content: doc(
      P("Straight answers here too."),
      UL(
        "**Delays you choose.** If you change your design after it's locked, your completion date can move. We'll give you the new date in writing before you decide.",
        "**Weeks after your van is ready.** The guarantee runs to the day your van is finished, not the day you pick it up.",
        "**Factory delays on a van you supply yourself.** If you bring your own van and it arrives late, the clock starts when it gets here.",
        "**Things outside our control.** Fire, flood, and parts a manufacturer can't supply, like a special fridge you asked for that's out of stock at the maker. We'll give you the new date in writing as soon as we know.",
        ["**Financing.** We don't control lender decisions or terms. ", { link: "/financing/", text: "See how Papago owners pay." }],
      ),
    ),
  },
  {
    blockType: "faq",
    heading: "Questions",
    items: [
      ["Is this in my contract, or just on the website?", "It's in your contract. This page is a plain-English summary of it."],
      ["What happens if you're late?", "We pay you $100 for every week past your completion date, up to $1,000. You keep your build and your price."],
      ["What if my van is finished but I can't pick it up right away?", "That's fine, and it doesn't count against the guarantee. The clock stops the day your van is finished and ready for pickup."],
      ["Why don't other builders do this?", "We can't speak for them. We can tell you we changed how our shop runs before we made this promise."],
      ["How do I know you'll still be around?", "Fair question. You pay in stages as the work gets done, so you're never far ahead of the work."],
    ].map(([question, answer]) => ({ question, answer: doc(P(answer)) })),
  },
  {
    blockType: "cta",
    style: "band",
    heading: "Know your date before you sign.",
    text: "Eight quick questions, about two minutes. If it's a fit, you'll pick a time with our Senior Build Consultant and get a real completion date on the first call.",
    button: { to: "custom", url: QUIZ, text: "See if a Papago fits" },
    smallPrint: doc(P("Or call ", { link: "tel:+14807617175", text: "(480) 761-7175" }, ".")),
  },
  {
    blockType: "text",
    content: doc(P("This page summarizes the Papago Vans build guarantee. The terms in your signed purchase agreement govern.")),
  },
];

const data = {
  title: "Our Guarantee",
  slug: "guarantee",
  eyebrow: "Our Guarantee",
  heading: "Your completion date. In writing.",
  intro: "Custom van builders have a reputation for missed dates and disappearing deposits. You've probably read the stories. Here's what we put in your contract so you don't have to wonder.",
  seoTitle: "Our Guarantee | Completion Date and Price Protection | Papago Vans",
  seoDescription: "What Papago puts in writing on every build: your completion date, $100 a week if we miss it, a locked price, staged payments and weekly build updates.",
  hideFromSearch: true,
  _status: "published" as const,
  sections,
};

const payload = await getPayload({ config });
const existing = (await payload.find({ collection: "pages", where: { slug: { equals: "guarantee" } }, limit: 1, depth: 0 })).docs[0];
if (existing) await payload.update({ collection: "pages", id: existing.id, data: data as never });
else await payload.create({ collection: "pages", data: data as never });
console.log(`${existing ? "updated" : "created"} /guarantee/ with ${sections.length} sections`);
await revalidateLive(["/guarantee/", "/sitemap.xml"]);
process.exit(0);

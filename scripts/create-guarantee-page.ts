/**
 * The "Our Guarantee" page, owner 2026-10-20, from the vault draft
 * papago-our-guarantee-page-copy_10-20-2026.pdf, word for word. Live for
 * review at /guarantee/ but ticked "Hide from Google" and not in the nav:
 * the copy is a DRAFT whose [bracketed] numbers and terms wait on the owner,
 * operations and an attorney. Brackets render as yellow placeholders.
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
    content: doc(P("**Draft for review.** This page is live only so the owners, operations and our attorney can review it. It is hidden from Google and not linked anywhere on the site. Everything highlighted in [yellow brackets] is a placeholder that still needs a real number or term.")),
  },
  { blockType: "cta", style: "box", button: { to: "custom", url: QUIZ, text: "See if a Papago fits" } },
  {
    blockType: "text",
    heading: "The four promises",
    content: doc(
      H3("1. The Start Date Guarantee"),
      P("When you sign, you get a production start date. A real date, not a range."),
      P("If we miss it, two things happen:"),
      UL("We credit your build [$500] for every week we're late.", "Your deposit becomes fully refundable, if you'd rather walk away. Your call, not ours."),
      P("We'd rather pay for our own mistakes than make you pay for them with your time."),
      H3("2. Your deposit is protected"),
      P("After that, you pay in stages as the work gets done:"),
      UL(
        "**Deposit to reserve your build slot:** [$X or X%]",
        "**Your van arrives and production starts:** [X%]",
        "**Mid-build checkpoint:** [X%]",
        "**Delivery, after your walkthrough:** [Balance]",
      ),
      P("You never pay far ahead of the work."),
      H3("3. Your price is locked"),
      P("The build price on your signed contract is the price you pay at delivery. No surprise surcharges for materials, labor, or \"market conditions.\""),
      P("What can change the price: changes you ask for, and [any increase in the van's price from Mercedes, Ford, or Ram before your van is ordered]. If either happens, you'll see it in writing and approve it before we do anything."),
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
      P("We rebuilt how our shop works. Vans now move through production in about [4] weeks instead of three months, and that's what lets us commit to a date."),
      P("Here's our track record on the last [10] builds:"),
      UL(
        "**Builds that started on their contract date:** [X of 10]",
        "**Average days from production start to delivery:** [X]",
        "**Next open build slot:** [date]",
      ),
      P("Updated every Monday. See the full build queue [link to /queue, once it exists]"),
    ),
  },
  {
    blockType: "text",
    heading: "Built right, too",
    content: doc(
      P("The guarantee covers when and how you pay. The build itself is covered too:"),
      UL(
        "**RVIA certified.** Electrical, propane, plumbing, and fire safety are built and inspected to RV industry standards.",
        "**[X-year] workmanship warranty** on everything we build. [Confirm the actual warranty terms, or delete this line.]",
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
        "**Delays you choose.** If you change your design after it's locked, your start date can move. We'll give you the new date in writing before you decide.",
        "**Factory delays on a van you supply yourself.** If you bring your own van and it arrives late, the clock starts when it gets here.",
        "**Things nobody controls.** Fire, flood, and the like. [Attorney to define.]",
        ["**Financing.** We don't control lender decisions or terms. ", { link: "/financing/", text: "See how Papago owners pay." }],
      ),
    ),
  },
  {
    blockType: "faq",
    heading: "Questions",
    items: [
      ["Is this in my contract, or just on the website?", "It's in your contract. This page is a plain-English summary of it."],
      ["What happens if you're late and I want to stay in line?", "You keep your build slot and get the weekly credit until production starts."],
      ["What happens if I want to cancel before production?", "Your deposit is refundable on request if we miss your start date. If we're on schedule and you cancel for your own reasons, [state the actual policy]."],
      ["Why don't other builders do this?", "We can't speak for them. We can tell you we changed how our shop runs before we made this promise."],
      ["How do I know you'll still be around?", "Fair question. Your deposit sits in [a separate account] until production starts, and you pay in stages after that. You're never far ahead of the work."],
    ].map(([question, answer]) => ({ question, answer: doc(P(answer)) })),
  },
  {
    blockType: "cta",
    style: "band",
    heading: "Know your date before you sign.",
    text: "Four questions, about two minutes. If it's a fit, you'll pick a time with our Senior Build Consultant and get a real start date on the first call.",
    button: { to: "custom", url: QUIZ, text: "See if a Papago fits" },
    smallPrint: doc(P("Or call ", { link: "tel:+14807617175", text: "(480) 761-7175" }, ".")),
  },
  {
    blockType: "text",
    content: doc(P("This page summarizes the Papago Vans build guarantee. The terms in your signed purchase agreement govern. [Attorney to finalize.]")),
  },
  {
    blockType: "note",
    content: doc(
      P("**Open items before this goes live.** Who decides each one:"),
      UL(
        "Weekly late credit amount ([$500] is a placeholder): Owner / ops",
        "Escrow vs. separate deposit account, and whether it's set up: Owner / accountant",
        "Payment schedule percentages: Owner / ops",
        "Whether OEM van price increases are passed through: Owner",
        "Workmanship warranty terms, if one exists: Owner",
        "Cancellation policy when Papago is on schedule: Owner / attorney",
        "Track record numbers for the last 10 builds: Ops, after 60 to 90 days of flow production",
        "Contract language matching every promise: Attorney",
      ),
    ),
  },
];

const data = {
  title: "Our Guarantee",
  slug: "guarantee",
  eyebrow: "Our Guarantee",
  heading: "Your start date. In writing.",
  intro: "Custom van builders have a reputation for missed dates and disappearing deposits. You've probably read the stories. Here's what we put in your contract so you don't have to wonder.",
  seoTitle: "Our Guarantee | Start Date, Deposit and Price Protection | Papago Vans",
  seoDescription: "What Papago puts in writing on every build: your production start date, how your deposit is protected, a locked price, and weekly build updates.",
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

/**
 * Three "answer" pages for AI search, owner 2026-10-20: each answers one
 * question buyers ask ChatGPT, Claude and Google, from facts already
 * published on this site (tier pages, FAQ, About, Our Process). No new
 * claims. The FAQ's bathroom and off-grid answers link to them.
 *
 *   npx tsx scripts/create-answer-pages.ts
 *
 * Safe to re-run: pages match on slug, FAQ links are added once. Already run;
 * edit in /admin from here on.
 */
import { createRequire } from "module";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");
const { revalidateLive } = await import("../lib/revalidate-live.ts");

type Span = string | { link: string; text: string };
const t = (text: string, bold = false) => ({ mode: "normal", text, type: "text", style: "", detail: 0, format: bold ? 1 : 0, version: 1 });
const block = { format: "", indent: 0, version: 1, direction: null };
const link = (url: string, text: string) => ({ type: "link", fields: { url, newTab: false, linkType: "custom" }, format: "", indent: 0, version: 3, direction: "ltr", children: [t(text)] });
const spans = (parts: Span[]) =>
  parts.flatMap((p) => {
    if (typeof p !== "string") return [link(p.link, p.text)];
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
const faq = (heading: string, items: [string, Span[]][]) => ({ blockType: "faq", heading, items: items.map(([question, answer]) => ({ question, answer: doc(P(...answer)) })) });
const close = (heading: string) => ({
  blockType: "cta",
  style: "band",
  heading,
  text: "Eight quick questions, about two minutes. You'll see your matching build and its starting price, van included.",
  button: { to: "custom", url: "/which-build-fits-you/", text: "Which Build Fits You?" },
  smallPrint: doc(P("Or call ", { link: "tel:+14807617175", text: "(480) 761-7175" }, ".")),
});
const VAN_NOTE = "Prices include a $75,000 Mercedes-Benz Sprinter allowance. A Ford Transit averages $57,000 and a Ram ProMaster $56,000, so a build on either starts lower.";

const pages = [
  {
    slug: "camper-van-with-bathroom-and-shower",
    title: "Camper Vans With A Bathroom And Shower",
    eyebrow: "Bathroom & Shower",
    heading: "Camper Vans With A Bathroom And Shower",
    intro: "Yes, a Papago can have both inside: an enclosed shower and a toilet you can use without stepping outside. Three of our four floor plans come with an indoor wet bath as standard, and every build can carry an outdoor shower at the rear doors.",
    seoTitle: "Camper Van With Bathroom And Shower | Papago Vans",
    seoDescription: "Which Papago camper vans have an indoor shower and toilet, from $161,795 with the van included. Wet baths, tiled showers, hot water and tank sizes by build.",
    sections: [
      {
        blockType: "text",
        heading: "Which builds have an indoor shower and toilet",
        content: doc(
          UL(
            [{ link: "/zion/", text: "Zion" }, ", from $161,795: an interior wet bath with a shower and a hot and cold flushing toilet, a 4-gallon electric water heater and 33 gallons of fresh water."],
            [{ link: "/olympus/", text: "Olympus" }, ", from $183,595: an indoor wet bath with an integrated shower and a compact toilet, a Laveo dry flush toilet with odor-free cartridges, a 4-gallon electric water heater and 33 gallons of fresh water."],
            [{ link: "/el-capitan-luxury-van-build/", text: "El Capitan" }, ", from $202,395: a fully tiled indoor shower with a wet-bath style toilet, your choice of shower tile, a Laveo dry flush toilet, a 4-gallon electric water heater and 33 gallons of fresh water."],
            [{ link: "/mckinley/", text: "McKinley" }, ", from $144,295: built for short trips, with a 5-gallon cassette toilet, an outdoor shower at the rear doors and a 23-gallon fresh water tank. Ask us about adding an indoor shower."],
          ),
          P(VAN_NOTE),
          H3("Bathroom upgrades on any build"),
          UL("A tiled or non-tiled shower", "A tiled backsplash to match", "A 23, 30 or 40 gallon fresh water tank", "A water purification unit and a water level sensor", "A 4-gallon electric water heater"),
          P("Every option is priced before you pick it."),
          H3("Want the bathroom somewhere else?"),
          P("Each floor plan puts the wet bath in a place we have built dozens of times. If none of them suits you, a ", { link: "/bespoke/", text: "Bespoke build" }, " starts from an empty van and is drawn around how you live, from $250,000 to $350,000 with the van included."),
        ),
      },
      faq("Questions about bathrooms and showers", [
        ["Do all Papago vans have a toilet?", ["Yes. McKinley and Zion include a 5-gallon cassette toilet that you empty yourself. Olympus and El Capitan use a Laveo dry flush toilet with odor-free disposable cartridges."]],
        ["Is there hot water for the shower?", ["Yes. Zion, Olympus and El Capitan have a 4-gallon electric water heater, and McKinley has a Bosch water heater."]],
        ["How much water does the van carry?", ["33 gallons of fresh water on Zion, Olympus and El Capitan, and 23 gallons on McKinley. Tanks of 23, 30 or 40 gallons are available as an upgrade."]],
        ["Can I have an outdoor shower as well?", ["Yes. Every build can carry an exterior shower, and all four floor plans include one at the rear doors."]],
      ]),
      close("Find the build with the bathroom you want."),
    ],
  },
  {
    slug: "off-grid-sprinter-van-full-time",
    title: "Off-Grid Sprinter Vans For Full-Time Living",
    eyebrow: "Off-Grid & Full-Time",
    heading: "Off-Grid Sprinter Vans For Full-Time Living",
    intro: "Living in a van full time comes down to power: how much you store, how fast you refill it, and whether the van stays comfortable without a hookup. Our Olympus and El Capitan carry the most power of our four floor plans, on a Mercedes-Benz Sprinter, Ford Transit or Ram ProMaster.",
    seoTitle: "Off-Grid Sprinter Van For Full-Time Living | Papago Vans",
    seoDescription: "Lithium power, solar, DC-DC charging, diesel heat and 12V A/C for living in a van full time. Olympus from $183,595 and El Capitan from $202,395, van included.",
    sections: [
      {
        blockType: "text",
        heading: "How an off-grid Papago works",
        content: doc(
          P("Solar charges a lithium battery bank, the van runs at 12V off that bank, and an inverter makes 110V for ordinary household outlets. A DC-DC charger refills the batteries while you drive, so a travel day is also a charging day. An RV has to be plugged in; this does not."),
          H3("The two builds with the most power"),
          UL(
            [{ link: "/olympus/", text: "Olympus" }, ", from $183,595, our most popular build: a 400Ah lithium battery, 400W of solar, a 2500W pure sine inverter and charger, a 40A DC-DC charger, shore power, a 12V Nomadic rooftop A/C, an Espar cabin heater, the full insulation package, an indoor wet bath and 33 gallons of fresh water."],
            [{ link: "/el-capitan-luxury-van-build/", text: "El Capitan" }, ", from $202,395, our top tier: an 800Ah lithium battery bank, up to 400W of solar on extended wheelbase models, a 3000W pure sine inverter and charger, a 60A DC-DC charger, a 12V Nomadic rooftop A/C, an Espar cabin heater, the premium insulation package, a fully tiled indoor shower and 33 gallons of fresh water."],
          ),
          P({ link: "/zion/", text: "Zion" }, ", from $161,795, is built for week-long trips with the odd night on shore power, with a 400Ah lithium battery and 300W of solar, rather than for months off grid."),
          P(VAN_NOTE),
          H3("Heat, cooling and insulation"),
          UL(
            "An Espar cabin heater, running on diesel or gasoline, keeps the van warm parked or driving.",
            "A 12V rooftop A/C on Olympus and El Capitan runs off the battery bank, so cooling does not need a hookup.",
            "Havelock wool in the premium insulation package handles moisture better than foam, which matters in a van that gets cooked in Phoenix and slept in at 20 degrees.",
            "A Maxxair Deluxe roof fan with remote moves air without running the A/C.",
          ),
          H3("Upgrades for living on the road"),
          UL("More lithium: 100Ah lithium iron phosphate batteries with Bluetooth", "More solar: 100W or 200W panels, a foldable solar suitcase, and a 100A MPPT charger", "A battery monitoring screen", "A weBoost Drive X cell signal booster", "A 110V 15K air conditioner with heat pump", "A 40-gallon fresh water tank and a water purification unit"),
          P("Every option is priced before you pick it. For a full-time build drawn from an empty van, see ", { link: "/bespoke/", text: "Bespoke" }, ": a weekender and a full-time off-grid build are not the same battery bank."),
        ),
      },
      faq("Questions about living off grid", [
        ["How long can I stay off grid?", ["Days without a hookup rather than hours. The exact number depends on the weather and whether you are running the air conditioning."]],
        ["Does the van charge while I drive?", ["Yes. A DC-DC charger refills the house batteries from the engine: 40A on Olympus and 60A on El Capitan."]],
        ["Can I plug in when I want to?", ["Yes. Every build has a shore power hookup for RV parks and campsites with power."]],
        ["Can I insure and finance a van I live in?", ["Every Papago is RVIA certified, which makes it insurable and financeable as an RV rather than a modified cargo van. See ", { link: "/financing/", text: "Financing" }, "."]],
      ]),
      close("Find the build that fits how you live."),
    ],
  },
  {
    slug: "custom-van-builder-arizona",
    title: "Custom Camper Van Builder In Mesa, Arizona",
    eyebrow: "Mesa, Arizona",
    heading: "Custom Camper Van Builder In Mesa, Arizona",
    intro: "Papago Vans builds custom camper vans by hand in our own shop at 751 N Country Club Dr, Mesa, Arizona, on the Mercedes-Benz Sprinter, Ford Transit and Ram ProMaster. Four floor plans start at $144,295 with the van included, and a Bespoke build starts from an empty van.",
    seoTitle: "Custom Camper Van Builder In Mesa, Arizona | Papago Vans",
    seoDescription: "Custom Sprinter, Transit and ProMaster camper vans built by hand in our Mesa, Arizona shop. RVIA certified, veteran owned, from $144,295 with the van included.",
    sections: [
      {
        blockType: "text",
        heading: "What you get from a Mesa-built Papago",
        content: doc(
          UL(
            "**One shop, one crew.** Nothing is subcontracted. The cabinetry, the electrical and the plumbing are built in Mesa by people you can ask about it, by name, a year later.",
            "**You see it being built.** Weekly photographs of your own van, from the first panel to delivery.",
            "**The price is the price.** Every tier has a published starting price, van included, before you talk to anyone.",
            "**RVIA certified.** That is what makes a Papago insurable and financeable as an RV rather than a modified cargo van.",
            "**Veteran owned,** with 51 people in and around one shop.",
          ),
          H3("Four floor plans, van included"),
          UL(
            [{ link: "/mckinley/", text: "McKinley" }, ": from $144,295, the essentials for short trips"],
            [{ link: "/zion/", text: "Zion" }, ": from $161,795, for week-long trips"],
            [{ link: "/olympus/", text: "Olympus" }, ": from $183,595, our most popular build"],
            [{ link: "/el-capitan-luxury-van-build/", text: "El Capitan" }, ": from $202,395, our top tier"],
            [{ link: "/bespoke/", text: "Bespoke" }, ": $250,000 to $350,000, drawn from an empty van"],
          ),
          P(VAN_NOTE),
          H3("Built for the desert, and for cold nights"),
          P("Arizona vans get cooked in Phoenix and slept in at 20 degrees. Havelock wool insulation handles moisture better than foam, a 12V rooftop A/C on Olympus and El Capitan runs off the batteries, and an Espar cabin heater on Zion, Olympus and El Capitan runs on diesel or gasoline."),
          H3("How a build works"),
          P("A call about where you want to go and who is coming, then an itemized quote, not a range. We source the van through dealerships we already work with, or you bring your own Sprinter, Transit or ProMaster. A deposit reserves your build and locks your pricing, you design it with the people who will build it, and you see it in 3D before a panel is cut. ", { link: "/our-process/", text: "See all ten steps" }, "."),
          H3("Come see the shop"),
          P("Come and see a van being built at 751 N Country Club Dr, Mesa, AZ 85201. Call ahead so someone is free: ", { link: "tel:+14807617175", text: "(480) 761-7175" }, "."),
          P("Already own a van? Our ", { link: "/service-department/", text: "Service Department" }, " takes repairs, upgrades and unfinished DIY builds on vans, campers and skoolies."),
        ),
      },
      faq("Questions about Papago Vans", [
        ["Where is Papago Vans?", ["Our shop is at 751 N Country Club Dr, Mesa, Arizona 85201. Call (480) 761-7175 before you visit so someone is free to show you around."]],
        ["Which vans do you build on?", ["The Mercedes-Benz Sprinter, Ford Transit and Ram ProMaster. We source the van through dealerships we already work with, or you can bring your own."]],
        ["How much does a custom camper van cost?", ["Our four floor plans run from $144,295 for a McKinley to $202,395 and up for an El Capitan, van included. A Bespoke build runs $250,000 to $350,000. See the ", { link: "/van-conversion-build-tiers/", text: "build tiers" }, "."]],
        ["Do you offer financing?", ["Yes. We can finance the build and the van together, or the build on its own. See ", { link: "/financing/", text: "Financing" }, "."]],
      ]),
      close("Find the Papago that fits you."),
    ],
  },
];

const payload = await getPayload({ config });
const done: string[] = [];
for (const p of pages) {
  const data = { ...p, _status: "published" as const };
  const existing = (await payload.find({ collection: "pages", where: { slug: { equals: p.slug } }, limit: 1, depth: 0 })).docs[0];
  if (existing) await payload.update({ collection: "pages", id: existing.id, data: data as never });
  else await payload.create({ collection: "pages", data: data as never });
  done.push(`/${p.slug}/`);
}
console.log("pages:", done.join(", "));

/* The FAQ's own answers point at the new pages. */
const faqPage = (await payload.find({ collection: "pages", where: { slug: { equals: "faq" } }, limit: 1, depth: 0 })).docs[0] as unknown as { id: number; sections: { blockType: string; items?: { question: string; answer: { root: { children: { children: unknown[] }[] } } }[] }[] };
const LINKS: [RegExp, string, string, string][] = [
  [/bathroom and a shower/i, " See ", "/camper-van-with-bathroom-and-shower/", "camper vans with a bathroom and shower"],
  [/off grid/i, " See ", "/off-grid-sprinter-van-full-time/", "off-grid vans for full-time living"],
];
let linked = 0;
for (const s of faqPage.sections) for (const it of s.items ?? []) for (const [q, lead, url, text] of LINKS) {
  if (!q.test(it.question) || JSON.stringify(it.answer).includes(url)) continue;
  const last = it.answer.root.children.at(-1)!;
  last.children.push(t(lead), link(url, text), t("."));
  linked++;
}
if (linked) await payload.update({ collection: "pages", id: faqPage.id, data: { sections: faqPage.sections, _status: "published" } as never });
console.log("faq links added:", linked);

await revalidateLive([...done, "/faq/", "/sitemap.xml"]);
process.exit(0);

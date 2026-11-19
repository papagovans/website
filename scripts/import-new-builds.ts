/**
 * Seven builds from the photo shoots, Aug to Oct 2026 (owner 2026-11-19).
 *
 *   npx tsx scripts/import-new-builds.ts
 *
 * Named by the owner's last name for now. Each gets a short story instead of
 * the long spec lists, so the photos sit right under the hero. "Date finished"
 * is the photo shoot date, which puts all seven above the older builds.
 * Repeat shots of the same angle were left out by eye (see the folder for
 * the full set). The Media Library compresses every photo (collections/Media.ts).
 *
 * Safe to re-run: builds match on slug, photos on filename.
 */
import { createRequire } from "module";
import { readFile } from "fs/promises";
import path from "path";

createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
const { JSDOM } = await import("jsdom");
const { getPayload } = await import("payload");
const { convertHTMLToLexical, editorConfigFactory } = await import("@payloadcms/richtext-lexical");
const { default: config } = await import("../payload.config.ts");
const { answerText } = await import("../collections/fields.ts");
const { revalidateLive } = await import("../lib/revalidate-live.ts");

const SRC = "/Volumes/4TB ExtremePro/projects/papagovans-van-photos";
const payload = await getPayload({ config });
const editorConfig = await editorConfigFactory.fromEditor({ config: payload.config, editor: answerText });

type Build = { title: string; slug: string; finished: string; summary: string; story: string; photos: [string, string][] };

// First photo is the hero and the gallery card, so it is always the whole van.
const BUILDS: Build[] = [
  {
    title: "Daniel",
    slug: "daniel-custom-sprinter-van-build",
    finished: "2026-10-26",
    summary: "A Mercedes Sprinter 4x4 with green cabinets, a pine ceiling and bright peacock-print cushions, plus a full galley, indoor shower, rear dinette and a trail-ready exterior with amber lights and a winch.",
    story: "The Daniels wanted a van with some personality, and this one has it in spades. Green cabinets with leather pulls, a warm pine ceiling and bright peacock-print cushions make the inside feel like a cheerful little cabin, with a full galley, an indoor shower and a rear dinette for slow mornings. Outside, it is all business: a lifted Mercedes Sprinter 4x4 with a winch bumper, amber lights front and top, a Fiamma awning and FVCO rear storage, ready for wherever the pavement quits.",
    photos: [
      ["JMO_5162", "Gray Sprinter 4x4 van with amber roof lights and winch bumper outside the Papago Vans shop"],
      ["JMO_5164", "Roof light bar with amber and white lights"],
      ["JMO_5165", "Front bumper with winch and amber driving lights"],
      ["JMO_5166", "Amber auxiliary light mounted on the hood"],
      ["JMO_5160", "Black wheel with all-terrain tire"],
      ["JMO_5161", "Lifted suspension with remote reservoir shock"],
      ["JMO_5168", "Rear ladder and Papago logo on the van's side"],
      ["JMO_5171", "Papago logo beside the tail light and rear tire"],
      ["JMO_5173", "Rear three-quarter view with ladder and spare tire carrier"],
      ["JMO_5174", "Spare tire on the rear door carrier"],
      ["JMO_5176", "FVCO storage panel and spare tire on the rear doors"],
      ["JMO_5177", "Papago logo below the rear side window"],
      ["JMO_5184", "Black ladder on the rear of the van"],
      ["JMO_5178", "Fiamma awning on the roof rack"],
      ["JMO_5155", "Sliding door open to the galley and green cabinets"],
      ["JMO_5158", "Galley seen through the open sliding door"],
      ["JMO_5153", "Flip-out counter extension by the sliding door"],
      ["JMO_5152", "Fold-down wood shelf at the side door entry"],
      ["JMO_5159", "Kitchen with black faucet and green upper cabinets"],
      ["JMO_5127", "Looking back to the rear dinette with table and bench seats"],
      ["JMO_5128", "Interior with TV, dinette and indoor shower"],
      ["JMO_5147", "Indoor shower with black fixtures next to the galley"],
      ["JMO_5129", "Rear bed under the pine plank ceiling"],
      ["JMO_5130", "Wall-mounted TV beside white shiplap walls"],
      ["JMO_5131", "Peacock-print cushions and green cabinets with leather pulls"],
      ["JMO_5133", "Green cabinet doors with leather pulls"],
      ["JMO_5135", "Close-up of the yellow and orange peacock-print fabric"],
      ["JMO_5138", "Built-in microwave in a green cabinet"],
      ["JMO_5144", "Black pull-down faucet over a butcher block counter"],
      ["JMO_5148", "Deep stainless sink with grid insert"],
      ["JMO_5145", "Refrigerator with the door open"],
      ["JMO_5151", "Pull-out pantry beside the microwave"],
      ["JMO_5150", "Papago control panel with touchscreen display"],
      ["JMO_5143", "Roof fan in the pine ceiling"],
      ["JMO_5183", "Pine plank ceiling with recessed lights"],
      ["JMO_5181", "Rear doors open to the dinette and storage below"],
      ["JMO_5182", "Rear view of yellow cushions and green garage doors"],
      ["Casey Daniel Pick Up/JMO_5187", "The owners with their finished van at Papago Vans"],
      ["Casey Daniel Pick Up/JMO_5189", "The owners at the open sliding door on pickup day"],
    ],
  },
  {
    title: "Seals",
    slug: "seals-custom-sprinter-van-build",
    finished: "2026-10-19",
    summary: "A dark gray Mercedes Sprinter 4x4 with a winch bumper, LED driving lights and an amber light bar, plus a front lounge, two-burner induction galley, tiled shower and a light wood interior.",
    story: "The Seals van looks like it means business from a block away: a dark gray Mercedes Sprinter 4x4 with a winch bumper, big round LED driving lights, an amber light bar and FVCO swing-out storage on both rear doors. Step inside and it softens right up, with a pine ceiling, white shiplap, light wood counters against a black hex-tile backsplash, two-burner induction and a tall fridge. A wraparound front lounge handles meals and movie night, and a tiled shower with its own toilet means nobody has to go hunting for a campground.",
    photos: [
      ["JMO_4881", "Dark gray Sprinter 4x4 van with winch bumper and amber roof lights at Papago Vans"],
      ["JMO_4883", "Side view with the sliding door open and rear storage swung out"],
      ["JMO_4873", "Front view with LED driving lights and winch"],
      ["JMO_4875", "Steel front bumper with round LED lights and winch"],
      ["JMO_4877", "Amber and white roof light bar"],
      ["JMO_4879", "Hood with black stripe and amber marker lights"],
      ["JMO_4884", "Sliding door open to the galley"],
      ["JMO_4885", "FVCO swing-out storage on the rear door"],
      ["JMO_4888", "Rear doors open with spare tire and storage swing-outs"],
      ["JMO_4889", "Electrical panel and shore power inlet"],
      ["JMO_4892", "Rear ladder and spare tire"],
      ["JMO_4893", "Spare tire on the rear door carrier"],
      ["JMO_4894", "Black wheel with all-terrain tire"],
      ["JMO_4895", "Lifted suspension with remote reservoir shocks"],
      ["JMO_4890", "Looking forward through the van to the front lounge"],
      ["JMO_4905", "Wraparound lounge with table"],
      ["JMO_4915", "Galley with black sink and tall refrigerator"],
      ["JMO_4902", "Kitchen counter with induction cooktop and hex-tile backsplash"],
      ["JMO_4903", "Black sink and pull-down faucet in a light wood counter"],
      ["JMO_4904", "Two-burner induction cooktop and wall-mounted TV"],
      ["JMO_4901", "Upper cabinets above the galley"],
      ["JMO_4897", "Tall refrigerator and drawers with black pulls"],
      ["JMO_4911", "Built-in microwave"],
      ["JMO_4906", "Bench seat by the window"],
      ["JMO_4910", "Window framed in light wood above the counter"],
      ["JMO_4909", "Tiled shower with black fixtures"],
      ["JMO_4908", "Shower floor with toilet cabinet"],
      ["JMO_4912", "Papago control panel with display"],
      ["JMO_4900", "Roof fan in the pine ceiling"],
      ["JMO_4913", "Overhead storage net and smoke detector"],
      ["JMO_4914", "Fire extinguisher mounted by the door"],
      ["Seals Pick Up/JMO_4919", "The owners with their finished van"],
      ["Seals Pick Up/JMO_4921", "The owners in front of Papago Vans on pickup day"],
    ],
  },
  {
    title: "Vaughn",
    slug: "vaughn-custom-sprinter-van-build",
    finished: "2026-10-14",
    summary: "A gray Mercedes Sprinter 4x4 on bronze wheels with a roof light bar and FVCO rear storage, plus brass fixtures, slate-tile shower, roof air conditioning and a full galley.",
    story: "The Vaughns picked a look and committed to it: a gray Mercedes Sprinter 4x4 on bronze wheels, with lifted suspension, a roof light bar, awning and FVCO rear storage hung right next to the spare. Inside, a brass faucet and dark wood counters play off a textured tile backsplash, white shiplap and a dark stained ceiling. A slate-tile shower, roof air conditioning, a full-size fridge and a microwave make it the kind of van you can live in for weeks, not just a weekend.",
    photos: [
      ["JMO_4835", "Gray Sprinter 4x4 van on bronze wheels outside the Papago Vans shop"],
      ["JMO_4836", "Front three-quarter view with roof rack and ladder"],
      ["JMO_4848", "Front bumper and lifted stance"],
      ["JMO_4853", "Side view with the awning out and sliding door open"],
      ["JMO_4837", "Ladder and side window"],
      ["JMO_4840", "Rear view with spare tire and storage"],
      ["JMO_4842", "FVCO rear storage and spare tire on the rear doors"],
      ["JMO_4844", "Rear door storage swung open"],
      ["JMO_4841", "Spare tire on a bronze wheel"],
      ["JMO_4846", "Bronze wheel with all-terrain tire"],
      ["JMO_4845", "Lifted suspension with remote reservoir shocks"],
      ["JMO_4850", "LED light bar on the roof rack"],
      ["JMO_4851", "Papago logo on the rear corner"],
      ["JMO_4854", "Sliding door open to the galley"],
      ["JMO_4855", "Brass pull-down faucet"],
      ["JMO_4856", "Galley with dark wood counters and white cabinets"],
      ["JMO_4857", "Textured tile backsplash behind the counter"],
      ["JMO_4834", "Interior entry with tile wall and under-cabinet lighting"],
      ["JMO_4858", "Shower with slate-look tile"],
      ["JMO_4859", "Shower entry and floor"],
      ["JMO_4863", "Built-in Furrion microwave"],
      ["JMO_4864", "Refrigerator with the door open"],
      ["JMO_4862", "Lit cabinet doors at floor level"],
      ["JMO_4865", "Wall-mounted TV above the window"],
      ["JMO_4866", "Nomadic roof air conditioner"],
      ["JMO_4860", "Roof fan in the dark stained ceiling"],
      ["JMO_4868", "Upper cabinets with brass pulls"],
      ["Vaughn Pick Up/JMO_4871", "The owners with their finished van on pickup day"],
    ],
  },
  {
    title: "Denny",
    slug: "denny-custom-sprinter-van-build",
    finished: "2026-09-01",
    summary: "A two-tone Mercedes Sprinter 4x4 with a slatted wood ceiling, butcher block counters, indoor shower, roof air conditioning, a rear bed over a gear garage and a winch bumper.",
    story: "The Denny van is a two-tone Mercedes Sprinter 4x4 that looks as good parked at a trailhead as it does in a driveway. The slatted wood ceiling with built-in light strips is the first thing everyone notices, followed by butcher block counters, a stainless undermount sink, induction cooking and a convection microwave. An indoor shower, roof air conditioning and a rear bed over a gear garage round out the inside, while a winch bumper, lift, ladder, awning and FVCO rear storage handle the outside.",
    photos: [
      ["JMO_4640", "Two-tone Sprinter 4x4 van with roof rack and ladder outside the Papago Vans shop"],
      ["JMO_4645", "Side view with ladder and rear spare tire"],
      ["JMO_4634", "Side view with the awning out and sliding door open"],
      ["JMO_4637", "Front bumper with winch"],
      ["JMO_4641", "Black wheel with all-terrain tire"],
      ["JMO_4642", "Lifted suspension with remote reservoir shock"],
      ["JMO_4646", "Spare tire on the rear door and Papago logo"],
      ["JMO_4650", "FVCO storage panel on the rear door"],
      ["JMO_4649", "Rear doors open to the gear garage under the bed"],
      ["JMO_4651", "Rear three-quarter view with the doors and awning open"],
      ["JMO_4620", "Galley, shower and rear bed under the slatted wood ceiling"],
      ["JMO_4630", "Induction cooktop on a butcher block counter"],
      ["JMO_4631", "Stainless undermount sink and pull-down faucet"],
      ["JMO_4627", "Looking forward past the galley to the cab"],
      ["JMO_4628", "Indoor shower beside the bed"],
      ["JMO_4632", "Bench seat with charcoal cushion"],
      ["JMO_4624", "Convection microwave in the upper cabinet"],
      ["JMO_4623", "Refrigerator with the door open"],
      ["JMO_4626", "Roof air conditioner in the slatted wood ceiling"],
      ["JMO_4625", "Roof fan"],
    ],
  },
  {
    title: "Rosborough",
    slug: "rosborough-custom-promaster-van-build",
    finished: "2026-08-19",
    summary: "A lifted Ram ProMaster with a winch bumper, roof rack and FVCO rear storage, plus sage green cabinets, a wood plank ceiling, indoor shower and a rear bed over a gear garage.",
    story: "Not every Papago van is a Sprinter. The Rosborough build starts with a Ram ProMaster, lifted on all-terrain tires with a winch bumper, roof rack, ladder and FVCO rear storage, and it looked right at home against the red rocks on photo day. Inside, sage green cabinets, a wood plank ceiling and dark butcher block counters keep it calm and cozy, with an indoor shower, a big fridge and a rear bed over a garage that swallows the gear.",
    photos: [
      ["JMO_3005", "Lifted Ram ProMaster van with winch bumper in front of red rock formations"],
      ["JMO_3000", "Front view with Ram grille and winch"],
      ["JMO_3007", "Side view with the sliding door open"],
      ["JMO_3009", "Profile with the sliding door and rear storage open"],
      ["JMO_3015", "Side view with ladder and roof rack"],
      ["JMO_3010", "Rear three-quarter view with doors and storage open"],
      ["JMO_3014", "Spare tire on a black wheel"],
      ["JMO_3012", "Rear doors open to the gear garage under the bed"],
      ["JMO_3018", "Galley with black faucet and dark butcher block counter"],
      ["JMO_3019", "Indoor shower with black fixtures next to the bed"],
      ["JMO_3020", "Looking back past the shower to the rear bed"],
      ["JMO_3023", "Rear bed and counter by the window"],
      ["JMO_3025", "Galley counter and shower door"],
      ["JMO_3026", "Bed with reading light and window"],
      ["JMO_3024", "Refrigerator with the door open"],
      ["JMO_3027", "Papago control panel"],
      ["JMO_3021", "Roof fan in the wood plank ceiling"],
      ["JMO_3028", "Looking forward to the cab seats"],
    ],
  },
  {
    title: "Ferrell",
    slug: "ferrell-custom-sprinter-van-build",
    finished: "2026-08-18",
    summary: "A blue-gray Mercedes Sprinter with sage green cabinets, a stained wood ceiling, plaid bench seat, induction galley, skylight and a rear bed with a view.",
    story: "The Ferrell van is proof that a Sprinter can feel like home without trying too hard. Sage green cabinets with leather pulls, a stained wood ceiling and a plaid bench seat set the tone, with hanging plants and a rear bed that looks right out the back window. The galley packs induction cooking, a sink with a cover that doubles as counter space, a flip-up extension and a fridge, and a skylight and roof fan keep the air moving on hot days.",
    photos: [
      ["JMO_2960", "Blue-gray Sprinter van with the sliding door open in the desert"],
      ["JMO_2957", "Front view with mountains and saguaros behind"],
      ["JMO_2952", "Front three-quarter view with ladder and roof rack"],
      ["JMO_2965", "Side view with the sliding door open"],
      ["JMO_2974", "Side view with ladder and rear door open"],
      ["JMO_2972", "Rear three-quarter view framed by desert grass"],
      ["JMO_2968", "Rear doors open to the bed and storage"],
      ["JMO_2975", "Papago logo by the tail light"],
      ["JMO_2932", "Interior with green cabinets, galley and rear bed"],
      ["JMO_2939", "Sink cover and black faucet with the bed beyond"],
      ["JMO_2934", "Rear bed with hanging plants"],
      ["JMO_2936", "Rear bed with pillows under the window"],
      ["JMO_2937", "Plaid bench seat and induction cooktop"],
      ["JMO_2938", "Green galley cabinets below the window"],
      ["JMO_2944", "Cooktop and wood counter by the window"],
      ["JMO_2943", "Looking forward to the cab with curtains"],
      ["JMO_2933", "Hallway past the fridge cabinet to the rear doors"],
      ["JMO_2981", "Refrigerator with the door open"],
      ["JMO_2982", "Portable toilet strapped in its cabinet"],
      ["JMO_2942", "Skylight in the stained wood ceiling"],
      ["JMO_2940", "Roof fan in the wood ceiling"],
      ["JMO_4413", "The owners with their finished van in the Papago Vans showroom"],
    ],
  },
  {
    title: "Hill",
    slug: "hill-custom-sprinter-van-build",
    finished: "2026-08-17",
    summary: "A charcoal Mercedes Sprinter 4x4 with a mountain graphic, lift, awning and FVCO rear storage, plus a teal bench with swivel table, indoor shower, roof air conditioning and a big rear garage.",
    story: "The Hill van wears its Papago mountain graphic on a charcoal Mercedes Sprinter 4x4, lifted on all-terrain tires with a roof rack, ladder, awning, light bar and FVCO storage on the rear doors. Inside, white shiplap and a dark stained ceiling frame a teal bench with a swivel table, a galley with induction, microwave and fridge, and an indoor shower with black fixtures. The rear bed sits over a garage deep enough for bikes, chairs and everything else, and roof air conditioning keeps it comfortable in an Arizona August.",
    photos: [
      ["JMO_2888", "Charcoal Sprinter 4x4 van with awning out among saguaros"],
      ["JMO_2890", "Front view with light bar and awning"],
      ["JMO_2906", "Front three-quarter view with mountains behind"],
      ["JMO_2904", "Front view framed by desert brush"],
      ["JMO_2892", "Side view with roof rack, ladder and mountain graphic"],
      ["JMO_2912", "Profile with rear door open"],
      ["JMO_2903", "Side view with the awning out"],
      ["JMO_2902", "Papago mountain graphic on the rear quarter panel"],
      ["JMO_2893", "Ladder and spare tire carrier"],
      ["JMO_2894", "Black wheel with all-terrain tire"],
      ["JMO_2898", "FVCO rear storage swung out"],
      ["JMO_2900", "Rear door open with the awning out"],
      ["JMO_2895", "Rear three-quarter view with doors open to the bed"],
      ["JMO_2896", "Rear doors open to the bed and garage"],
      ["JMO_2897", "Rear garage with slide-out tray under the bed"],
      ["JMO_2883", "Sliding door open to the teal bench seat"],
      ["JMO_2923", "Teal bench seat with swivel table"],
      ["JMO_2915", "Galley with black faucet and induction cooktop"],
      ["JMO_2916", "Sink cover on the counter by the window"],
      ["JMO_2925", "Galley looking forward to the cab"],
      ["JMO_2918", "Microwave and cabinets with under-cabinet lighting"],
      ["JMO_2922", "Refrigerator with the door open"],
      ["JMO_2914", "Hallway to the rear past the microwave"],
      ["JMO_2881", "Looking back to the bed past the shower"],
      ["JMO_2919", "Indoor shower with black fixtures"],
      ["JMO_2913", "Rear bed with a view out the back"],
      ["JMO_2921", "Faux fur throw on the rear bed"],
      ["JMO_2928", "Roof air conditioner in the dark stained ceiling"],
      ["JMO_2927", "Roof fan"],
      ["JMO_2926", "Overhead cab console with Papago Vans badge"],
      ["JMO_2930", "View from the driver's seat"],
    ],
  },
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function photo(file: string, name: string, alt: string) {
  const found = await payload.find({ collection: "media", where: { filename: { equals: `${name}.webp` } }, limit: 1 });
  if (found.docs[0]) return found.docs[0].id as number;
  const data = await readFile(file);
  return (await payload.create({
    collection: "media",
    data: { alt },
    file: { data, name: `${name}.jpg`, mimetype: "image/jpeg", size: data.length },
  })).id as number;
}

for (const b of BUILDS) {
  const name = b.title.toLowerCase();
  const ids: number[] = [];
  for (const [i, [f, alt]] of b.photos.entries()) {
    const file = path.join(SRC, `${b.title} Van Build Photos`, `${f}.jpg`);
    ids.push(await photo(file, `build-${name}-${String(i).padStart(2, "0")}`, alt));
    process.stdout.write(".");
  }
  const data = {
    // Owner's last name + "Van Build" (owner 2026-11-19).
    title: `${b.title} Van Build`,
    slug: b.slug,
    finished: new Date(`${b.finished}T12:00:00Z`).toISOString(),
    summary: b.summary,
    description: convertHTMLToLexical({ editorConfig, html: `<p>${esc(b.story)}</p>`, JSDOM }),
    photos: ids,
    _status: "published" as const,
  };
  const existing = await payload.find({ collection: "builds", where: { slug: { equals: b.slug } }, limit: 1, depth: 0 });
  if (existing.docs[0]) await payload.update({ collection: "builds", id: existing.docs[0].id, data });
  else await payload.create({ collection: "builds", data });
  console.log(`\n${b.title}: ${ids.length} photos`);
}

await revalidateLive(["/", "/van-life-build-gallery/", ...BUILDS.map((b) => `/projects/${b.slug}/`)]);
process.exit(0);

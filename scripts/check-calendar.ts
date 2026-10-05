/* npx tsx scripts/check-calendar.ts: who gets offered Jeremy's calendar after the sales form. */
import assert from "node:assert";
import { matchTier, wantsCalendar } from "../components/HubSpotForm.tsx";
assert(!wantsCalendar("$170K - $190K"));
assert(wantsCalendar("$190K - $220K"));
assert(wantsCalendar("$220K - $260K"));
assert(wantsCalendar("$260K+"));
assert(!wantsCalendar(""));
assert(!wantsCalendar(undefined));
const tiers = [144295, 161795, 183595, 202395].map((total, i) => ({ path: `/t${i}/`, name: `T${i}`, tagline: "", total }));
assert.equal(matchTier(tiers, "$170K - $190K").total, 183595);
assert.equal(matchTier(tiers, "$190K - $220K").total, 202395);
assert.equal(matchTier(tiers, "$260K+").total, 202395);
assert.equal(matchTier(tiers, "").total, 144295);
console.log("ok");

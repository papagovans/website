/* npx tsx scripts/check-calendar.ts: which build tier the quiz matches to a budget. */
import assert from "node:assert";
import { matchTier } from "../components/HubSpotForm.tsx";
const tiers = [144295, 161795, 183595, 202395].map((total, i) => ({ path: `/t${i}/`, name: `T${i}`, tagline: "", total }));
assert.equal(matchTier(tiers, "$170K - $190K").total, 183595);
assert.equal(matchTier(tiers, "$190K - $220K").total, 202395);
assert.equal(matchTier(tiers, "$260K+").total, 202395);
assert.equal(matchTier(tiers, "").total, 144295);
console.log("ok");

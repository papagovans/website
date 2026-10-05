/* npx tsx scripts/check-calendar.ts: who gets offered Jeremy's calendar after the sales form. */
import assert from "node:assert";
import { wantsCalendar } from "../components/HubSpotForm.tsx";
assert(wantsCalendar("$170K - $200K"));
assert(wantsCalendar("$200K+"));
assert(!wantsCalendar("$150K - $170K")); // labelled $140K - $170K
assert(!wantsCalendar(""));
assert(!wantsCalendar(undefined));
console.log("ok");

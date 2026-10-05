/* npx tsx scripts/check-calendar.ts: who gets offered Jeremy's calendar after the sales form. */
import assert from "node:assert";
import { wantsCalendar } from "../components/HubSpotForm.tsx";
assert(!wantsCalendar("$170K - $190K"));
assert(wantsCalendar("$190K - $220K"));
assert(wantsCalendar("$220K - $260K"));
assert(wantsCalendar("$260K+"));
assert(!wantsCalendar(""));
assert(!wantsCalendar(undefined));
console.log("ok");

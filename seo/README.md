# The URL contract

`live-urls.json` lists every URL `papagovans.com` publishes today, pulled from
its sitemap. It exists because the one thing this rebuild cannot get wrong is
losing a page Google already ranks.

Refresh it from the live site:

```bash
npm run urls:fetch      # re-pulls, keeps decisions already recorded
```

Check the build against it:

```bash
npm run build
npm run urls:check      # fails if anything already migrated regressed
npm run urls:launch     # fails if anything is still outstanding — the launch gate
```

## Status values

| status | meaning | enforced |
|---|---|---|
| `todo` | not rebuilt yet | no, this is the backlog |
| `done` | rebuilt at this exact path | must resolve |
| `redirect` | not rebuilt, 301s to `to` | the redirect must exist and point where the fixture says |
| `drop` | deliberately gone | must carry a reason |

Redirects are **generated** from this file by `next.config.ts`. Never hand-write
one, or the map and the site will drift.

## Two things that are easy to get wrong

**Trailing slashes.** The live site publishes `/zion/`, not `/zion`. The app sets
`trailingSlash: true` so rebuilt pages land on the identical URL. Changing that
setting silently changes all 186 URLs.

**The seven `-old` pages.** `/zion-old/` and `/zion/` are both indexed today and
competing for the same queries, which splits the authority of our
highest-commercial-intent pages. The fixture currently points each `-old` page at
its live counterpart. **Confirm this against Search Console before launch.** If
the `-old` page is the one actually ranking, the arrow reverses, and getting it
backwards costs us the page.

## /van-conversion-build-tiers/ redirects to the builder

Owner decision, 2026-09-24: this page points at build.papagovans.com.

Record the numbers so the trade is visible if it needs revisiting. Over the 12
months to 2026-09-22 this was the site's eighth page by clicks:

| Clicks | Impressions |
|---|---|
| 288 | 87,558 |

Those impressions come from informational queries about conversion pricing and
tiers. The configurator does not answer an informational query, so Google may
treat the redirect as a soft 404 and drop the page rather than pass its ranking
to the destination. Watch that URL in Search Console for a quarter.

The alternative, if the impressions fall off: rebuild it as a real page that
compares Tailored against Bespoke and lists the five floor plans with working
prices (the live version prints `$0 +` for all five), and put the builder link
on it as the call to action. That keeps the ranking and still feeds the builder.
Reversing is a one-line change to this URL's entry in live-urls.json.

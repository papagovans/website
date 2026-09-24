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

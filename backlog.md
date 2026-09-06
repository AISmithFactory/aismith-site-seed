# backlog

Open work for this repo, per `AISmith-Factory` -> `docs/backlog-convention.md` v0.2.
**Created 2026-08-03.** The convention has required a root `backlog.md` in every fleet
repo since 2026-07-09; this repo did not have one, and nothing checked until
`scripts/backlog-lane-check.sh` was written. Seven repos were missing it.

## Line format

```
- [ ] [ai|al|pair|factory] <title> -- input: <where> -- done when: <check>
```

- `[ai]` -- the dispatcher executes it.
- `[al]` -- needs the operator.
- `[pair]` -- the dispatcher drafts, the operator go/no-goes.
- `[factory]` -- **a learning owed UPSTREAM.** See below.

## The `[factory]` lane -- read this before adding one

A `[factory]` line is something THIS repo learned that would improve Factory canon:
a build lesson, a method that failed, a grammar the standard could not express.

```
- [ ] [factory] <what was learned> -- input: <where it bit> -- applies to:
  <canon doc it would improve> -- done when: Factory folds or rejects, recorded here
```

**`applies to` is load-bearing** -- it is what turns a war story into a routable patch.
A learning that cannot name a canon doc it would improve is a note; file it under
`[ai]`/`[al]` instead.

**This lane exists because every other one is bound to the audit cycle.** A manifest is
emitted at an AUDIT, so `raised_to_factory` carries only what a rubric row already asked
about -- and work that is never audited (a Google Workspace migration, a DNS cutover, a
host move) has no emit point at all. `backlog.md` is the only file every repo carries.

**A `[factory]` line is closed by the FACTORY, never by this repo.** The Factory sweeps
these at each Trigger-2 reconcile and records the outcome here. If one sits unresolved for
more than a cycle, that is a finding against the Factory, not against this repo.

## Open

- [ ] [pair] **`.crumb a` keys its ink on the tone and renders it on the HUE ground, and no row has ever named it** -- input: measured 2026-09-06 at `main` `5e77d77f` by the seed-batch lane, by the divergence scan added to `agents/site/verify.mjs` `[2]` in the same PR. `spine.css` `.crumb a { color: var(--sec-soft, ...) }` is hue-aware, and `[data-tone="dark"] .crumb a, [data-tone="slate"] .crumb a { color: var(--on-dark-soft) }` overrides it on specificity, so a `tone="dark" hue={N}` Section paints `--on-dark-soft` on `--hue-N`. This is the SAME class as the `.eyebrow` residue the G1 row carries, on a selector nobody enumerated -- **found by an instrument rather than by a reader, which is the whole argument for the scan**. No live site composes the cell today, so nothing is broken now; the seed gate will red it the day one does. -- done when: `.crumb a` is either collapsed onto `--sec-soft` on the same terms `.em`, `.btn-ghost` and `.crumb` were at the 1824 wave, or the combination is ruled refused with `.eyebrow`. **The two selectors are one decision and should not be taken separately.**

- [ ] [factory] **The `.galcredit` letter-spacing leg is NOT a no-op in the seed, and the row that asks for it was written before that was measurable** -- input: measured 2026-09-06 by the seed-batch lane. The row (`AISmith-Factory` `backlog.md`) offers *the seed gains the leg* or *the leg is ruled per-site*, on the understanding that the leg is one line riding a future re-embed. The evidence says the first arm has a cost the row does not price: `zuidgeluid-site` carries **two** `.galcredit` compositions, `src/content/home.tsx:158` with `letterSpacing: ".03em"` (the remnant) and `src/content/ui.tsx:134` `GalCredit` with **no letter-spacing at all** and recorded byte-exact against the class. Adding `letter-spacing: .03em` to the seed converts the remnant AND silently moves the second instance. **A single site disagrees with itself about the value, which is the strongest available argument that it is instance type rather than spine type.** -- applies to: `as-site-seed-spine.md` (the embedded `spine.css`), and the Factory row -- done when: the Factory rules the leg per-site and the remnant is recorded as an instance fact, or rules the seed leg and accepts the `ui.tsx:134` move as a sanctioned change with a rendered probe, recorded here either way.

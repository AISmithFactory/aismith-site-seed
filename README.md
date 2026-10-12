# aismith-site-seed — the canonical public-site scaffold

> **This repo is the agent-direct build substrate** (`as-site-build-agent.md` §5). A site build
> clones it, then re-skins `tokens.css` + rewrites `src/content/*` + updates `vite.config.ts`
> `pages` for the client's route set. The frozen spine (`src/components/spine/*`, `src/styles/spine.css`)
> is reproduced **verbatim from `as-site-seed-spine.md`** and is never edited per site.
>
> **Tracks:** site-contract **1.6.7** · spine-standard **v0.11.1** (em-dash-clean). Reconstructed from
> **2026-07-14:** additive Band `ambient` prop (per-skin quiet motion behind CTA bands: embers / node network / dotted grid, gated by `[data-skin]`, reduced-motion safe). Spine files touched: `primitives.tsx`, `spine.css`. From the Claude Design CtaBand handoff; first consumer aismith-site.
> the markdown-of-record (`as-site-seed-spine.md` + `as-site-seed-instance.md`) on the proven TanStack
> Start + Netlify toolchain. **Green:** `vite build` + `node agents/site/verify.mjs . --seed . --charter aismith-site-charter.md` exit 0.
>
> The instance shipped here is the **AI Smith reference site** — the worked example to overwrite.

---

# Public Site — TEMPLATE (AI Smith instance)

The fleet-manufacturable public-site seed. Conforms to `as-site-spine-standard.md`.
This copy is skinned and composed for **AI Smith** — the spine's first instance.

## The contract in one breath
**Spine never changes. Skin is one file. Content is config.** A new site =
clone this → re-skin `tokens.css` → fill `content/site.config` + `content/*` → compose
pages from spine components → pick optional modules. **No spine file is edited.**

## Before you start: scaffold + Step 0 (read first)
This seed is an **overlay, not a whole project.** It ships source files only (no
`package.json`, `app.config`, router entry, `routeTree.gen.ts`, or HTML shell). The build
agent (Lovable) scaffolds a fresh **TanStack Start + SSR** project, then drops these files
in over it.
- **Pin the version** Lovable scaffolds (check `package.json`). This seed was authored
  against the **TanStack Start / Router v1** API surface: `createRootRoute`,
  `createFileRoute`, `head()`, `HeadContent`, `Scripts`. If the scaffold differs, adapt
  the four route/`__root` touchpoints; the durable value (tokens + spine.css + components
  + composition) is framework-agnostic React.
- **Step 0 — backend posture (S5.4), before the first build prompt.** Lovable
  auto-provisions its own backend (Lovable Cloud) on a new project. This site is
  **`no-db`**: **decline it.** A provisioned backend behind a no-db site is a data surface
  the charter forbids and the audit fails. (This is the inverse of the hub lesson, where
  you *connect* Supabase first.) Only an anon-view read-pipe site connects anything, and
  then only the hub's existing project, read-only.
- `__root.tsx` owns the document shell here: it hard-sets `<html lang="en-GB">` and renders
  `HeadContent` + `Scripts`. Do not let the scaffold supply a second shell.
- **Attach every markup file via paperclip; never paste it inline.** Lovable strips
  angle-brackets from pasted text, so all `.tsx` files (and `site.config.tsx` with its
  inline SVG, and `__root.tsx`) are attached by path. Only the tiny no-JSX route files are
  safe to paste. See `SCAFFOLD.md` for the pinned build target and `functions/DEPLOY.md`
  for the Supabase Edge Function shape and (manual) deploy.

## File classification -- SEED-SPINE / SEED-INSTANCE / UNRULED

**Re-measured 2026-09-06 at `main` `5e77d77f`; CLOSED the same day at `cef3a063`.** A file is
classified when canon says whether it is **SEED-SPINE** (identical across every site at one
contract version) or **SEED-INSTANCE** (per client). Measured 2026-08-14 at `d719e03b`, **nine of
the seed's own files were neither** (15.3%), and the seed is the upstream floor under
`aismith-site`'s 103 of 170. One of the nine, `src/router.tsx`, was declared SEED-SPINE at
site-contract 1.8.19 and is in the gate's baseline via `EXTRA_SPINE`. The other eight are
classified below. **Nine of nine, and the UNRULED group is empty.**

**Four were classified here on 2026-09-06 because existing canon already decided them.** Each
restates an instruction that is already written down somewhere; none is a new rule.

| File | Class | The statement it follows |
|---|---|---|
| `vite.config.ts` | **SEED-INSTANCE** | `prompts/builds/site-build.md` instructs the builder to *update `vite.config.ts` `pages` to match* the client route set. A file canon tells a builder to edit cannot be identical across sites. |
| `netlify.toml` | **SEED-INSTANCE** | Per-site deploy configuration (site name, redirects, headers). Nothing shared claims it. |
| `.gitignore` | **SEED-INSTANCE** | Per-repo hygiene; a site adds its own ignores and no check reads it. |
| `backlog.md` | **SEED-INSTANCE** | This repo's own open work. A site forking it would inherit the seed's backlog, which is plainly wrong. |

**The remaining four were RULED SEED-INSTANCE by the operator on 2026-09-06.** They had been
left UNRULED deliberately rather than through oversight: each binds the whole fleet the moment
it is called, and PR #19 recorded the cost of both readings beside each file so the ruling would
be one line rather than a re-investigation. It was taken as one decision for all four.

| File | Class | The cost of the reading that was not taken |
|---|---|---|
| `package.json` | **SEED-INSTANCE** (ruled 2026-09-06) | SEED-SPINE would mean every site's dependency set is byte-identical to the seed's, so a site adding one dependency goes red on `[1b]`. A site MAY add a dependency; the seed's own pins remain the authored-against set and are asserted by `SCAFFOLD.md`, not by the gate. |
| `package-lock.json` | **SEED-INSTANCE** (ruled 2026-09-06) | Follows `package.json` and cannot be classified apart from it, so it takes the same class for the same reason. |
| `tsconfig.json` | **SEED-INSTANCE** (ruled 2026-09-06) | SEED-SPINE would freeze compiler settings a site cannot extend. The cost of this reading is real and is stated rather than hidden: a site that LOOSENS these settings breaks the spine silently rather than visibly, and nothing in the gate sees it. |
| `public/_headers` | **SEED-INSTANCE** (ruled 2026-09-06) | A security posture that arguably should be identical everywhere. Ruled per-site; making it identical fleet-wide is a separate act, not a record. |

**The gate's baseline moves by ZERO paths, and that is what "widen accordingly" comes to here.**
`agents/site/verify.mjs` covers **26 files** at this sha (every file under
`src/components/spine/`, `src/styles/spine.css`, and `src/router.tsx` via `EXTRA_SPINE`).
`EXTRA_SPINE` is the SEED-SPINE baseline and holds SEED-SPINE paths only. **All eight files
classified above are SEED-INSTANCE, so none of them is a baseline path** and the baseline stays
at 26. A SEED-INSTANCE ruling widens the baseline by zero by definition: putting a per-client
file in a byte-identity baseline would red every site that exercised the very per-client licence
the ruling grants, and would be **a gate enforcing a rule no document states**, which is exactly
what `EXTRA_SPINE`'s own comment forbids.

**Two documents disagree about where this classification belongs and the disagreement is open.**
The backlog row asks for it *in the seed's own canon*, which is this file. `verify.mjs`'s
`EXTRA_SPINE` comment says a path is added *only after canon declares it*, naming
`as-site-seed-spine.md`'s file manifest (site-contract 1.8.19) as that canon. Those are different
documents. This block is the seed-side half; the manifest is a stamped Factory file and is not
edited from here, and it carries a sentence -- *the four that remain unclassified are named in
the instance doc* -- that this ruling retires.

## Layout

## The gate's own harness, and the two operands it reads

`agents/site/verify.mjs` is the mechanical gate. `agents/site/verify.selftest.mjs` beside it is the
harness that can FAIL it: it generates a fixture site per case, mutates exactly one thing, and
asserts the finding. Run it bare, from the repo root, with no arguments and no network:

```
node agents/site/verify.selftest.mjs      # exit 0 = every case behaved as specified
```

It is bound in `.github/workflows/site-verify.yml` as its own step, so a change to `verify.mjs`
that silences a check fails the gate rather than passing it quietly. Its SCOPE is stated in its own
header and printed at the end of every run: it covers the checks added on 2026-09-18 and the `[8]`
fill-in branches, not the sections that predate them.

### The `lanes` block, which is what `[9]` reads

`[9] S8 PER-LANE RECORD` is **opt-in**: with no `--brief` it reports NOT ARMED and fails nothing.
Pass `--brief <file>` and it reads ONE fenced block out of that file and nothing else in it, the
same declare-then-enforce shape as `[5]`'s ```routes block. `as-site-intake-standard.md` S8 owns the
requirement; this is the grammar, stated here so a brief author has a source that is not the
checker:

````
```lanes
content: consumed=<what went in>; looked-for=<what it went looking for>
facts: consumed=...; looked-for=...
brand: consumed=...; looked-for=...
enrichment: consumed=...; looked-for=...
intent: consumed=none supplied; looked-for=scope and emphasis
```
````

- One line per lane, `<lane>: consumed=<...>; looked-for=<...>`. **Both halves are required**, and
  a lane that came back thin still owes a record saying so.
- The five lane names are S3's: `content`, `facts`, `brand`, `enrichment`, `intent`. A name S3 does
  not declare is read and reported, never scored.
- `#`-prefixed lines inside the block are ignored. Nothing OUTSIDE the block is read as a record.
- **The check cannot prove a lane was run**, and it says so in its own output. A lane that was never
  run and whose line was written anyway passes it. What it proves is that the record EXISTS and
  names every lane, which is the half a document cannot do.

### `--hue-N` grounds beyond `<Section hue>`

`[2]`'s composed-ground discovery reads a LIST of hue carriers, `HUE_CARRIERS` in `verify.mjs`, one
line per markup attribute that puts a `--hue-N` slot under something: `data-hue` (`<Section hue>`,
handled through the `[data-hue]` cascade) and `data-hue-bar` (`<TierCard hue>`, whose
`.tier-card .tier-ico` paints `var(--tier-ink, var(--on-dark))` on that ground, `--tier-ink` being
the slot's own `--hue-N-ink`, set by each `[data-hue-bar="N"]` block; `[2]` scores the icon through
that chain, so a skin that declares the hue and no ink is scored on its `--on-dark` fallback).
**Extend it by adding a line**, naming the component that renders the attribute and the
`spine.css` anchor that grounds it.
A `data-hue*` attribute that no entry names is reported as UNSCORED rather than silently skipped,
so the list decaying is a finding. The sweep reads the spine components, every attribute selector
in `spine.css` and the content and route markup, because a carrier need not have a component
(`data-hue-tint` has none by design). `HUE_FAMILIES` decays the same way: a family `spine.css` keys
on a hue number, by attribute or by class (`.x-hue-N`), that no entry matches is named, since its
slot count is otherwise unchecked.

Each entry also says whether the attribute's own block may ground what carries it (`grounds`).
`data-hue` does. `data-hue-bar` and `data-hue-tint` (R120, the declared way to borrow a hue as a
band or tint) are `grounds: false`: their blocks set one indirection property and nothing else, and
`[2]` FAILS such a block that sets `background`, `color` or any `--sec-*`, in the valued form
(`[data-hue-tint="3"]`) and the bare one (`[data-hue-tint]`). A slot a carrier composes is read from
a component's `hue` prop or from the attribute written on an element directly.

### What `[2]`, `[4]` and `[10]` gained on 2026-10-11 (brief W13 and its review fold)

Each one has a planted negative and a green control in `verify.selftest.mjs` (C7 to C12).

- **Form field edge, 3.0 (R121, WCAG 1.4.11).** The `.form-card input` border token, flattened over
  the field's own background, is scored against the field and against the card (`.form-card`'s
  background and every `[data-card-ground]` override). The `:focus` rule's border token is scored
  against the same grounds, because the rest rule sets `outline: none` and that border is the only
  focus indicator. Every operand is read out of `spine.css`.
- **Crumb inks, 4.5 (R122).** `SECTION_INK_RULES` lists the rules that paint text directly on the
  section ground (`.crumb`, `.crumb a`, `.crumb a:hover`). Each `color` is resolved as the cascade
  resolves it on every tone ground and every composed hue cell. Extend it by a line. On the
  **accent** ground (large display only by S2.3/S4.3, and a crumb is 12.5px text) the pairs are
  asserted when a `<Crumb>` is composed in an accent-tone Section, and otherwise printed with their
  ratios as an advisory line, never dropped.
- **The AA denominator** says how many DISTINCT ink/ground pairs the assertions cover, since a pair
  two labels reach is asserted twice.
- **Six hue slots (R112).** `HUE_SLOTS` is 6, and every family in `HUE_FAMILIES` (`[data-hue]`,
  `.em-hue-N`, `data-hue-bar`, `data-hue-tint`) must carry all six.
- **`[4]` the link-preview card (R221).** Where `site.config` declares `og.image`, the file it names
  under `public/` must exist, be under 300 KB, be 1200 x 630, and be what `og.type`, `og.width` and
  `og.height` say it is (read from its PNG or JPEG header). A card on another host is REVIEW. And
  `og.locale` must state the same language as the `<html lang>` `__root` hard-sets.
- **`[10]` PHONE MENU (R125).** The media block that hides the desktop `.nav` and draws `.nav-open`
  is found, and then every rule in the file whose selector ends at a `.nav-open` `.submenu` is read
  through the cascade (`!important`, specificity, source order), at the top level or in any block
  that can apply at phone width. Each `.submenu` must be static, shown, untransformed, indented under
  its parent, displayed, and neither collapsed to no height nor clipped.

### What `[2]`, `[5]` and `[11]` gained on 2026-10-11 (brief W14)

Each one has a planted negative and a green control in `verify.selftest.mjs` (C13 to C16).

- **Every skin block on its own (R110).** `tokens.css` admits a second skin as a selector ending in
  `:root`, written `[data-skin="x"]:root`. `[2]` read the whole file as one map, so the later block's
  values won and the other skin was never scored. Now the base is every `:root` block with no
  `data-skin`, and each skin is scored as its own map laid over the base, as the cascade lays it
  (the skin's selector outranks `:root`, wherever the blocks sit). A skin's lines carry its name, and
  only the lines that differ from the base pass are printed, then one line with the skin's own
  denominator. A colour the skin declares with a value `[2]` cannot read is dropped from its map and
  named, never scored at the base value.
- **Every declared hue slot, whatever N (R110).** The `--hue-N` / `--hue-N-ink` and `--hue-N-text`
  pairs are read from the slots the skin declares, not from a bound, and a pair is derived only where
  the map declares both its ink and its ground, so a slot with no `--hue-N-text` adds its ink pair
  alone. The AA denominator's `derived` count no longer carries inert pairs a slot cannot assert, and
  now counts the accent-ground pair.
- **Hue grounds through a component prop or an inline style (R063).** A component anywhere under
  `src/` whose body writes a destructured prop as its `background` (zuidgeluid-site's
  `<IlluStage sheet>`) composes a ground wherever the markup passes it a flat `var(--hue-N)`, and so
  does an inline `style={{ background: "var(--hue-N)" }}`. On that ground `[2]` scores the colour the
  component or the style declares and, for literal text inside the tag, the enclosing Section's ink.
  A gradient or `color-mix()` ground is named and not scored. The line also counts the
  `var(--hue-N)` references in the markup it did not place as a ground (fills, strokes, borders, or
  values routed through data), and the AA denominator says how many slots each route composed. The
  markup it reads is `src/content` and `src/routes`, and the line says so: every `var(--hue-N)` in a
  site's own markup elsewhere under `src/`, outside the spine, is counted by file as not read.
- **`[5]` reads route paths by TanStack Router's file convention (R111).** A directory and an
  unescaped `.` each end a segment (`takken.kapoenen.tsx` and `takken/kapoenen.tsx` are both
  `/takken/kapoenen`), `[x]` escapes, `index` and a final `route` are their parent's page, `_x`
  layouts and `(x)` groups are not in the URL, a trailing `_` is dropped, `.lazy` is its route's lazy
  half, and a `-` prefix is not a route. A file with no path of its own is named, not reconciled.
- **`[11]` BUILD OUTPUT (R109).** The prerender crawl writes every local link it follows as TEXT, so
  a linked `public/` binary was corrupted in `dist/` while the build reported success.
  `vite.config.ts` now sets `prerender.filter` to crawl plain page paths only (no `?`, `#` or file
  extension), and `[11]` fails a build where a `public/` file that a built page links with
  `<a href>` (the crawl's own rule) is not byte-identical in the directory `netlify.toml` publishes
  (`dist/client` where none is set). An unlinked file is not compared, since a build plugin may
  rewrite one on purpose (Nitro appends to `_headers`). A linked file with no copy at the same path
  is named and not compared: the crawl only writes, so that is the build's layout, not this defect.
  The seed's own `/website` page links `/og-card.png`, so `[11]` compares a real binary on every
  build here, and a build without the filter fails it. With no publish directory it has verified
  nothing: a warning locally, a failure under `--ci`. The gate workflow builds in the step before the
  gate, so CI always has one.

### What `[2]` gained on 2026-10-12 (brief S-NV U1, the nav item variant)

Each one has a planted negative and a green control in `verify.selftest.mjs` (C18).

- **The spotlight variant, declared then enforced (plan-nav-variant D7).** A nav item that carries
  `variant: "spotlight"` is IN USE when a prerendered page in the publish directory (the one reading
  `[11]` shares) has `data-variant="spotlight"` on an `<a>`. The build is the operand, not the
  source, so a variant set through a constant is seen. In use, every slot the spine's spotlight
  rules pair is required as an opaque colour and named when it is not; a pair with one slot declared
  FAILS as half-declared rather than being skipped; and the pairs are read out of `spine.css` and
  scored: the item's ink on its ground and the hot header's ink on its ground at 4.5, `--accent`
  (the logo's dot and the current-page bar, `HEADER_MARKS`) on the hot header's ground at 3.0, and,
  where a built page has the item as the current page (class `on` and the variant on one `<a>`),
  `--accent` on the item's own ground at 3.0 for the bar under it (`ITEM_MARKS`). A header mark is
  scored whether or not a built page renders it, and its label names only the marks the built header
  does render, so a site whose logo is an image is not told about a dot. They join the AA
  denominator only in use, the 3.0 pairs as `ACCENT_LARGE_PAIRS` does, so a site that sets no
  variant reads the same denominator as before. Not in use, declared slots are named and not
  asserted. With no built page it is NOT DECIDED: a warning locally, a failure under `--ci`.
- **The spine's own spotlight rules, held (the code review of #28).** Where a spine component writes
  `data-variant`, `[2]` FAILS unless the rules parse to both the item's pair and the header's, and
  selectors are joined with their whitespace taken out, so a reformat inside a `:has()` cannot drop
  the header's pair (F1). Where `spine.css` recolours the header's text from the item (D4), `[2]`
  FAILS unless a `transition: none` rule holds the same element list in a header that carries the
  item at rest as well as hot (D6, F3).

## Release history

Newest first. The controller stamps the version at merge; the seed carries no `.seed-version`.

### THE NEXT FREE MINOR AT MERGE (2026-10-12, brief S-NV U1: one declared per-item nav variant in the spine)

Two spine files move, `src/components/spine/chrome.tsx` and `src/styles/spine.css`. The Factory
re-embeds both with W13's `spine.css` at the next site-contract cut (plan job K1, plan-nav-variant
U2), and each site takes them at its resync. A site that sets no variant renders the markup it
rendered before.

- **`NavItem.variant`** (D1, D2) A top-level nav item may carry `variant: "spotlight"`, the one
  member tsc admits, and `SiteHeader` writes it as `data-variant` on the item's own `<a>`, as a leaf
  and as a dropdown parent.
- **The spotlight rules** (D3, D4, D6) On hover or keyboard focus the item takes
  `--nav-spotlight-ink` on `--nav-spotlight-bg`, at every width. On a desktop pointer the whole
  header takes `--nav-spotlight-header-bg`, and its logo, top-level links and member link
  `--nav-spotlight-header-ink`, through `:has()`, no script. A header that carries the item does not
  transition its text's colour. `--nav-spotlight-glow`, `--nav-spotlight-halo` and
  `--nav-spotlight-wash` are optional and default to none. No pulse and no scale (plan OA1).
- **`[2]` requires and scores them** (D5, D7) as the section above says.
- **The code review of #28, folded.** The header's pair is joined to its ground with whitespace
  taken out, and a spine that writes the variant must parse to both pairs (F1); the bar under the
  hot item is scored on the item's ground where it is the current page (F2, Q-A); D6 is checked
  against D4's list (F3); the IN USE note counts pairs as derived (F4); a header mark is named by
  what the built header renders (F5); and `[2]` and `[11]` share one reading of the publish
  directory (F6).

### THE NEXT FREE MINOR AT MERGE (2026-10-12, brief W-tier: the tier icon reads its slot's own ink)

One spine file moves, `src/styles/spine.css`. The Factory re-embeds this release at the next
site-contract cut after 1.8.31, whose number the controller sets at the stamp, and each site takes
it at its re-pin.

- **W-tier** (ruled 2026-10-12 by seat `controller-2026-10-11`, as `AISmithFactory/zuidgeluid-site`
  #57 recommends) Each `.tier-card[data-hue-bar="N"]` block also sets
  `--tier-ink: var(--hue-N-ink, var(--on-dark))`, and `.tier-card .tier-ico` paints
  `var(--tier-ink, var(--on-dark))` where it painted `--on-dark` on every slot. A skin that declares
  `--hue-N-ink` now carries that ink on the icon; one that declares the hue and no ink keeps
  `--on-dark`. `[2]`'s carrier scoring follows `--tier-ink` through the slot's own block, names the
  route in the pair's label, and reads the ground property from the slot itself (`var(--hue-N,` or
  `var(--hue-N)`), so an ink property set first is never taken for it. `verify.selftest.mjs` C17
  holds it: three plants that put `--on-dark` on a light hue go red, two controls stay green.
- **The code review of #26, folded.** A hue carrier slot the markup composes and `[2]` cannot score
  (its hue undeclared, or its block grounding on no `var(--hue-N)`) is named in a note rather than
  skipped with no line, and the note names an ink of the slot's own family the block still reads,
  painted on a ground no pair asserts (F2); this entry names the Factory re-embed (F1).

### THE NEXT FREE MINOR AT MERGE (2026-10-11, brief W14: the checker, skins and hue pairs, TanStack routes, the composed-hue resolver, the prerender filter)

No spine file moves. The Factory re-embeds this release at site-contract 1.8.31 (plan job K1) with
W13's, and each site takes it at its resync.

- **R110** `[2]` scores each `[data-skin="x"]:root` block as its own map over the base `:root`, and
  every `--hue-N` pair the skin declares, whatever N.
- **R111** `[5]` derives each route's path by TanStack Router's file convention, not its basename.
- **R063** `[2]` reaches hue grounds composed through a component prop or an inline style, beyond
  `<Section hue>` and `<TierCard hue>`, and its denominator says how many slots each route composed.
- **R109** (seed half) `vite.config.ts` crawls plain page paths only, and the new `[11]` fails a build
  whose published copy of a linked `public/` file differs from the source. Each site that sets
  `crawlLinks` takes the filter at its own resync.
- **The code review of #25, folded.** A hue pair is derived only where its ink and ground are
  declared (F1); `[11]` names a linked file with no copy rather than failing it (F2); the base
  pass's slot note names the map (F4); the R063 line states its markup scope (F5); and the seed's
  `/website` page links `/og-card.png`, the one instance change, so `[11]` has a live denominator (F6).

### THE NEXT FREE MINOR AT MERGE (2026-10-11, brief W13: the spine defects and the hue slots)

The Factory re-embeds this release at site-contract 1.8.31 (plan job K1), and each site takes it
at its resync, in that order.

- **R121** `.form-card` fields draw their edge in `--line-input` (falling back to `--text-soft`):
  3.72 against the field and 4.05 against the card on this skin, was 1.27 and 1.38 in `--line`.
- **R122** `.crumb a:hover` reads the crumb's own accent chain, `--accent-text` on the light tones
  (5.42 on `--bg`), where it painted `--accent` (3.81).
- **R123** The gallery lightbox takes `closeLabel`, `prevLabel` and `nextLabel` props, steps through
  the open category's photos by buttons and the arrow keys, and keeps focus inside the dialog.
- **R125** In the open phone menu each `.submenu` is static, shown and indented under its parent.
- **R112** Six hue slots in every hue-keyed family, and `hue` props typed 1 to 6.
- **R120** `data-hue-tint="N"` borrows a hue as a band or tint without grounding or setting inks.
- **R197** `ContactForm`'s honeypot defaults to `honeypot`, the key the `contact` function drops.
- **R221** (seed limb) The root head carries an absolute `og:image` with its type, width, height and
  alt, plus `og:locale` and `twitter:card`, filled from `og` in `site.config`; a placeholder
  `public/og-card.png` says on its face that it is one. `<html lang>` is `en-GB`, the language
  `og:locale` `en_GB` states.
- **The review fold of this release.** `[2]` scores the focused field edge (3.81, 4.15 and 3.19 on
  this skin), the crumb inks on the accent ground (3.81 and 3.09, asserted once a crumb sits
  there), the bare `[data-hue-tint]` form, and carriers and hue families that only `spine.css` or the
  markup carries; its denominator names distinct pairs (16 of 26 assertions). `[4]` checks the
  link-preview card against its bytes and `og:locale` against `lang`. `[10]` reads the cascade
  across the file and asserts display, height and overflow.

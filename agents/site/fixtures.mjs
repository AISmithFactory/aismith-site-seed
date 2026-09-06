#!/usr/bin/env node
// fixtures.mjs -- the negative controls for agents/site/verify.mjs. Zero dependencies.
//
// WHY THIS FILE EXISTS. Every check added to verify.mjs on 2026-09-06 was added because an
// EXISTING check could not fail on a real defect: an rgba token silently outside the
// checked set, a hue cell scored against inks the hue block replaces, a workflow fill-in
// nobody ever filled in. "A check that cannot fail also cannot find" is the lesson those
// three share, so a check landing without a fixture that FIRES on the shape it was written
// for would repeat it. Each case below is a PAIR: one tree where the check must fire and
// one where it must stay silent.
//
// It asserts on the REPORTED LINE rather than only on the exit code, deliberately. An exit
// code cannot distinguish "the planted defect was caught" from "something else was wrong
// with the fixture tree", and a fixture that passes for the wrong reason is the failure
// mode this file exists to prevent.
//
// Run: node agents/site/fixtures.mjs      (exit 0 = every case behaves as declared)
// Not invoked by .github/workflows/site-verify.yml, which is a stamped template this repo
// does not author. Wiring it in is the Factory's call and is flagged, not assumed.

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const VERIFY = join(dirname(fileURLToPath(import.meta.url)), "verify.mjs");
let failures = 0, cases = 0;

// ---- a minimal tree that verify.mjs can walk. Only the parts a case varies are arguments;
// everything else is fixed so a case's result is attributable to what it changed.
const MADE = [];   // removed at exit: this sandbox is shared and has run under 400 MB free
function tree(files) {
  const root = mkdtempSync(join(tmpdir(), "site-fixture-"));
  MADE.push(root);
  const base = {
    "src/components/spine/index.ts": "export {};\n",
    "src/content/site.config.tsx": `export const seo = { noindex: false };\nexport const brandMark = { kind: "wordmark" };\n`,
    "src/routes/__root.tsx": `const Logo = <svg><path d="M0 0" /></svg>;\nexport default function R(){return <html lang="en">{seo.noindex}<Header logo={Logo} /></html>;}\n`,
    "src/routes/index.tsx": `export const Route = { head: () => ({ title: "Home" }) };\n`,
    "public/sitemap.xml": "<urlset></urlset>\n",
    "public/robots.txt": "User-agent: *\n",
  };
  for (const [p, body] of Object.entries({ ...base, ...files })) {
    const full = join(root, p);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, body);
  }
  return root;
}

function run(root, extra = []) {
  try { return execFileSync("node", [VERIFY, root, ...extra], { encoding: "utf8" }); }
  catch (e) { return (e.stdout || "") + (e.stderr || ""); }   // exit 1 is expected in most cases
}

// `expect` is a SUBSTRING that must appear; `forbid` must not. Both are checked, because a
// case that only asserts presence cannot tell a fired check from a noisy one.
function check(name, out, { expect = [], forbid = [] }) {
  cases++;
  const missing = expect.filter((s) => !out.includes(s));
  const present = forbid.filter((s) => out.includes(s));
  if (missing.length || present.length) {
    failures++;
    console.log(`FAIL  ${name}`);
    for (const s of missing) console.log(`        expected and ABSENT : ${s}`);
    for (const s of present) console.log(`        forbidden and PRESENT: ${s}`);
  } else console.log(`ok    ${name}`);
}

const TONE_MAP = `
[data-tone="paper"] { --sec-bg: var(--bg); --sec-text: var(--text); --sec-soft: var(--text-soft);
  --tone-bg: var(--bg); --tone-text: var(--text); --tone-soft: var(--text-soft); --tone-accent: var(--accent-text); }
[data-tone="dark"] { --sec-bg: var(--dark); --sec-text: var(--on-dark); --sec-soft: var(--on-dark-soft);
  --tone-bg: var(--dark); --tone-text: var(--on-dark); --tone-soft: var(--on-dark-soft); --tone-accent: var(--accent-on-dark); }
`;
const HUE_MAP = `
[data-hue="3"] { --sec-accent: var(--hue-3-accent, var(--tone-accent)); --sec-bg: var(--hue-3, var(--tone-bg)); --sec-text: var(--hue-3-ink, var(--tone-text)); --sec-soft: var(--hue-3-soft, var(--hue-3-ink, var(--tone-soft))); }
`;

// =====================================================================================
// 1. rgba() TOKENS -- the class that was silently outside the checked set.
// =====================================================================================
// NEGATIVE: an rgba ink that FAILS on its ground must be caught. Before the flatten this
// pair was skipped by `if (!T[fg]) continue` and the run printed a clean matrix.
check("rgba ink FAILING on its ground is caught (was silently skipped)",
  run(tree({
    "src/styles/tokens.css": `:root { --bg:#FFFFFF; --text:#000000; --text-soft:#555555;
      --accent-text:#9E4E1E; --accent-on-dark:#E0915F; --dark:#1E1D1B;
      --on-dark:#F8F5EF; --on-dark-soft: rgba(248, 245, 239, .12); }`,
    "src/styles/spine.css": TONE_MAP,
  })),
  { expect: ["--on-dark-soft on --dark", "rgba flattened over the ground", "(< 4.5 normal)"] });

// POSITIVE: the same token at an alpha that CLEARS must pass, and must say it was flattened
// rather than quietly counted as opaque.
check("rgba ink CLEARING on its ground passes and names the flatten",
  run(tree({
    "src/styles/tokens.css": `:root { --bg:#FFFFFF; --text:#000000; --text-soft:#555555;
      --accent-text:#9E4E1E; --accent-on-dark:#E0915F; --dark:#1E1D1B;
      --on-dark:#F8F5EF; --on-dark-soft: rgba(248, 245, 239, .82); }`,
    "src/styles/spine.css": TONE_MAP,
  })),
  { expect: ["--on-dark-soft on --dark", "rgba flattened over the ground"],
    forbid: ["--on-dark-soft on --dark (rgba flattened over the ground -> #d1cec9) = 10.73 (< 4.5 normal)"] });

// NEGATIVE: 8-digit #RRGGBBAA. The old parser read it as opaque and DISCARDED the alpha,
// asserting a ratio against a colour the browser never paints. A near-transparent ink on
// its own ground must now fail.
check("8-digit #RRGGBBAA honours its alpha instead of asserting an opaque ratio",
  run(tree({
    "src/styles/tokens.css": `:root { --bg:#FFFFFF; --text:#000000; --text-soft:#555555;
      --accent-text:#9E4E1E; --accent-on-dark:#E0915F; --dark:#1E1D1B;
      --on-dark:#F8F5EF; --on-dark-soft: #F8F5EF1A; }`,
    "src/styles/spine.css": TONE_MAP,
  })),
  { expect: ["--on-dark-soft on --dark", "(< 4.5 normal)"] });

// POSITIVE: a translucent GROUND is not guessed at, it is NAMED as unresolvable.
check("translucent GROUND is reported by name, never guessed",
  run(tree({
    "src/styles/tokens.css": `:root { --bg:#FFFFFF; --text:#000000; --text-soft:#555555;
      --accent-text:#9E4E1E; --accent-on-dark:#E0915F; --dark: rgba(30, 29, 27, .4);
      --on-dark:#F8F5EF; --on-dark-soft:#EEEEEE; }`,
    "src/styles/spine.css": TONE_MAP,
  })),
  { expect: ["could NOT resolve, by name", "--dark (translucent GROUND"] });

// =====================================================================================
// 2. THE HUE CELL -- the fixture that FIRES ON THE TONE-TOKEN SHAPE.
// =====================================================================================
// This is the M6 PLANT, reproduced: tone="dark" on hue={3}, where the TONE's main text
// token (--on-dark) would score 2.06 on --hue-3 but [data-hue="3"] has already replaced
// --sec-text with --hue-3-ink. The old loop derived the cell's inks from the tone and
// reddened a pair the browser does not paint. It must NOT be reported now.
const PLANT_TOKENS = `:root { --bg:#FFFFFF; --text:#000000; --text-soft:#555555;
  --accent-text:#9E4E1E; --accent-on-dark:#E0915F; --dark:#1E1D1B;
  --on-dark:#F8F5EF; --on-dark-soft:#DDDDDD;
  --hue-3:#C9C2B4; --hue-3-ink:#1E1D1B; --hue-3-accent:#5A3A1A; }`;
const PLANT_PAGE = `export default () => <Section tone="dark" hue={3}><p>x</p></Section>;\n`;
check("hue cell does NOT assert a tone token the hue block replaces (the M6 plant)",
  run(tree({ "src/styles/tokens.css": PLANT_TOKENS, "src/styles/spine.css": TONE_MAP + HUE_MAP,
             "src/content/home.tsx": PLANT_PAGE })),
  { expect: ["--hue-3-ink on --hue-3"],
    forbid: ["--on-dark on --hue-3"] });

// REGRESSION GUARD, not a control: the hue's OWN ink failing on its OWN ground was caught
// before this change and must still be. Without it, "stop asserting the tone token" would be
// indistinguishable from "stop asserting". It passes against the pre-change gate BY DESIGN.
check("hue cell DOES assert the hue block's own ink and fails it when it should",
  run(tree({
    "src/styles/tokens.css": PLANT_TOKENS.replace("--hue-3-ink:#1E1D1B", "--hue-3-ink:#BEB7A9"),
    "src/styles/spine.css": TONE_MAP + HUE_MAP, "src/content/home.tsx": PLANT_PAGE })),
  { expect: ["--hue-3-ink on --hue-3", "(< 4.5 normal)"] });

// =====================================================================================
// 3. TONE-KEYED SELECTORS -- an ink a component sets regardless of the ground.
// =====================================================================================
// NEGATIVE: `.eyebrow` keyed on [data-tone="dark"] renders --accent-on-dark on the HUE
// ground. A model that derives the ink from the tone cannot see this cell at all. It must
// be caught AND named by selector, because "an ink fails" sends a reader to the skin when
// the answer is in one selector.
check("tone-keyed selector ink is checked on the hue ground and named by selector",
  run(tree({
    "src/styles/tokens.css": PLANT_TOKENS,
    "src/styles/spine.css": TONE_MAP + HUE_MAP + `\n[data-tone="dark"] .eyebrow { color: var(--accent-on-dark); }\n`,
    "src/content/home.tsx": PLANT_PAGE })),
  { expect: ['--accent-on-dark on --hue-3', '[data-tone="dark"] .eyebrow on hue 3', "(< 4.5 normal)"] });

// REGRESSION GUARD, not a control: a selector reading --sec-* FOLLOWS the hue and is not a
// divergence. Widening the set to those would key card ink to the section and regress live
// sites -- `.info-card .v` inside a dark Section goes from 7.11 to 1.07. It passes against
// the pre-change gate too, which had no divergence concept at all.
check("selector reading --sec-* is not counted as a divergence",
  run(tree({
    "src/styles/tokens.css": PLANT_TOKENS,
    "src/styles/spine.css": TONE_MAP + HUE_MAP + `\n[data-tone="dark"] .lbl { color: var(--sec-soft); }\n`,
    "src/content/home.tsx": PLANT_PAGE })),
  { forbid: ['[data-tone="dark"] .lbl on hue 3'] });

// =====================================================================================
// 4. INSTANTIATION -- the workflow fill-ins (the cafe-josee case).
// =====================================================================================
const SITE = {
  "src/styles/tokens.css": `:root { --bg:#FFFFFF; --text:#000000; --text-soft:#555555;
    --accent-text:#9E4E1E; --accent-on-dark:#E0915F; --dark:#1E1D1B; --on-dark:#F8F5EF; --on-dark-soft:#DDDDDD; }`,
  "src/styles/spine.css": TONE_MAP,
};
const wf = (seedRef, charter) => `name: site-verify\nenv:\n  SEED_REPO: AISmithFactory/aismith-site-seed\n  SEED_REF: ${seedRef}\n  CHARTER: "${charter}"\n`;

// NEGATIVE: the seed's own moving ref, inherited verbatim by a site.
check("unreplaced SEED_REF: main fails and NAMES the field",
  run(tree({ ...SITE, ".github/workflows/site-verify.yml": wf("main", "x-site-charter.md"),
             "x-site-charter.md": "```routes\n/\n```\n" })),
  { expect: ["field SEED_REF", "NOT a full 40-character sha", "UNREPLACED"] });

// NEGATIVE: an abbreviated sha, which fails actions/checkout for a different reason.
check("abbreviated SEED_REF fails and says why actions/checkout rejects it",
  run(tree({ ...SITE, ".github/workflows/site-verify.yml": wf("045e7216", "x-site-charter.md"),
             "x-site-charter.md": "```routes\n/\n```\n" })),
  { expect: ["field SEED_REF", "abbreviated sha"] });

// POSITIVE: a properly instantiated site passes both fields.
check("instantiated SEED_REF + existing CHARTER pass",
  run(tree({ ...SITE, ".github/workflows/site-verify.yml": wf("045e7216c0ffee0123456789abcdef0123456789", "x-site-charter.md"),
             "x-site-charter.md": "```routes\n/\n```\n" })),
  { expect: ["SEED_REF is a full 40-character sha", "field CHARTER names a file that exists"],
    forbid: ["field SEED_REF is"] });

// NEGATIVE: the cafe-josee case itself -- CHARTER set to the seed's value, file absent.
check("CHARTER naming a non-existent file fails and NAMES the field",
  run(tree({ ...SITE, ".github/workflows/site-verify.yml": wf("045e7216c0ffee0123456789abcdef0123456789", "aismith-site-charter.md") })),
  { expect: ["field CHARTER names", "no such file exists in this repo", "carried over unreplaced"] });

// NEGATIVE: no gate workflow at all is not a clean bill of health.
check("a repo with no gate workflow says so rather than passing silently",
  run(tree(SITE)),
  { expect: ["no gate workflow found"] });

// NEGATIVE: an obvious placeholder left in any field.
check("an unreplaced placeholder field is caught",
  run(tree({ ...SITE, ".github/workflows/site-verify.yml":
    `name: site-verify\nenv:\n  SEED_REPO: AISmithFactory/aismith-site-seed\n  SEED_REF: 045e7216c0ffee0123456789abcdef0123456789\n  SITE_SLUG: <slug>\n` })),
  { expect: ["unreplaced placeholder field(s)", "SITE_SLUG"] });

// =====================================================================================
// 5. ABSENT vs MISSING charter -- the two messages must differ.
// =====================================================================================
check("--charter absent and --charter missing report DIFFERENTLY",
  run(tree(SITE)) + "\n@@@\n" + run(tree(SITE), ["--charter", "nope-charter.md"]),
  { expect: ["no --charter argument supplied at all", "was supplied but no such file exists",
             "this is a MISSING charter, not an absent argument"] });

for (const d of MADE) { try { rmSync(d, { recursive: true, force: true }); } catch { /* best effort */ } }

// THE CONTROL ON THIS FILE ITSELF, run 2026-09-06 before the branch was pushed: with
// agents/site/verify.mjs reverted to `main` and this file unchanged, THIRTEEN of the
// fifteen cases FAIL. The two that pass are marked REGRESSION GUARD above and are not
// controls -- they assert behaviour that already held and must survive, which is a
// different job and is worth having, but a reader who counted them as controls would be
// counting two checks that cannot fail among thirteen that can.
console.log(`\n${cases - failures}/${cases} fixture case(s) behaved as declared`);
process.exitCode = failures ? 1 : 0;

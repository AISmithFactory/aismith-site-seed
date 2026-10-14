#!/usr/bin/env node
// verify.selftest.mjs -- the negative cases for verify.mjs.
//
// WHY THIS FILE EXISTS. verify.mjs had NO self-test at all: every assertion in it was shown only
// to stay silent on a tree somebody believed was clean, and a checker shown only to stay silent is
// not a checker. This repo has folded that lesson over other instruments more than once. The run
// that wrote this file added three checks to verify.mjs, so it adds the harness that can fail them.
//
// SCOPE, stated because the name overstates it. It covers THE CHECKS THAT RUN ADDED -- the row 107
// SEED_REPO provenance assertion, the row 046 hue-carrier grounds, and the row 098 [9] per-lane
// record -- plus the [8] INSTANTIATION branches attacker-2 measured as uncovered, plus one control.
// It does NOT cover the sections that predate them; extending it to those is real work and is not
// commissioned by the brief that wrote this file. An unstated scope is how every miscount in this
// repo has happened, so the count is printed at the end.
//
// EXTENDED 2026-10-11 (brief W13) by the checks THAT run added, each with a planted negative that
// goes red and a green control: C7 the form field edge at 3.0 (R121), C8 the crumb inks on every
// crumb ground (R122), C9 six hue slots in every hue-keyed family (R112), C10 the non-grounding hue
// carriers and the raw data-hue-tint attribute (R120), C11 the [10] open phone menu (R125). The
// sections that predate both runs are still NOT covered.
//
// FOLDED the same day from the code review of PR #24, each finding with its own plant and control:
// C7 the FOCUSED field edge (F2); C8 the crumb inks on the ACCENT ground, held where no crumb is
// composed there and asserted where one is (F1); C10 the bare [data-hue-tint] form the guard could
// not read (F3), and the carrier and family sweeps reading CSS-only, markup-only and class-keyed
// forms (F7); C11 [10] reading every rule in the file through the cascade, and the display, height
// and overflow it never asserted (F4); C12 the link-preview card against its own bytes (F6) and
// og:locale against <html lang> (F9), both in [4].
//
// EXTENDED 2026-10-11 (brief W14) by the checks THAT run added, each with a planted negative and a
// green control: C13 each [data-skin] block scored as its own map and every declared --hue-N whatever
// N (R110), C14 [5] route paths by TanStack Router's file convention (R111), C15 hue grounds composed
// through a component prop or an inline style (R063), C16 [11] a linked public/ file against the
// published build (R109). Run against the verify.mjs of main before that run, 33 of these 35
// assertions FAIL; the two that hold there are marked REGRESSION GUARD.
//
// FOLDED the same day from the code review of PR #25, each finding with its own plant and control:
// C13 a hue pair derived only where the map declares its ink and its ground (F1), and the base
// pass's slot note naming the map rather than a skin (F4); C15 the R063 line stating its markup
// scope and counting var(--hue-N) outside it by file (F5); C16 a linked file with no copy at the
// same path named and not failed, beside a rewrite that still fails (F2). Run against #25's head
// before the fold, 7 of these 9 assertions FAIL; the two that hold there are marked REGRESSION GUARD.
//
// EXTENDED 2026-10-12 (brief W-tier) by the check THAT run changed: C17 the tier icon scored in its
// slot's own ink through --tier-ink, with three plants that make the icon fall back to --on-dark on
// a light hue and two green controls. The base fixture's spine takes the shipped --tier-ink shape,
// so C3's --hue-3 cell is now the --on-dark FALLBACK (the tokens declare no --hue-3-ink). Run
// against the verify.mjs of main before that run, 5 assertions FAIL: four of C17's six and C3's
// first, which main leaves unscored because it read --tier-ink as an undeclared token, inert. The
// two of C17's that hold there are marked REGRESSION GUARD.
//
// FOLDED the same day from the code review of PR #26 (F2): a hue carrier slot the markup composes
// and [2] cannot score is NAMED in a note rather than skipped with no line. C3's undeclared slot is
// named (its no-pair assertion now reads every line but that note), and C17 gains two plants, the
// ink declared with no hue and a block grounding on no var(--hue-N), beside a green control naming
// nothing. Run against #26's head before the fold, 3 of these 4 assertions FAIL; the control that
// holds there is marked REGRESSION GUARD.
//
// EXTENDED 2026-10-12 (brief S-VC-U1, row R055) by the arm THAT run built: C18 [3]'s superlative
// check by declared register, an en arm (morphology plus a closed stop-list of eight), an nl arm (a
// list, aller...ste and meest plus an adjective) and a hype list, over the copy a TypeScript parse
// extracts. A PLANT surfaces as a candidate in the [3] REVIEW line, a GREEN CONTROL reads PASS, the
// NEGATIVE CONTROL is a mutant of verify.mjs with arm selection removed, and the em-dash half that
// run did not touch gains three REGRESSION GUARDs, main holding no case for it. Run against the
// verify.mjs of main before that run, 31 of these 41 assertions FAIL; the 10 that hold there are the
// four GREEN CONTROLs, three silent-side checks (no register REVIEW under en-GB, no [3] FAIL under
// --ci, nothing reported on `=> ... <T>`) and the three REGRESSION GUARDs. The three assertions that
// need the parse are named NOT RUN where `typescript` is not installed, and fail under CI.
//
// FOLDED the same day from the code review of PR #27, each finding with its own plant or control:
// C18 a string-literal type dropped from copy while a call argument stays copy (F1), with a mutant
// that lacks the skip; a `typescript` in a directory above the site's root not borrowed (F3); the
// three copies of the <html lang> expression held byte-identical, with a negative control on an
// edited copy (F5); the syntax errors the parser recovered from named in a note (F6); a missing
// lang read as missing (F7); and each arm's own example greeting, which that arm reports (F8). Run
// against #27's head before the fold, 7 of these 15 assertions FAIL; the 8 that hold there are the
// clean-tree control, the F1 mutant (that head had no skip to remove, and the mutant's anchor
// assertion is one of the 7), the F5 pair, the recovered copy still read, the nl example (the old
// message already named it) and the two greetings firing their arms. Six of the 15 need a
// `typescript` and are named NOT RUN without one, as the three above are.
//
// EXTENDED 2026-10-13 (brief siteseed-emdash, the Factory backlog row on the site seed's em-dash gate)
// by the half THAT run widened: C19 [3]'s em-dash half reads every form, not four. Thirteen PLANTs,
// one form each, FAIL and name their form: a decimal entity with a leading zero and a hex one with
// several, three entities with no semicolon (decimal, hex and named), the five lookalikes U+2015,
// U+2E3A, U+2E3B, U+FE31 and U+FE58 literal, and three of their entity forms (named, decimal and hex).
// A fourteenth holds the count and the forms over one file holding three. Three GREEN CONTROLs pass: an
// en dash, a hyphen and the en dash's entities; a number that only begins with the em dash's digits
// and an escaped &amp;mdash;; and a lookalike and an entity in comments. Run against the verify.mjs
// of main before that run, 14 of these 17 assertions FAIL, every PLANT reading PASS "no em-dashes"
// there; the three that hold are the GREEN CONTROLs.
//
// EXTENDED 2026-10-14 (brief siteseed-voice-json, Factory backlog row 1897) by the corpus THAT run
// widened: C20 [3] reads the string values of src/content/*.json as copy, in both halves. Six PLANTs,
// each a string that exists only in JSON, go red: a superlative and a value at depth surface in the
// REVIEW line, a literal em-dash and its JSON escape FAIL naming the file, a superlative fires with no
// typescript installed, and one in a file that does not parse fires beside the note naming it. Two
// GREEN CONTROLs: a clean JSON file passes both halves with its keys silent, and a site with no JSON
// is counted at zero. A SCOPE GUARD holds a JSON file below the top level out, and the NEGATIVE
// CONTROL is a mutant with the JSON list emptied, under which both plants read PASS. Run against the
// verify.mjs of main before that run, 13 of these 17 assertions FAIL; the four that hold are the
// clean file's two PASS verdicts and the two NEGATIVE CONTROL reads, main having no JSON read to remove.
//
// PORTED FROM the closed Factory PR #1017 (branch chat/2026-09-18-site-verify) and ADAPTED, not
// copied: that harness was written against the Factory working copy of verify.mjs, which is a
// generation behind this one. Where the seed's copy makes a different finding in the same branch,
// the assertion states the SEED's finding, because the seed copy is the ship source. Two of #1017's
// cases assert behaviour this run did not implement and are NOT ported; they are named in the PR
// body rather than left as commented-out code here.
//
// THE FIXTURES ARE GENERATED FROM ONE BASE AND EACH CASE IS ONE MUTATION, deliberately. A site
// fixture is ten files; ten directories of ten files each, shipped as bytes, is a tree nobody
// re-reads and the mutation stops being visible. Each case below states its mutation as a field,
// so the diff between the positive control and the negative case is the thing the reader sees.
//
// Writes and cleanup stay inside ONE mkdtemp directory that this process owns, and the guard on it
// is fatal: an unguarded scratch path is how a self-test in this repo wrote its fixture to the
// REPO ROOT and then reported a shell verdict for a full disk.
//
// Usage: node agents/site/verify.selftest.mjs
//   exit 0 = every case behaved as specified | exit 1 = a case did not

import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, symlinkSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const VERIFY = join(HERE, "verify.mjs");

const ROOT = mkdtempSync(join(tmpdir(), "verify-selftest-"));
if (!ROOT || ROOT.length < 8 || !ROOT.startsWith(tmpdir())) {
  console.error("SELF-TEST ENVIRONMENT FAIL: mkdtemp did not return a usable scratch directory.");
  console.error("This is an ENVIRONMENT verdict and not a verdict about verify.mjs. Nothing was written.");
  process.exit(2);
}

const CANON_SEED = "AISmithFactory/aismith-site-seed";
const SHA40 = "0".repeat(40);
// This repo's own `typescript` (a devDependency, installed by `npm ci`), lent to the C18 fixtures
// that exercise [3]'s parse. null where it is not installed: C18 says which assertions it could
// not run, and under CI that is a failure, since the workflow runs `npm ci` before this harness.
const TS_DIR = existsSync(join(HERE, "..", "..", "node_modules", "typescript", "package.json"))
  ? join(HERE, "..", "..", "node_modules", "typescript") : null;

// ---- the base fixture ------------------------------------------------------------------------
// A minimal site that is quiet on the checks this harness scores. Every negative case below is
// this tree plus exactly one stated mutation.
//
// --on-dark (#ffffff) on --hue-3 (#8a8a8a) is 3.45, which is BELOW 4.5: that is the cell the
// hue-carrier case needs, and it is the cell the tone-keyed and [data-hue] paths cannot reach.
// --hue-3 declares no ink, so the tier icon's --tier-ink falls back to --on-dark there; --hue-1 is a
// light hue that declares one, which is the cell C17 needs.
const TOKENS = `:root {
  --bg: #ffffff;
  --bg-alt: #f2f2f2;
  --surface: #ffffff;
  --dark: #111111;
  --dark-alt: #1f2933;
  --text: #111111;
  --text-soft: #595959;
  --accent: #b34700;
  --accent-text: #8a3600;
  --on-dark: #ffffff;
  --on-dark-soft: #d0d0d0;
  --accent-on-dark: #ffb380;
  --hue-1: #e6f0ff;
  --hue-1-ink: #143a6b;
  --hue-3: #8a8a8a;
}
`;
// A real spine: [data-tone] blocks (the tone map is DERIVED from these and an empty parse is a
// hard fail), [data-hue] blocks with their own fallback chains, and the tier-card rules that make
// data-hue-bar a GROUND -- the ::before bar carries no text and must not be scored, the .tier-ico
// circle carries an ink and must be.
const SPINE_CSS = `[data-tone="paper"] { --sec-bg: var(--bg); --sec-text: var(--text); --sec-soft: var(--text-soft); --tone-accent: var(--accent-text); }
[data-tone="alt"] { --sec-bg: var(--bg-alt); --sec-text: var(--text); --sec-soft: var(--text-soft); --tone-accent: var(--accent-text); }
[data-tone="dark"] { --sec-bg: var(--dark); --sec-text: var(--on-dark); --sec-soft: var(--on-dark-soft); --tone-accent: var(--accent-on-dark); }
[data-hue="1"] { --sec-bg: var(--hue-1, var(--tone-bg)); --sec-text: var(--hue-1-ink, var(--tone-text)); --sec-soft: var(--hue-1-soft, var(--hue-1-ink, var(--tone-soft))); }
[data-hue="3"] { --sec-bg: var(--hue-3, var(--tone-bg)); --sec-text: var(--hue-3-ink, var(--tone-text)); --sec-soft: var(--hue-3-soft, var(--hue-3-ink, var(--tone-soft))); }
.tier-card::before { content: ""; height: 6px; background: var(--tier-bar, var(--accent)); }
.tier-card[data-hue-bar="1"] { --tier-bar: var(--hue-1, var(--accent)); --tier-ink: var(--hue-1-ink, var(--on-dark)); }
.tier-card[data-hue-bar="3"] { --tier-bar: var(--hue-3, var(--accent)); --tier-ink: var(--hue-3-ink, var(--on-dark)); }
.tier-card .tier-ico { width: 46px; height: 46px; background: var(--tier-bar, var(--accent)); color: var(--tier-ink, var(--on-dark)); }
` +
// The six-slot families [2] requires (R112), generated one line per slot so a case can drop a slot
// by line: the remaining [data-hue] and data-hue-bar slots, then .em-hue-N and data-hue-tint 1-6.
[2, 4, 5, 6].map((n) =>
  `[data-hue="${n}"] { --sec-bg: var(--hue-${n}, var(--tone-bg)); --sec-text: var(--hue-${n}-ink, var(--tone-text)); --sec-soft: var(--hue-${n}-soft, var(--hue-${n}-ink, var(--tone-soft))); }\n` +
  `.tier-card[data-hue-bar="${n}"] { --tier-bar: var(--hue-${n}, var(--accent)); --tier-ink: var(--hue-${n}-ink, var(--on-dark)); }\n`).join("") +
[1, 2, 3, 4, 5, 6].map((n) =>
  `.em-hue-${n} { color: var(--hue-${n}-text, currentColor); }\n` +
  `[data-hue-tint="${n}"] { --hue-tint: var(--hue-${n}, var(--accent)); }\n`).join("") +
// The field edge (R121), the crumb rules (R122) and the open phone menu (R125), in the shipped
// spine's shape. The tokens declare no --line-input, so the edge falls back to --text-soft.
`.form-card { background: var(--card-bg, var(--surface)); }
.form-card input, .form-card textarea, .form-card select { background: var(--bg); border: 2px solid var(--line-input, var(--text-soft)); }
.form-card input:focus, .form-card textarea:focus, .form-card select:focus { border-color: var(--accent); }
.crumb { color: var(--sec-accent, var(--tone-accent, var(--accent-text))); }
.crumb a { color: var(--sec-soft, var(--tone-soft, var(--text-soft))); }
.crumb a:hover { color: var(--sec-accent, var(--tone-accent, var(--accent-text))); }
.submenu { position: absolute; opacity: 0; visibility: hidden; transform: translateX(-50%); }
@media (max-width: 900px) {
  .nav { display: none; }
  .header.nav-open .nav { display: flex; }
  .header.nav-open .nav .submenu { position: static; opacity: 1; visibility: visible; transform: none; padding: 0 0 0 18px; }
}
`;
const SPINE_TSX = `export function Section({ tone = "paper", hue, children }) {
  return <section data-tone={tone} data-hue={hue}>{children}</section>;
}
export function TierCard({ hue, children }) {
  return <div className="tier-card" data-hue-bar={hue}><span className="tier-ico" />{children}</div>;
}
`;
const CONFIG = `export const seo = { noindex: false };
export const brandMark = { kind: "wordmark" };
`;
const ROOT_TSX = `import Logo from "./logo.svg";
export const Root = () => (
  <html lang="en">
    <SiteHeader logo={<Logo />} />
    {seo.noindex ? null : null}
  </html>
);
`;
const INDEX_TSX = `export const Route = { head: () => ({ title: "Home" }) };
export const Page = () => <Section tone="paper">body</Section>;
`;
const CHARTER = "# charter\n\n```routes\n/\n```\n";
// The workflow fields are the operands [8] reads. `null` for a field DROPS the line, which is the
// absent-key branch, and `""` keeps the key with an empty value.
const WORKFLOW = ({ seedRepo = CANON_SEED, seedRef = SHA40, charter = "demo-site-charter.md" } = {}) =>
  "name: site-verify\nenv:\n" +
  (seedRepo === null ? "" : `  SEED_REPO: ${seedRepo}\n`) +
  (seedRef === null ? "" : `  SEED_REF: ${seedRef}\n`) +
  (charter === null ? "" : `  CHARTER: ${charter}\n`) +
  "jobs: {}\n";
const BRIEF = (lanes) => "# brief\n\n```lanes\n" + lanes.join("\n") + "\n```\n";
const FULL_LANES = [
  "content: consumed=the org's own site; looked-for=offer and full page inventory",
  "facts: consumed=the GBP/Places record; looked-for=name, address, phone, hours",
  "brand: consumed=a render of the homepage; looked-for=colour, type, layout, the mark",
  "enrichment: consumed=the org's name and place; looked-for=founder story and history",
  "intent: consumed=none supplied; looked-for=scope and emphasis",
];

let caseNo = 0;
function build(name, mut = {}) {
  const dir = join(ROOT, `${String(++caseNo).padStart(2, "0")}-${name}`);
  const site = join(dir, "site");
  const seed = join(dir, "seed");
  const put = (base, rel, body) => {
    const p = join(base, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, body);
  };
  // The spine layer is byte-identical in both trees, so [1b] is quiet and every finding below is
  // about the mutation rather than about the spine.
  for (const base of [site, seed]) {
    put(base, "src/styles/spine.css", mut.spineCss ?? SPINE_CSS);
    put(base, "src/components/spine/index.tsx", SPINE_TSX);
  }
  put(site, "src/styles/tokens.css", mut.tokens ?? TOKENS);
  put(site, "src/content/site.config.tsx", mut.config ?? CONFIG);
  put(site, "src/routes/__root.tsx", mut.rootTsx ?? ROOT_TSX);
  for (const [rel, body] of Object.entries(mut.files || {})) put(site, rel, body);
  put(site, "src/routes/index.tsx", mut.indexTsx ?? INDEX_TSX);
  put(site, "public/sitemap.xml", "<urlset/>\n");
  put(site, "public/robots.txt", "User-agent: *\n");
  if (mut.charterFile !== null) put(site, mut.charterFile ?? "demo-site-charter.md", CHARTER);
  if (mut.workflow !== null) put(site, ".github/workflows/site-verify.yml", mut.workflow ?? WORKFLOW());
  if (mut.brief) put(site, "intake-brief.md", mut.brief);
  // `ts: true` lends the site THIS repo's own `typescript`, as a symlink, which is where [3]'s
  // voice arm resolves it from on a real site; without it the arm takes its fallback.
  if (mut.ts && TS_DIR) {
    mkdirSync(join(site, "node_modules"), { recursive: true });
    symlinkSync(TS_DIR, join(site, "node_modules", "typescript"), "dir");
  }
  return { site, seed };
}

function run(fx, { args = [], env = {}, verify = VERIFY } = {}) {
  const argv = [verify, fx.site, "--seed", fx.seed, ...args];
  try {
    return execFileSync(process.execPath, argv, {
      env: { ...process.env, CI: "", GITHUB_REPOSITORY: "", SEED_REPO: "", ...env },
      encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    // exit 1 is a FINDING and is the expected shape for most cases below; only exit 2 (invocation)
    // and a crash are harness failures, and those carry no stdout to assert on.
    if (e.status === 1 && typeof e.stdout === "string") return e.stdout;
    console.error(`SELF-TEST HARNESS FAIL: verify.mjs exited ${e.status}\n${e.stderr || ""}`);
    process.exit(1);
  }
}

let pass = 0, fail = 0;
const lineOf = (out, sub) => out.split("\n").find((l) => l.includes(sub)) || "";
function expect(label, cond, detail) {
  if (cond) { pass++; console.log(`  ok    ${label}`); }
  else { fail++; console.log(`  FAIL  ${label}${detail ? `\n        ${detail}` : ""}`); }
}
const fails = (out, sub) => /^\s*FAIL\s/.test(lineOf(out, sub));
const notes = (out, sub) => /^\s*----\s/.test(lineOf(out, sub));
const warns = (out, sub) => /^\s*WARN\s/.test(lineOf(out, sub));
const passes = (out, sub) => /^\s*PASS\s/.test(lineOf(out, sub));
// A pair can appear in a NOTE before it appears as a verdict (the carrier note names its pairs),
// and lineOf returns the FIRST match, so a substring test would read the note as the verdict.
// failsAny scores the VERDICT lines only.
const verdicts = (out, kind) => out.split("\n").filter((l) => new RegExp("^\\s*" + kind + "\\s").test(l));
const failsAny = (out, sub) => verdicts(out, "FAIL").some((l) => l.includes(sub));

console.log("verify.selftest -- negative cases for the checks added 2026-09-18 (rows 046 ground half, 098, 107) and 2026-10-11 (R112, R120, R121, R122, R125, R221, the review fold of #24, and R110, R111, R063, R109) and 2026-10-12 (W-tier, and R055, the [3] voice arm, and the review fold of #27) and 2026-10-13 (the [3] em-dash half, every form) and 2026-10-14 (the [3] corpus, the string values of src/content/*.json)\n");

// ---- C1. CONTROL: a fully instantiated site fires NONE of the new checks ----------------------
{
  const fx = build("control", { brief: BRIEF(FULL_LANES) });
  const out = run(fx, { args: ["--charter", join(fx.site, "demo-site-charter.md"), "--brief", join(fx.site, "intake-brief.md")] });
  for (const sub of ["SEED_REPO names THIS repository", "field SEED_REF is absent",
                     "is NOT a full 40-character sha", "no such file exists in this repo",
                     "omits the S8 record for lane(s)", "present but incomplete",
                     "HUE_CARRIERS does not name", "HUE_FAMILIES does not name"]) {
    expect(`control is silent on: ${sub}`, !out.includes(sub), lineOf(out, sub));
  }
  expect("control passes the S8 lane record", passes(out, "all 5 intake lanes carry an S8 record"), lineOf(out, "intake lanes"));
  expect("control states what [9] cannot prove", out.includes("THIS CHECK CANNOT PROVE A LANE WAS RUN"));
  expect("control passes both [8] fill-in fields", passes(out, "SEED_REF is a full 40-character sha") && passes(out, "field CHARTER names a file that exists"), lineOf(out, "SEED_REF"));
  expect("control composes no hue, so no carrier pair is added", !out.includes("hue carriers beyond <Section hue>"), lineOf(out, "hue carriers"));
  expect("control declares no og block, so [4] notes the card is not checked", notes(out, "declares no og.image"), lineOf(out, "og.image"));
}

// ---- C2. row 107: the seed-role carve-out is granted only to a CANON-DECLARED seed ------------
{
  // env half, the CI shape: a site whose workflow copied its own slug into SEED_REPO.
  const fx = build("seedrepo-self-env", {});
  const out = run(fx, { env: { GITHUB_REPOSITORY: "AISmithFactory/demo-site", SEED_REPO: "AISmithFactory/demo-site" } });
  expect("[0] fails a repo whose SEED_REPO names itself", fails(out, "SEED_REPO names THIS repository"), lineOf(out, "SEED_REPO names THIS"));
  expect("and the carve-out did NOT apply ([1b] is not REVIEW)", !out.includes("NOT DECIDABLE in the SEED repo"));
}
{
  // the same shape on the CANON-DECLARED seed is the legitimate carve-out and must NOT fail
  const fx = build("seedrepo-canon", { workflow: WORKFLOW({ seedRef: "main" }) });
  const out = run(fx, { env: { GITHUB_REPOSITORY: CANON_SEED, SEED_REPO: CANON_SEED } });
  expect("the canon-declared seed keeps its carve-out", !out.includes("SEED_REPO names THIS repository"), lineOf(out, "SEED_REPO names THIS"));
  expect("and [1b] reports REVIEW there", out.includes("NOT DECIDABLE in the SEED repo"));
  expect("and [8] does not read SEED_REF as a pin in the seed", notes(out, "SEED_REF is not a pin in the seed repo itself"), lineOf(out, "not a pin"));
  expect("[0] says the carve-out applied and why", passes(out, "canon declares it the seed"), lineOf(out, "canon declares it"));
}
{
  // the WORKFLOW-declared half, which is what a LOCAL run can reach: [8] resolves the repo from
  // the git remote, and a fixture has none, so the env supplies GITHUB_REPOSITORY alone.
  const fx = build("seedrepo-self-wf", { workflow: WORKFLOW({ seedRepo: "AISmithFactory/demo-site" }) });
  const out = run(fx, { env: { GITHUB_REPOSITORY: "AISmithFactory/demo-site", SEED_REPO: "AISmithFactory/demo-site" } });
  expect("[8] fails a workflow whose SEED_REPO names this repo", fails(out, "field SEED_REPO names THIS repository"), lineOf(out, "field SEED_REPO names THIS"));
  expect("and the SEED_REF pin check RAN there (the carve-out did not swallow it)",
    passes(out, "SEED_REF is a full 40-character sha") || fails(out, "SEED_REF"), lineOf(out, "SEED_REF"));
}
{
  // a NON-self-naming site is untouched by any of it
  const fx = build("seedrepo-normal", {});
  const out = run(fx, { env: { GITHUB_REPOSITORY: "AISmithFactory/demo-site", SEED_REPO: CANON_SEED } });
  expect("[0] states a SEED_REPO that is not this repo as a pass", passes(out, "is not this repository"), lineOf(out, "is not this repository"));
}
{
  // and a LOCAL run, which sets neither variable, says WHICH one is missing rather than reading green
  const fx = build("seedrepo-local", {});
  const out = run(fx);
  expect("[0] notes that provenance was not evaluated locally", notes(out, "SEED_REPO provenance not evaluated"), lineOf(out, "provenance not evaluated"));
  expect("and it names the variable that is unset", lineOf(out, "provenance not evaluated").includes("GITHUB_REPOSITORY"));
}

// ---- C3. row 046, GROUND half: a hue carrier that is not <Section hue> ------------------------
{
  // The mutation is ONE TierCard gaining hue={3}. `data-hue-bar` grounds `.tier-card .tier-ico`
  // in --hue-3 and that selector paints `var(--tier-ink, var(--on-dark))`, which falls back to
  // --on-dark = 3.45 because the tokens declare no --hue-3-ink: a real ink on a real ground that no
  // [data-hue] block and no [data-tone] selector appears in.
  const fx = build("carrier-tiercard", {
    indexTsx: `export const Route = { head: () => ({ title: "Home" }) };
export const Page = () => <Section tone="paper"><TierCard hue={3}>plan</TierCard></Section>;
`,
  });
  const out = run(fx);
  expect("--on-dark is scored on a --hue-3 carried by data-hue-bar",
    failsAny(out, "--on-dark on --hue-3"), verdicts(out, "FAIL").join(" | "));
  expect("the carrier note names the pair and the selector it came from",
    notes(out, "hue carriers beyond <Section hue>") && lineOf(out, "hue carriers beyond").includes("data-hue-bar=3"),
    lineOf(out, "hue carriers beyond"));
  expect("the 6px ::before bar carries no text and is NOT scored as a ground",
    !lineOf(out, "hue carriers beyond").includes("::before"), lineOf(out, "hue carriers beyond"));
  expect("and the slot is no longer counted as UNCOMPOSED",
    !lineOf(out, "declared but UNCOMPOSED").includes("--hue-3"), lineOf(out, "declared but UNCOMPOSED"));
}
{
  // an UNDECLARED slot stays inert (S4.6) even when the markup composes it through a carrier
  const fx = build("carrier-undeclared", {
    indexTsx: `export const Route = { head: () => ({ title: "Home" }) };
export const Page = () => <Section tone="paper"><TierCard hue={2}>plan</TierCard></Section>;
`,
  });
  const out = run(fx);
  // the one line that may name --hue-2 is the note naming the slot as unscored (the code review of
  // #26, F2); any other line naming it is a pair this inert slot added
  const NAMED = "could not score on a hue ground";
  const rest = out.split("\n").filter((l) => !l.includes(NAMED)).join("\n");
  expect("a carrier on an undeclared hue slot adds no pair", !rest.includes("--hue-2"), lineOf(rest, "--hue-2"));
  expect("and names the slot it could not score, rather than skipping it with no line",
    notes(out, NAMED) && lineOf(out, NAMED).includes("data-hue-bar=2 (--hue-2 undeclared)"), lineOf(out, NAMED) || "no such note");
}
{
  // THE LIST DECAYING IS A FINDING: a spine component shipping a carrier attribute no
  // HUE_CARRIERS entry names must be reported rather than silently unscored.
  const fx = build("carrier-unlisted", {});
  const site = fx.site;
  mkdirSync(join(site, "src/components/spine"), { recursive: true });
  writeFileSync(join(site, "src/components/spine/index.tsx"),
    SPINE_TSX + `export function IlluStage({ hue, children }) {\n  return <div className="illu" data-hue-sheet={hue}>{children}</div>;\n}\n`);
  const out = run(fx);
  expect("an unlisted hue carrier attribute is named as UNSCORED",
    notes(out, "HUE_CARRIERS does not name") && lineOf(out, "HUE_CARRIERS does not name").includes("data-hue-sheet"),
    lineOf(out, "HUE_CARRIERS does not name"));
}

// ---- C4. row 075: declared-but-uncomposed slots are INFORMATIONAL and never a fail ------------
{
  const fx = build("uncomposed-palette", {});   // the base composes no hue at all
  const out = run(fx);
  expect("the palette line names the uncomposed slots", notes(out, "declared but UNCOMPOSED hue slot(s)"), lineOf(out, "UNCOMPOSED hue slot"));
  expect("it names --hue-1 and --hue-3", lineOf(out, "UNCOMPOSED hue slot").includes("--hue-1") && lineOf(out, "UNCOMPOSED hue slot").includes("--hue-3"));
  expect("and NOTHING fails on an uncomposed slot",
    !out.split("\n").some((l) => /^\s*FAIL\s/.test(l) && /--hue-[13]/.test(l)),
    out.split("\n").filter((l) => /^\s*FAIL\s/.test(l) && /--hue-/.test(l)).join(" | "));
}

// ---- C5. [8] INSTANTIATION: the fill-in branches, including the six attacker-2 found uncovered -
{
  const fx = build("seedref-unreplaced", { workflow: WORKFLOW({ seedRef: "main" }) });
  const out = run(fx, { env: { GITHUB_REPOSITORY: "AISmithFactory/demo-site" } });
  expect("[8] fails SEED_REF: main and says it is the template's own value",
    fails(out, "is NOT a full 40-character sha") && lineOf(out, "NOT a full 40-character sha").includes("UNREPLACED"),
    lineOf(out, "NOT a full 40-character"));
}
{
  const fx = build("seedref-empty", { workflow: WORKFLOW({ seedRef: '""' }) });
  const out = run(fx, { env: { GITHUB_REPOSITORY: "AISmithFactory/demo-site" } });
  expect("[8] fails an EMPTY SEED_REF and names the field", fails(out, "field SEED_REF is absent"), lineOf(out, "SEED_REF"));
}
{
  // F3 branch: SEED_REF ABSENT as a key, not empty
  const fx = build("seedref-absent", { workflow: WORKFLOW({ seedRef: null }) });
  const out = run(fx, { env: { GITHUB_REPOSITORY: "AISmithFactory/demo-site" } });
  expect("[8] fails an ABSENT SEED_REF key", fails(out, "field SEED_REF is absent"), lineOf(out, "SEED_REF"));
}
{
  const fx = build("charter-inherited", { workflow: WORKFLOW({ charter: "aismith-site-charter.md" }) });
  const out = run(fx, { env: { GITHUB_REPOSITORY: "AISmithFactory/demo-site" } });
  expect("[8] fails a CHARTER naming a file this repo lacks", fails(out, "no such file exists in this repo"), lineOf(out, "field CHARTER names"));
  expect("and it says the value was carried over unreplaced", lineOf(out, "no such file exists in this repo").includes("unreplaced"));
}
{
  // F3 branch: CHARTER ABSENT from the workflow while the repo DOES carry one. The seed's [8]
  // reads this as a note, deliberately off for this repo, and that reading is the seed's own:
  // see this file's scope paragraph and the PR body.
  const fx = build("charter-absent-from-wf", { workflow: WORKFLOW({ charter: null }) });
  const out = run(fx, { env: { GITHUB_REPOSITORY: "AISmithFactory/demo-site" } });
  expect("[8] notes an absent CHARTER field rather than failing it",
    notes(out, "field CHARTER is not declared"), lineOf(out, "field CHARTER"));
  expect("and no [8] line fails on the charter there",
    !out.split("\n").some((l) => /^\s*FAIL\s/.test(l) && /field CHARTER/.test(l)),
    out.split("\n").filter((l) => /^\s*FAIL\s/.test(l) && /CHARTER/.test(l)).join(" | "));
}
{
  // F3 branch: SEED_REPO absent from the workflow. The seed's [8] finds the gate workflow BY
  // CONTENT (a file declaring SEED_REPO), so a workflow without it is not found at all and the
  // finding is the no-gate-workflow one. Pinned here because that is a real branch with a real
  // message, and because the two cases being one message is a fact a reader should meet.
  const fx = build("seedrepo-absent-from-wf", { workflow: WORKFLOW({ seedRepo: null }) });
  const out = run(fx);
  expect("[8] reports no gate workflow when none declares SEED_REPO",
    warns(out, "no gate workflow found under .github/workflows"), lineOf(out, "no gate workflow"));
}
{
  // F3 branch: no gate workflow file at all -- the same finding, and fail-closed under --ci
  const fx = build("no-workflow", { workflow: null });
  const out = run(fx);
  expect("[8] warns on a repo with no gate workflow at all", warns(out, "no gate workflow found under .github/workflows"), lineOf(out, "no gate workflow"));
  const outCi = run(fx, { args: ["--ci"] });
  expect("and it FAILS CLOSED under --ci", fails(outCi, "no gate workflow found under .github/workflows"), lineOf(outCi, "no gate workflow"));
}
{
  // F3 branch: --charter supplied but missing. ONLY THE SEVERITY IS PINNED HERE. The seed's [5]
  // reaches its no-charter-supplied branch in this case and says "no --charter supplied" when one
  // WAS supplied; that wording defect is REPORTED in the PR body and not commissioned by this
  // brief, and a self-test that pinned the wrong sentence would make correcting it look like a
  // regression.
  const fx = build("charter-supplied-missing", {});
  const out = run(fx, { args: ["--charter", join(fx.site, "nope-site-charter.md")] });
  expect("[5] does not PASS when --charter names a file that does not exist",
    !passes(out, "charter <-> repo routes reconcile both ways"), lineOf(out, "reconcile both ways"));
  const outCi = run(fx, { args: ["--ci", "--charter", join(fx.site, "nope-site-charter.md")] });
  expect("and [5] fails closed under --ci", outCi.split("\n").some((l) => /^\s*FAIL\s/.test(l) && /charter/.test(l)),
    outCi.split("\n").filter((l) => /^\s*FAIL\s/.test(l) && /charter/.test(l)).join(" | "));
}

// ---- C6. row 098: the S8 per-lane record ------------------------------------------------------
{
  const fx = build("lanes-missing", { brief: BRIEF(FULL_LANES.filter((l) => !l.startsWith("enrichment"))) });
  const out = run(fx, { args: ["--brief", join(fx.site, "intake-brief.md")] });
  expect("[9] fails a brief omitting a lane and names it", fails(out, "omits the S8 record for lane(s): enrichment"), lineOf(out, "omits the S8 record"));
}
{
  const fx = build("lanes-half", { brief: BRIEF(FULL_LANES.map((l) => l.startsWith("brand") ? "brand: consumed=a render of the homepage" : l)) });
  const out = run(fx, { args: ["--brief", join(fx.site, "intake-brief.md")] });
  expect("[9] fails a lane record with only one half", fails(out, "present but incomplete"), lineOf(out, "incomplete"));
  expect("and it names the missing half", lineOf(out, "present but incomplete").includes("brand (no looked-for)"));
}
{
  const fx = build("lanes-noblock", { brief: "# brief\n\nno fenced block here\n" });
  const out = run(fx, { args: ["--brief", join(fx.site, "intake-brief.md")] });
  expect("[9] fails a brief with no ```lanes block", fails(out, "has no ```lanes block"), lineOf(out, "lanes block"));
}
{
  const fx = build("lanes-stray", { brief: BRIEF([...FULL_LANES, "seo: consumed=nothing; looked-for=nothing"]) });
  const out = run(fx, { args: ["--brief", join(fx.site, "intake-brief.md")] });
  expect("[9] reads a name S3 does not declare without scoring it", notes(out, "declares name(s) S3 does not"), lineOf(out, "S3 does not"));
  expect("and the five real lanes still pass", passes(out, "all 5 intake lanes carry an S8 record"), lineOf(out, "intake lanes"));
}
{
  // F3 branch: --brief supplied but missing
  const fx = build("brief-supplied-missing", {});
  const out = run(fx, { args: ["--brief", join(fx.site, "nope-brief.md")] });
  expect("[9] fails when --brief names a file that does not exist", fails(out, "was supplied but no such file exists"), lineOf(out, "no such file exists"));
}
{
  const fx = build("lanes-unarmed", {});
  const out = run(fx);
  expect("[9] reports NOT ARMED with no --brief and fails nothing", notes(out, "NOT ARMED"), lineOf(out, "NOT ARMED"));
  expect("and nothing in [9] fails when unarmed", !out.includes("omits the S8 record"));
  expect("and it stays unarmed under --ci (opt-in is not a soft check)",
    notes(run(fx, { args: ["--ci"] }), "NOT ARMED"), lineOf(run(fx, { args: ["--ci"] }), "NOT ARMED"));
}

// ---- C7. R121: the form field edge owes 3.0 against the field AND the card ----------------------
const EDGE_OK = "var(--line-input, var(--text-soft))";
{
  // CONTROL: the shipped rule on a skin with no --line-input, so the chain falls back to --text-soft
  const out = run(build("field-edge-control", {}));
  expect("[2] scores the field edge against the field and passes it",
    passes(out, "form field edge --text-soft vs the field --bg"), lineOf(out, "form field edge"));
  expect("and against the card", passes(out, "form field edge --text-soft vs the card --surface"), lineOf(out, "vs the card"));
  expect("and the focused edge against both", passes(out, "form field focus edge --accent vs the field --bg") && passes(out, "form field focus edge --accent vs the card --surface"), lineOf(out, "focus edge"));
  expect("and the denominator counts the non-text pairs, rest and focus", lineOf(out, "AA denominator").includes("4 non-text pair(s) asserted at 3.0"), lineOf(out, "AA denominator"));
}
{
  // PLANT (F2): the FOCUS rule alone drawn in --line, the rest edge untouched and green
  const fx = build("field-focus-line", {
    spineCss: SPINE_CSS.replace(":focus { border-color: var(--accent); }", ":focus { border-color: var(--line); }"),
    tokens: TOKENS.replace("}", "  --line: rgba(17, 17, 17, .12);\n}"),
  });
  const out = run(fx);
  expect("[2] FAILS a focus edge drawn in --line while the rest edge passes",
    failsAny(out, "form field focus edge --line (rgba flattened over the field --bg") && passes(out, "form field edge --text-soft vs the field --bg"), verdicts(out, "FAIL").join(" | "));
}
{
  // a spine with no focus rule leaves the focused field unscored: a warning locally, a failure under --ci
  const fx = build("field-focus-absent", { spineCss: SPINE_CSS.split("\n").filter((l) => !l.includes(":focus")).join("\n") });
  expect("[2] warns when there is no focus rule to score", warns(run(fx), "cannot score the form field focus edge"), lineOf(run(fx), "focus edge"));
  expect("and fails closed under --ci", fails(run(fx, { args: ["--ci"] }), "cannot score the form field focus edge"), lineOf(run(fx, { args: ["--ci"] }), "focus edge"));
}
{
  // PLANT: the edge drawn in the rule-and-divider token, as at b8074088 (1.27 and 1.38 on the seed's skin)
  const fx = build("field-edge-line", {
    spineCss: SPINE_CSS.replace(EDGE_OK, "var(--line)"),
    tokens: TOKENS.replace("}", "  --line: rgba(17, 17, 17, .12);\n}"),
  });
  const out = run(fx);
  expect("[2] FAILS a field edge drawn in --line against the field, flattened over it",
    failsAny(out, "form field edge --line (rgba flattened over the field --bg") && failsAny(out, "vs the field --bg"), verdicts(out, "FAIL").join(" | "));
  expect("and against the card", failsAny(out, "vs the card --surface"), verdicts(out, "FAIL").join(" | "));
}
{
  // a DECLARED --line-input is the token scored, and a [data-card-ground] override is a further card ground
  const fx = build("field-edge-declared", {
    spineCss: SPINE_CSS + `[data-card-ground="alt"] { --card-bg: var(--bg-alt); }\n`,
    tokens: TOKENS.replace("}", "  --line-input: rgba(17, 17, 17, .55);\n}"),
  });
  const out = run(fx);
  expect("[2] scores the declared --line-input, not the fallback",
    passes(out, "form field edge --line-input (rgba flattened") && !out.includes("form field edge --text-soft"), lineOf(out, "form field edge"));
  expect("and scores the card-ground override as a card", passes(out, "vs the card --bg-alt"), lineOf(out, "vs the card --bg-alt"));
}
{
  // no rule to read is UNVERIFIED, never passed: a warning locally and a failure under --ci
  const fx = build("field-edge-absent", { spineCss: SPINE_CSS.split("\n").filter((l) => !l.startsWith(".form-card")).join("\n") });
  expect("[2] warns when there is no field rule to score", warns(run(fx), "cannot score the form field edge"), lineOf(run(fx), "cannot score"));
  expect("and fails closed under --ci", fails(run(fx, { args: ["--ci"] }), "cannot score the form field edge"), lineOf(run(fx, { args: ["--ci"] }), "cannot score"));
}

// ---- C8. R122: every crumb rule is scored on every ground a crumb sits on ----------------------
{
  // CONTROL: the shipped chain, which resolves to the tone's own accent on each tone ground
  const out = run(build("crumb-control", {}));
  expect("[2] scores .crumb and its hover on a light tone", passes(out, "[crumb ink .crumb + .crumb a:hover, tone=paper]"), lineOf(out, "tone=paper]"));
  expect("and on a dark tone", passes(out, "[crumb ink .crumb + .crumb a:hover, tone=dark]"), lineOf(out, "tone=dark]"));
  expect("and the link at rest", passes(out, "[crumb ink .crumb a, tone=paper]"), lineOf(out, "crumb ink .crumb a, tone=paper"));
  expect("and the note says how many crumb pairs are new to the matrix", lineOf(out, "crumb inks:").includes("new to the matrix"), lineOf(out, "crumb inks:"));
}
// THE ACCENT GROUND (F1). The base spine has no accent tone, so the hold-out the first push asserted
// held by construction. These two cases carry the tone: --on-dark on --accent is 5.50 and
// --on-dark-soft (#d0d0d0) on --accent is 3.57, so the crumb link at rest fails 4.5 there.
const ACCENT_TONE_CSS = `[data-tone="accent"] { --sec-bg: var(--accent); --sec-text: var(--on-dark); --sec-soft: var(--on-dark-soft); --tone-accent: var(--on-dark); }\n`;
{
  // CONTROL: no crumb composed on the accent ground, so its pairs are SCORED and printed, never asserted
  const out = run(build("crumb-accent-held", { spineCss: SPINE_CSS + ACCENT_TONE_CSS }));
  const l = lineOf(out, "crumb inks on the accent ground, NOT ASSERTED");
  expect("[2] scores the crumb inks on the accent ground and names each with its ratio",
    notes(out, "crumb inks on the accent ground, NOT ASSERTED") && l.includes("--on-dark-soft on --accent = 3.57 (< 4.5)") && l.includes("--on-dark on --accent = 5.50"), l);
  expect("and asserts none of them where no crumb sits there", !verdicts(out, "FAIL").concat(verdicts(out, "PASS")).some((v) => v.includes("tone=accent]")), verdicts(out, "FAIL").join(" | "));
}
{
  // PLANT: a <Crumb> composed in an accent-tone Section asserts them at 4.5
  const out = run(build("crumb-accent-composed", {
    spineCss: SPINE_CSS + ACCENT_TONE_CSS,
    indexTsx: `export const Route = { head: () => ({ title: "Home" }) };
export const Page = () => <Section tone="accent"><Crumb up={{ label: "Home", href: "/" }}>Plans</Crumb></Section>;
`,
  }));
  expect("[2] FAILS the crumb link at rest on the accent ground once a crumb sits there",
    failsAny(out, "--on-dark-soft on --accent [crumb ink .crumb a, tone=accent]"), verdicts(out, "FAIL").join(" | "));
  expect("and passes the pair that clears 4.5 there", passes(out, "--on-dark on --accent [crumb ink .crumb + .crumb a:hover, tone=accent]"), lineOf(out, "tone=accent]"));
  expect("and says why the accent ground is asserted", notes(out, "a <Crumb> is composed in an accent-tone Section"), lineOf(out, "is composed in an accent"));
}
{
  // PLANT: the hover painted in the FILL token, as at b8074088. --accent #c0632e on #ffffff is 4.15
  const fx = build("crumb-hover-accent", {
    spineCss: SPINE_CSS.replace(".crumb a:hover { color: var(--sec-accent, var(--tone-accent, var(--accent-text))); }", ".crumb a:hover { color: var(--accent); }"),
    tokens: TOKENS.replace("--accent: #b34700;", "--accent: #c0632e;"),
  });
  const out = run(fx);
  expect("[2] FAILS a crumb hover painted in --accent and names the rule",
    failsAny(out, "--accent on --bg [crumb ink .crumb a:hover, tone=paper]"), verdicts(out, "FAIL").join(" | "));
}
{
  // on a composed hue cell the crumb inks resolve through the HUE block, as the cascade does
  const out = run(build("crumb-hue-cell", {
    indexTsx: `export const Route = { head: () => ({ title: "Home" }) };
export const Page = () => <Section tone="paper" hue={1}>body</Section>;
`,
  }));
  expect("[2] scores the crumb link on the hue ground in the hue's own ink",
    passes(out, "--hue-1-ink on --hue-1 [crumb ink .crumb a, tone=paper, hue 1 ground]"), lineOf(out, "hue 1 ground"));
}
{
  // a listed rule missing from spine.css is UNSCORED and says so
  const fx = build("crumb-absent", { spineCss: SPINE_CSS.split("\n").filter((l) => !l.startsWith(".crumb a:hover")).join("\n") });
  expect("[2] warns that a listed crumb rule is missing", warns(run(fx), "crumb ink rule(s) not found in spine.css") && lineOf(run(fx), "crumb ink rule(s) not found").includes(".crumb a:hover"), lineOf(run(fx), "not found"));
}

// ---- C9. R112: six hue slots in every hue-keyed family ------------------------------------------
{
  const out = run(build("hue-slots-control", {}));
  expect("[2] passes a spine carrying all six slots in all four families", passes(out, "carries all 6 S4.6 hue slots in each of 4 hue-keyed families"), lineOf(out, "S4.6 hue slots"));
}
{
  // PLANT: the five-slot spine of b8074088, every family stopping at five
  const fx = build("hue-slots-five", { spineCss: SPINE_CSS.split("\n").filter((l) => !/hue-6\b|="6"/.test(l)).join("\n") });
  const out = run(fx);
  const l = lineOf(out, "does not carry all 6 S4.6 hue slots");
  expect("[2] FAILS a spine that stops at five", fails(out, "does not carry all 6 S4.6 hue slots"), l);
  expect("and names every family that lacks slot 6",
    ['[data-hue="N"]', ".em-hue-N", '[data-hue-bar="N"]', '[data-hue-tint="N"]'].every((f) => l.includes(`${f} (`)) && l.includes("lacks slot(s) 6"), l);
}

// ---- C10. R120: a non-grounding carrier sets no ground and no ink --------------------------------
{
  const out = run(build("tint-control", {}));
  expect("[2] passes non-grounding carriers that set only their property",
    passes(out, "non-grounding hue carrier(s) data-hue-bar, data-hue-tint set no ground and no ink"), lineOf(out, "non-grounding"));
}
{
  // PLANT: a tint block that grounds, which is the [data-hue] behaviour the attribute exists to avoid
  const fx = build("tint-grounds", { spineCss: SPINE_CSS.replace('[data-hue-tint="3"] { --hue-tint: var(--hue-3, var(--accent)); }',
    '[data-hue-tint="3"] { --hue-tint: var(--hue-3, var(--accent)); background: var(--hue-tint); color: var(--hue-3-ink); --sec-text: var(--hue-3-ink); }') });
  const out = run(fx);
  const l = lineOf(out, "non-grounding hue carrier block(s) set a ground or an ink");
  expect("[2] FAILS a data-hue-tint block that grounds", fails(out, "non-grounding hue carrier block(s) set a ground or an ink"), l);
  expect("and names the block and what it sets", l.includes('[data-hue-tint="3"] sets background, color, --sec-text'), l);
}
{
  // the tier-card precedent is held to the same rule
  const fx = build("bar-grounds", { spineCss: SPINE_CSS.replace('.tier-card[data-hue-bar="1"] { --tier-bar: var(--hue-1, var(--accent)); --tier-ink: var(--hue-1-ink, var(--on-dark)); }',
    '.tier-card[data-hue-bar="1"] { --tier-bar: var(--hue-1, var(--accent)); --tier-ink: var(--hue-1-ink, var(--on-dark)); background: var(--hue-1); }') });
  const out = run(fx);
  expect("[2] FAILS a data-hue-bar block that grounds", lineOf(out, "set a ground or an ink").includes('.tier-card[data-hue-bar="1"] sets background') && fails(out, "set a ground or an ink"), lineOf(out, "set a ground"));
}
{
  // the RAW attribute in markup composes its slot: a spine selector grounding on --hue-tint with an ink is scored
  const fx = build("tint-raw-attr", {
    spineCss: SPINE_CSS + ".tint-chip { background: var(--hue-tint); color: var(--on-dark); }\n",
    indexTsx: `export const Route = { head: () => ({ title: "Home" }) };
export const Page = () => <Section tone="paper"><div data-hue-tint={3}><span className="tint-chip">x</span></div></Section>;
`,
  });
  const out = run(fx);
  expect("[2] scores an ink on a --hue-tint ground composed by the raw attribute",
    failsAny(out, "--on-dark on --hue-3") && lineOf(out, "hue carriers beyond").includes("data-hue-tint=3"), lineOf(out, "hue carriers beyond"));
}
{
  // PLANT (F3): ONE bare-attribute block grounds every tint carrier at once
  const fx = build("tint-grounds-bare", { spineCss: SPINE_CSS + "[data-hue-tint] { background: var(--hue-tint); color: var(--on-dark); --sec-text: var(--on-dark); }\n" });
  const out = run(fx);
  const l = lineOf(out, "non-grounding hue carrier block(s) set a ground or an ink");
  expect("[2] FAILS a bare [data-hue-tint] block that grounds", fails(out, "non-grounding hue carrier block(s) set a ground or an ink") && l.includes("[data-hue-tint] sets background, color, --sec-text"), l);
}
{
  // and the bare data-hue-bar form, held to the same rule
  const fx = build("bar-grounds-bare", { spineCss: SPINE_CSS + ".tier-card[data-hue-bar] { background: var(--tier-bar); }\n" });
  const out = run(fx);
  expect("[2] FAILS a bare .tier-card[data-hue-bar] block that grounds", fails(out, "set a ground or an ink") && lineOf(out, "set a ground or an ink").includes(".tier-card[data-hue-bar] sets background"), lineOf(out, "set a ground"));
}
{
  // PLANT (F7): a CSS-only carrier family, with no component, is named by both sweeps
  const fx = build("carrier-css-only", { spineCss: SPINE_CSS + '[data-hue-wash="1"] { --hue-wash: var(--hue-1, var(--accent)); }\n' });
  const out = run(fx);
  expect("[2] names a carrier attribute that only spine.css keys on",
    notes(out, "HUE_CARRIERS does not name") && lineOf(out, "HUE_CARRIERS does not name").includes("data-hue-wash"), lineOf(out, "HUE_CARRIERS does not name"));
  expect("and names its family as unchecked for slots",
    notes(out, "HUE_FAMILIES does not name") && lineOf(out, "HUE_FAMILIES does not name").includes('[data-hue-wash="N"]'), lineOf(out, "HUE_FAMILIES does not name"));
}
{
  // a carrier written only in the markup is named too
  const out = run(build("carrier-markup-only", {
    indexTsx: `export const Route = { head: () => ({ title: "Home" }) };
export const Page = () => <Section tone="paper"><div data-hue-sheet={2}>x</div></Section>;
`,
  }));
  expect("[2] names a carrier attribute that only the markup writes",
    lineOf(out, "HUE_CARRIERS does not name").includes("data-hue-sheet"), lineOf(out, "HUE_CARRIERS does not name"));
}
{
  // PLANT (F7): a CLASS-keyed family stopping at five is named, since .em-hue-N proves the form exists
  const fx = build("family-class-unlisted", { spineCss: SPINE_CSS + [1, 2, 3, 4, 5].map((n) => `.badge-hue-${n} { color: var(--hue-${n}-text, currentColor); }\n`).join("") });
  const out = run(fx);
  expect("[2] names a class-keyed hue family HUE_FAMILIES does not list",
    notes(out, "HUE_FAMILIES does not name") && lineOf(out, "HUE_FAMILIES does not name").includes(".badge-hue-N") && !lineOf(out, "HUE_FAMILIES does not name").includes(".em-hue-N"), lineOf(out, "HUE_FAMILIES does not name"));
}

// ---- C11. R125: [10] the open phone menu shows a nav item's children ----------------------------
const PHONE_RULE = "  .header.nav-open .nav .submenu { position: static; opacity: 1; visibility: visible; transform: none; padding: 0 0 0 18px; }\n";
{
  const out = run(build("phone-menu-control", {}));
  expect("[10] passes a phone block that shows every submenu", passes(out, "open phone menu (@media (max-width: 900px)): every .submenu is static, shown, untransformed and indented"), lineOf(out, "open phone menu (@media"));
}
{
  // PLANT: the phone block of b8074088, which never re-flows a .submenu
  const out = run(build("phone-menu-none", { spineCss: SPINE_CSS.replace(PHONE_RULE, "") }));
  expect("[10] FAILS a phone block with no submenu rule", fails(out, "open phone menu (@media") && lineOf(out, "open phone menu (@media").includes("has no rule"), lineOf(out, "open phone menu (@media"));
}
{
  // a PARTIAL fix: static and shown, still carrying the dropdown's translateX(-50%)
  const out = run(build("phone-menu-transform", { spineCss: SPINE_CSS.replace(PHONE_RULE, PHONE_RULE.replace("transform: none; ", "")) }));
  const l = lineOf(out, "open phone menu (@media");
  expect("[10] FAILS a submenu left transformed and names only that", fails(out, "open phone menu (@media") && l.includes("transform: none") && !l.includes("position: static"), l);
}
{
  // shown but not indented under its parent
  const out = run(build("phone-menu-flush", { spineCss: SPINE_CSS.replace(PHONE_RULE, PHONE_RULE.replace("padding: 0 0 0 18px;", "padding: 0;")) }));
  expect("[10] FAILS a submenu that is not indented", fails(out, "open phone menu (@media") && lineOf(out, "open phone menu (@media").includes("an indent under its parent"), lineOf(out, "open phone menu (@media"));
}
{
  // PLANT A (F4): a SECOND phone-width block, later and at the same specificity, hides the children
  // again. (A lower-specificity `.nav-open .submenu { display: none; }` hides them too, because the
  // phone rule sets no display to outrank it, and [10] reads it so.)
  const out = run(build("phone-menu-override", { spineCss: SPINE_CSS + "@media (max-width: 900px) {\n  .header.nav-open .nav .submenu { display: none; }\n}\n" }));
  const l = lineOf(out, "open phone menu (@media");
  expect("[10] FAILS a later block that sets display: none on the submenu", fails(out, "open phone menu (@media") && l.includes("a display other than none") && l.includes("1 of them outside the phone block"), l);
}
{
  // PLANT B (F4): the shipped rule collapsed to no height and clipped
  const out = run(build("phone-menu-collapsed", { spineCss: SPINE_CSS.replace(PHONE_RULE, PHONE_RULE.replace(" }\n", " max-height: 0; overflow: hidden; }\n")) }));
  expect("[10] FAILS a submenu with a zero max-height", fails(out, "open phone menu (@media") && lineOf(out, "open phone menu (@media").includes("a height (a zero height or max-height"), lineOf(out, "open phone menu (@media"));
}
{
  // a height-bounded list that clips is the same defect with a non-zero number
  const out = run(build("phone-menu-clipped", { spineCss: SPINE_CSS.replace(PHONE_RULE, PHONE_RULE.replace(" }\n", " max-height: 40px; overflow: hidden; }\n")) }));
  expect("[10] FAILS a height-bounded submenu that clips", fails(out, "open phone menu (@media") && lineOf(out, "open phone menu (@media").includes("an overflow that does not clip it"), lineOf(out, "open phone menu (@media"));
}
{
  // CONTROL: a later rule that LOSES the cascade (lower specificity, on a property the phone rule
  // sets) or cannot apply at phone width (a min-width above the phone block) changes nothing, so
  // reading the whole file is not reading it blindly
  const out = run(build("phone-menu-cascade-control", { spineCss: SPINE_CSS +
    ".nav-open .submenu { visibility: hidden; }\n@media (min-width: 1200px) {\n  .header.nav-open .nav .submenu { max-height: 0; }\n}\n" }));
  expect("[10] passes when the overriding rules lose the cascade or do not apply", passes(out, "every .submenu is static, shown, untransformed and indented"), lineOf(out, "open phone menu (@media"));
}
{
  // no phone block to read is UNVERIFIED: a warning locally and a failure under --ci
  const fx = build("phone-menu-noblock", { spineCss: SPINE_CSS.slice(0, SPINE_CSS.indexOf("@media")) });
  expect("[10] warns when no phone block can be read", warns(run(fx), "no media block that hides the desktop .nav"), lineOf(run(fx), "no media block"));
  expect("and fails closed under --ci", fails(run(fx, { args: ["--ci"] }), "no media block that hides the desktop .nav"), lineOf(run(fx, { args: ["--ci"] }), "no media block"));
}

// ---- C12. R221: [4] the link-preview card against its own bytes, and og:locale against lang (F6, F9) --
// A PNG is its signature plus an IHDR chunk, which is all [4] reads; a JPEG is SOI, one APP0 and a
// start-of-frame. `bytes` pads the file to a size.
const png = (w, h, bytes = 33) => {
  const b = Buffer.alloc(Math.max(bytes, 33));
  b.writeUInt32BE(0x89504e47, 0); b.writeUInt32BE(0x0d0a1a0a, 4); b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "ascii"); b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20);
  return b;
};
const jpeg = (w, h) => Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08,
  h >> 8, h & 255, w >> 8, w & 255, 0x03, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xd9]);
const OG = ({ image = "/og-card.png", type = "image/png", locale = "en_GB" } = {}) => CONFIG +
  `export const og = {\n  image: "${image}",\n  type: "${type}",\n  width: 1200,\n  height: 630,\n  alt: "card",\n  locale: "${locale}",\n};\n`;
{
  // CONTROL: a true card, and a locale whose language matches lang="en" (lang carries no region)
  const out = run(build("og-control", { config: OG(), files: { "public/og-card.png": png(1200, 630) } }));
  expect("[4] passes a card that is what og says it is", passes(out, "link-preview card public/og-card.png is 1200 x 630 image/png"), lineOf(out, "link-preview card"));
  expect("and passes og.locale against lang", passes(out, "og.locale en_GB agrees with <html lang=\"en\">"), lineOf(out, "og.locale"));
}
{
  // and the JPEG header is read too
  const out = run(build("og-jpeg-control", { config: OG({ image: "/og-card.jpg", type: "image/jpeg" }), files: { "public/og-card.jpg": jpeg(1200, 630) } }));
  expect("[4] reads a JPEG card's start-of-frame", passes(out, "link-preview card public/og-card.jpg is 1200 x 630 image/jpeg"), lineOf(out, "link-preview card"));
}
{
  // PLANT: the card deleted, as the review did
  const out = run(build("og-missing", { config: OG() }));
  expect("[4] FAILS an og.image naming a file that does not exist", fails(out, "names public/og-card.png, which does not exist"), lineOf(out, "og.image"));
}
{
  // PLANT: a near-square image behind the declared 1200 x 630
  const l = lineOf(run(build("og-square", { config: OG(), files: { "public/og-card.png": png(630, 630) } })), "link-preview card public/og-card.png:");
  expect("[4] FAILS a card that is not 1200 x 630 and is false to og.width x og.height",
    /^\s*FAIL\s/.test(l) && l.includes("it is 630 x 630, not the 1200 x 630 landscape card") && l.includes("og.width x og.height read 1200 x 630 and the file is 630 x 630"), l);
}
{
  // PLANT: over 300 KB
  const l = lineOf(run(build("og-heavy", { config: OG(), files: { "public/og-card.png": png(1200, 630, 310 * 1024) } })), "link-preview card public/og-card.png:");
  expect("[4] FAILS a card over 300 KB", /^\s*FAIL\s/.test(l) && l.includes("over the 300 KB"), l);
}
{
  // PLANT: og.type false to the bytes
  const l = lineOf(run(build("og-type", { config: OG({ type: "image/jpeg" }), files: { "public/og-card.png": png(1200, 630) } })), "link-preview card public/og-card.png:");
  expect("[4] FAILS an og.type the file is not", /^\s*FAIL\s/.test(l) && l.includes("og.type reads image/jpeg and the file is image/png"), l);
}
{
  // a card on another host cannot be read from here: REVIEW, never PASS and never FAIL
  const out = run(build("og-offhost", { config: OG({ image: "https://cdn.example.com/card.png" }) }));
  expect("[4] reports a card on another host for review", /^\s*REVIEW\s/.test(lineOf(out, "is not on the site's own host")), lineOf(out, "own host"));
}
{
  // PLANT (F9): og.locale and lang name different regions of one language
  const out = run(build("og-locale-drift", { config: OG(), files: { "public/og-card.png": png(1200, 630) }, rootTsx: ROOT_TSX.replace('lang="en"', 'lang="en-US"') }));
  expect("[4] FAILS og.locale en_GB against <html lang=\"en-US\">", fails(out, "og.locale en_GB and <html lang=\"en-US\">"), lineOf(out, "og.locale"));
}
{
  // and different languages
  const out = run(build("og-locale-lang", { config: OG({ locale: "nl_BE" }), files: { "public/og-card.png": png(1200, 630) } }));
  expect("[4] FAILS og.locale nl_BE against <html lang=\"en\">", fails(out, "og.locale nl_BE and <html lang=\"en\">"), lineOf(out, "og.locale"));
}

// ---- C13. R110: each [data-skin] block is its own map over the base :root; every declared slot ----
// A skin's --text-soft #9a9a9a is 2.81 on --bg (#ffffff); the base's #595959 is 7.00 there.
const SKIN = (body) => `[data-skin="nacht"]:root {\n${body}\n}\n`;
{
  // PLANT: the skin ABOVE :root, sz-site's order, which a flat map read as the base and never checked
  const out = run(build("skin-above", { tokens: SKIN("  --text-soft: #9a9a9a;") + TOKENS }));
  expect("[2] FAILS a skin's own pair, named by the skin, where the skin sits above :root",
    failsAny(out, 'skin "nacht": --text-soft on --bg = 2.81'), verdicts(out, "FAIL").join(" | "));
  // REGRESSION GUARD, not a control: main scored the base here too, since the base block came later
  expect("and still scores the base :root's own value", passes(out, "--text-soft on --bg = 7.00"), lineOf(out, "--text-soft on --bg"));
  expect("and states the skin's own denominator, its FAIL lines counted", notes(out, 'skin "nacht": [data-skin="nacht"]:root scored as its own map') &&
    /: \d+ assertion\(s\) covering \d+ distinct pair\(s\).*; [1-9]\d* FAIL line\(s\) of its own/.test(lineOf(out, "scored as its own map")), lineOf(out, "scored as its own map"));
}
{
  // PLANT: the skin BELOW :root, which a flat map scored IN PLACE OF the base, unnamed
  const out = run(build("skin-below", { tokens: TOKENS + SKIN("  --text-soft: #9a9a9a;") }));
  expect("[2] scores the base where a later skin block used to replace it",
    passes(out, "--text-soft on --bg = 7.00") && failsAny(out, 'skin "nacht": --text-soft on --bg = 2.81'), verdicts(out, "FAIL").join(" | "));
}
{
  // CONTROL: a skin whose values all clear prints no verdict line of its own beyond its summary
  const out = run(build("skin-clean", { tokens: TOKENS + SKIN("  --text-soft: #4a4a4a;") }));
  expect("[2] passes a skin whose pairs all clear, and it fails nothing",
    !verdicts(out, "FAIL").some((l) => l.includes('skin "nacht"')) && passes(out, 'skin "nacht": --text-soft on --bg'), verdicts(out, "FAIL").join(" | "));
  expect("and its summary counts the lines identical to the base pass", /\d+ line\(s\) identical to the base pass not repeated/.test(lineOf(out, "scored as its own map")), lineOf(out, "scored as its own map"));
}
{
  // a skin overriding a colour with a value [2] cannot read DROPS it rather than scoring the base value
  const out = run(build("skin-unread", { tokens: TOKENS + SKIN("  --text-soft: var(--text);") }));
  expect("[2] names a skin colour it cannot read", notes(out, 'skin "nacht": colour token(s) declared with a value [2] cannot read') &&
    lineOf(out, "cannot read, so they are dropped").includes("--text-soft"), lineOf(out, "cannot read"));
}
{
  // CONTROL: no skin block says so
  const out = run(build("skin-none", {}));
  expect("[2] says when tokens.css carries no skin", notes(out, "carries no [data-skin] block"));
  // FOLD of #25's review, F4: the base pass has no skin, so its slot note speaks of the map it read
  expect("and the base pass's slot note names the map, not a skin", lineOf(out, "hue slot pairs:").includes("every --hue-N the map declares"), lineOf(out, "hue slot pairs:"));
}
{
  // PLANT: a declared slot past the old bound (7) is gated; #ffffff on #8a8a8a is 3.45
  const out = run(build("hue-seven", { tokens: TOKENS.replace("}", "  --hue-7: #8a8a8a;\n  --hue-7-ink: #ffffff;\n}") }));
  expect("[2] FAILS a declared --hue-7 pair, past any bound", failsAny(out, "--hue-7-ink on --hue-7 = 3.45"), verdicts(out, "FAIL").join(" | "));
  expect("and the slot note names every declared slot", lineOf(out, "hue slot pairs:").includes("--hue-1, --hue-3, --hue-7"), lineOf(out, "hue slot pairs:"));
  // CONTROL: the same slot with an ink that clears (#111111 on #8a8a8a is 5.47)
  const ok7 = run(build("hue-seven-ok", { tokens: TOKENS.replace("}", "  --hue-7: #8a8a8a;\n  --hue-7-ink: #111111;\n}") }));
  expect("and passes it with an ink that clears", passes(ok7, "--hue-7-ink on --hue-7 = 5.47"), lineOf(ok7, "--hue-7-ink"));
}
{
  // FOLD of #25's review, F1. PLANT: a slot declaring --hue-7 and its ink but no --hue-7-text derives
  // the one pair it can assert. #25's head derived the three text pairs too and asserted and named
  // none of them (zuidgeluid-site: 51 derived, 48 asserted, 0 token(s) unresolvable).
  const den = (out) => (lineOf(out, "AA denominator").match(/(\d+) pair\(s\) derived, (\d+) asserted/) || []).slice(1).map(Number);
  const [d0, a0] = den(run(build("hue-partial-base", {})));
  const [d1, a1] = den(run(build("hue-partial", { tokens: TOKENS.replace("}", "  --hue-7: #8a8a8a;\n  --hue-7-ink: #111111;\n}") })));
  expect("[2] derives no pair for a --hue-N-text the map does not declare", d1 - d0 === 1 && a1 - a0 === 1, `derived ${d0} -> ${d1}, asserted ${a0} -> ${a1}`);
  // CONTROL, and a REGRESSION GUARD: the text twin declared, all four derived and asserted (#333333
  // clears 4.5 on all three grounds)
  const [d2, a2] = den(run(build("hue-partial-text", { tokens: TOKENS.replace("}", "  --hue-7: #8a8a8a;\n  --hue-7-ink: #111111;\n  --hue-7-text: #333333;\n}") })));
  expect("and derives and asserts all four once the twin is declared", d2 - d0 === 4 && a2 - a0 === 4, `derived ${d0} -> ${d2}, asserted ${a0} -> ${a2}`);
}
{
  // PLANT: a slot only the SKIN declares is scored in the skin's pass
  const out = run(build("skin-hue", { tokens: TOKENS + SKIN("  --hue-6: #8a8a8a;\n  --hue-6-ink: #ffffff;") }));
  expect("[2] FAILS a hue pair only a skin declares, named by the skin", failsAny(out, 'skin "nacht": --hue-6-ink on --hue-6 = 3.45'), verdicts(out, "FAIL").join(" | "));
}

// ---- C14. R111: [5] reads a route file's path by TanStack Router's file convention -------------
const ROUTE = (title) => `export const Route = { head: () => ({ title: "${title}" }) };\n`;
const CHARTER_OF = (paths) => "# charter\n\n```routes\n" + paths.join("\n") + "\n```\n";
{
  // CONTROL: a dotted and a nested route reconcile against the paths the router serves
  const fx = build("routes-nested", { files: {
    "src/routes/takken.kapoenen.tsx": ROUTE("Kapoenen"), "src/routes/takken/welpen.tsx": ROUTE("Welpen"),
    "demo-site-charter.md": CHARTER_OF(["/", "/takken/kapoenen", "/takken/welpen"]) }, charterFile: null });
  const out = run(fx, { args: ["--charter", join(fx.site, "demo-site-charter.md")] });
  expect("[5] reads takken.kapoenen.tsx as /takken/kapoenen and takken/welpen.tsx as /takken/welpen",
    passes(out, "charter <-> repo routes reconcile both ways (3 declared, 3 built)"), lineOf(out, "charter"));
}
{
  // PLANT: the basename reading in the charter is now the wrong one, both ways
  const fx = build("routes-basename", { files: {
    "src/routes/takken.kapoenen.tsx": ROUTE("Kapoenen"), "src/routes/takken/welpen.tsx": ROUTE("Welpen"),
    "demo-site-charter.md": CHARTER_OF(["/", "/takken.kapoenen", "/welpen"]) }, charterFile: null });
  const out = run(fx, { args: ["--charter", join(fx.site, "demo-site-charter.md")] });
  expect("[5] FAILS a charter declaring the basename paths",
    fails(out, "charter declares route(s) that do not exist in the repo: /takken.kapoenen, /welpen"), lineOf(out, "charter declares"));
  expect("and names the router's paths as orphans", fails(out, "not declared in charter (orphan)") &&
    ["/takken/kapoenen", "/takken/welpen"].every((p) => lineOf(out, "(orphan)").includes(p)), lineOf(out, "orphan"));
}
{
  // CONTROL: the rest of the convention, index, groups, pathless layouts, `_` suffix, escapes, lazy, ignored
  const fx = build("routes-convention", { files: {
    "src/routes/_layout.tsx": ROUTE("Layout"), "src/routes/(info)/about.tsx": ROUTE("About"),
    "src/routes/posts/index.tsx": ROUTE("Posts"), "src/routes/posts_.edit.tsx": ROUTE("Edit"),
    "src/routes/feed[.]xml.tsx": ROUTE("Feed"), "src/routes/kalender.lazy.tsx": ROUTE("Kalender"),
    "src/routes/-helpers.tsx": ROUTE("Helpers"),
    "demo-site-charter.md": CHARTER_OF(["/", "/about", "/posts", "/posts/edit", "/feed.xml", "/kalender"]) }, charterFile: null });
  const out = run(fx, { args: ["--charter", join(fx.site, "demo-site-charter.md")] });
  expect("[5] reconciles every path the convention gives", passes(out, "reconcile both ways (6 declared, 6 built)"), lineOf(out, "charter"));
  expect("and names the files with no path of their own", notes(out, "declare no path of their own") &&
    lineOf(out, "declare no path of their own").includes("_layout.tsx") && lineOf(out, "declare no path of their own").includes("-helpers.tsx"),
    lineOf(out, "no path of their own"));
}

// ---- C15. R063: a hue ground through a component prop or an inline style -----------------------
// zuidgeluid-site's IlluStage in its shape: an aria-hidden stage whose `sheet` prop is a background.
const UI = `export function IlluStage({ sheet, children }: { sheet: string; children: React.ReactNode }) {
  return <div aria-hidden="true"><div style={{ position: "absolute", background: sheet }} />{children}<FStar color="var(--accent)" /></div>;
}
export function Chip({ bg, children }) {
  return <span style={{ background: bg, color: "var(--on-dark)" }}>{children}</span>;
}
`;
const PAGE = (body) => `export const Route = { head: () => ({ title: "Home" }) };\nexport const Page = () => ${body};\n`;
{
  // CONTROL, the ZG shape: an image on the stage composes the ground and puts no text on it
  const out = run(build("ground-illustage", { files: { "src/content/ui.tsx": UI },
    indexTsx: PAGE(`<Section tone="paper"><IlluStage sheet="var(--hue-3)"><img src="/x.svg" alt="" /></IlluStage></Section>`) }));
  const l = lineOf(out, "hue grounds through a component prop or an inline style");
  expect("[2] reaches a hue ground composed through a component prop", notes(out, "hue grounds through a component prop") &&
    l.includes("1 slot(s) composed (--hue-3 via <IlluStage sheet> (src/content/ui.tsx))") && l.includes("0 pair(s) added"), l);
  expect("and the slot is no longer counted as UNCOMPOSED", !lineOf(out, "declared but UNCOMPOSED").includes("--hue-3"), lineOf(out, "UNCOMPOSED"));
  expect("and the denominator counts it by route", lineOf(out, "AA denominator").includes("1 by a component prop or an inline style"), lineOf(out, "AA denominator"));
  // REGRESSION GUARD, not a control: main scored nothing on this ground at all, so it fails nothing there either
  expect("and nothing fails on that ground", !verdicts(out, "FAIL").some((v) => v.includes("--hue-3")), verdicts(out, "FAIL").join(" | "));
}
{
  // PLANT: text on the stage inherits the dark section's ink, #ffffff on #8a8a8a = 3.45
  const out = run(build("ground-illustage-text", { files: { "src/content/ui.tsx": UI },
    indexTsx: PAGE(`<Section tone="dark"><IlluStage sheet="var(--hue-3)"><p>Zing mee</p></IlluStage></Section>`) }));
  expect("[2] FAILS text inside the stage in the ink it inherits from the section",
    verdicts(out, "FAIL").some((v) => v.includes("--on-dark on --hue-3 [text inside <IlluStage sheet> (src/content/ui.tsx) inherits the section ink, tone=dark") && v.includes("= 3.45")), verdicts(out, "FAIL").join(" | "));
}
{
  // CONTROL: an arrow function in a child's attribute is not text on the stage
  const out = run(build("ground-illustage-arrow", { files: { "src/content/ui.tsx": UI },
    indexTsx: PAGE(`<Section tone="dark"><IlluStage sheet="var(--hue-3)"><img src="/x.svg" alt="" onLoad={() => mark("x")} /></IlluStage></Section>`) }));
  expect("[2] reads an arrow function in a child's attribute as no text on the ground",
    lineOf(out, "hue grounds through a component prop").includes("0 pair(s) added") && !verdicts(out, "FAIL").some((v) => v.includes("--hue-3")), lineOf(out, "hue grounds through"));
}
{
  // PLANT: a colour the component's own body declares on its ground
  const out = run(build("ground-chip", { files: { "src/content/ui.tsx": UI },
    indexTsx: PAGE(`<Section tone="paper"><Chip bg="var(--hue-3)">nieuw</Chip></Section>`) }));
  expect("[2] FAILS the colour a component declares on the ground its prop sets",
    verdicts(out, "FAIL").some((v) => v.includes("--on-dark on --hue-3 [the colour <Chip bg> (src/content/ui.tsx) declares, on hue 3") && v.includes("= 3.45")), verdicts(out, "FAIL").join(" | "));
}
{
  // CONTROL: an inline style background with text on a light section (#111111 on #8a8a8a = 5.47)
  const out = run(build("ground-inline", {
    indexTsx: PAGE(`<Section tone="paper"><div style={{ background: "var(--hue-3)" }}>Hallo</div></Section>`) }));
  expect("[2] scores text on an inline style hue ground and passes it",
    passes(out, "--text on --hue-3 [text inside an inline style background on <div> inherits the section ink, tone=paper") && lineOf(out, "--text on --hue-3 [").includes("= 5.47"), lineOf(out, "--text on --hue-3"));
}
{
  // a gradient is no single colour: named, never scored; a stroke is not a ground, and is counted
  const out = run(build("ground-gradient", { files: { "src/content/ui.tsx": UI },
    indexTsx: PAGE(`<Section tone="dark"><IlluStage sheet="linear-gradient(135deg, var(--hue-3), var(--accent))"><p>t</p></IlluStage><svg><path stroke="var(--hue-3)" /></svg></Section>`) }));
  const l = lineOf(out, "hue grounds through a component prop or an inline style");
  expect("[2] names a gradient ground and scores nothing on it", l.includes("1 ground(s) that are not one flat slot named and not scored") &&
    !verdicts(out, "FAIL").some((v) => v.includes("--hue-3")), l);
  expect("and counts the stroke as a reference it did not place", l.includes("1 of 2 var(--hue-N) reference(s)") && l.includes("src/routes/index.tsx (1)"), l);
}
{
  // FOLD of #25's review, F5. PLANT: a hue ground in a site's own component markup outside src/content
  // and src/routes is not placed, so the line states that scope and counts the markup's references by
  // file as not read. The spine's own markup is not counted (its hue grounds are <Section hue>).
  const out = run(build("ground-outside-scope", { files: {
    "src/components/Banner.tsx": `export const Banner = () => <div style={{ background: "var(--hue-3)" }}>Hallo</div>;\n`,
    "src/components/spine/Hue.tsx": `export const Hue = () => <div style={{ background: "var(--hue-3)" }} />;\n` } }));
  const l = lineOf(out, "hue grounds through a component prop or an inline style");
  expect("[2] counts var(--hue-N) in markup outside src/content and src/routes as not read, by file",
    l.includes("markup elsewhere under src/ outside the spine is not read, 1 var(--hue-N) reference(s) there: src/components/Banner.tsx (1)"), l);
  // REGRESSION GUARD, not a control: #25's head counted no markup outside the scope at all
  expect("and does not count the spine's own markup", !l.includes("spine/Hue.tsx"), l);
  // CONTROL: with no such markup the clause still states the scope, at zero
  const ok0 = lineOf(run(build("ground-in-scope", { files: { "src/content/ui.tsx": UI },
    indexTsx: PAGE(`<Section tone="paper"><IlluStage sheet="var(--hue-3)"><img src="/x.svg" alt="" /></IlluStage></Section>`) })), "hue grounds through");
  expect("and states the scope at zero where there is none", ok0.includes("(src/content, src/routes) placed as a ground") &&
    ok0.includes("not read, 0 var(--hue-N) reference(s) there"), ok0);
}
{
  // an undeclared slot stays inert (S4.6), as it does through a carrier
  const out = run(build("ground-undeclared", { files: { "src/content/ui.tsx": UI },
    indexTsx: PAGE(`<Section tone="dark"><IlluStage sheet="var(--hue-2)"><p>t</p></IlluStage></Section>`) }));
  expect("[2] composes nothing through an undeclared slot", lineOf(out, "hue grounds through a component prop").includes("0 slot(s) composed"), lineOf(out, "hue grounds through"));
}

// ---- C16. R109: [11] a public/ file a built page links reaches the published build byte for byte --
const PDF = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x0a, 0xff, 0xfe, 0x00, 0x80, 0x0a]);
const LINKS = '<!doctype html><html><body><a href="/menu.pdf">Menu</a> <a href="/plans?x=1">Plans</a></body></html>\n';
{
  // CONTROL: the linked copy is the source
  const out = run(build("dist-control", { files: { "public/menu.pdf": PDF, "dist/client/index.html": LINKS, "dist/client/menu.pdf": PDF } }));
  expect("[11] passes a build whose linked public/ file is byte-identical in dist/client",
    passes(out, "1 public/ file(s) linked from 1 built page(s) are byte-identical in dist/client"), lineOf(out, "built page(s)"));
}
{
  // PLANT: the crawl's text rewrite of a linked binary, invalid bytes replaced as a text decode does
  const out = run(build("dist-rewritten", { files: { "public/menu.pdf": PDF, "dist/client/index.html": LINKS,
    "dist/client/menu.pdf": Buffer.from(PDF.toString("utf8"), "utf8") } }));
  expect("[11] FAILS a linked copy that differs from its source, and names it", fails(out, "dist/client copy differs from its public/ source for linked file(s): menu.pdf"), lineOf(out, "linked file(s)"));
}
{
  // FOLD of #25's review, F2. A linked public/ file with no copy at the same path is the build's
  // layout, not the crawl's rewrite (the crawl only writes): named and not compared, never failed
  const out = run(build("dist-absent", { files: { "public/menu.pdf": PDF, "dist/client/index.html": LINKS } }));
  expect("[11] names a linked public/ file with no copy in dist/client and fails nothing",
    notes(out, "linked public/ file(s) with no copy at the same path in dist/client, so not compared: menu.pdf") && !verdicts(out, "FAIL").length,
    lineOf(out, "menu.pdf") + " | " + verdicts(out, "FAIL").join(" | "));
  expect("and its pass line counts only what it compared", passes(out, "0 public/ file(s) linked from 1 built page(s) are byte-identical"), lineOf(out, "built page(s)"));
}
{
  // PLANT: an absent copy beside a rewritten one still FAILS the rewrite, and names the absent one
  const out = run(build("dist-absent-rewritten", { files: { "public/menu.pdf": PDF, "public/kaart.pdf": PDF,
    "dist/client/index.html": LINKS.replace('<a href="/plans', '<a href="/kaart.pdf">Kaart</a> <a href="/plans'),
    "dist/client/kaart.pdf": Buffer.from(PDF.toString("utf8"), "utf8") } }));
  expect("[11] FAILS the rewritten copy beside an absent one", fails(out, "dist/client copy differs from its public/ source for linked file(s): kaart.pdf") &&
    notes(out, "so not compared: menu.pdf"), lineOf(out, "linked file(s)") + " | " + lineOf(out, "not compared"));
}
{
  // CONTROL: a file no page links is not the crawl's to overwrite, and a build plugin may rewrite it
  const out = run(build("dist-unlinked", { files: { "public/menu.pdf": PDF, "public/_headers": "/*\n  X-A: 1\n",
    "dist/client/index.html": LINKS, "dist/client/menu.pdf": PDF, "dist/client/_headers": "/*\n  X-A: 1\n/* /.netlify/functions/server 200\n" } }));
  expect("[11] compares only what a built page links", passes(out, "1 public/ file(s) linked from 1 built page(s)") && !out.includes("_headers"), lineOf(out, "built page(s)"));
}
{
  // CONTROL: the directory read is the one netlify.toml publishes
  const out = run(build("dist-publish", { files: { "netlify.toml": '[build]\n  publish = "dist"\n', "public/menu.pdf": PDF,
    "dist/index.html": LINKS, "dist/menu.pdf": PDF } }));
  expect("[11] reads the directory netlify.toml publishes", passes(out, "are byte-identical in dist (R109)"), lineOf(out, "built page(s)"));
}
{
  // no build to read is UNVERIFIED: a warning locally and a failure under --ci
  const fx = build("dist-none", {});
  expect("[11] warns when there is no publish directory to read", warns(run(fx), "no dist/client to read"), lineOf(run(fx), "dist/client"));
  expect("and fails closed under --ci", fails(run(fx, { args: ["--ci"] }), "no dist/client to read"), lineOf(run(fx, { args: ["--ci"] }), "dist/client"));
}

// ---- C17. W-tier: the tier icon reads its slot's own ink through --tier-ink ---------------------
// The base fixture's --hue-1 (#e6f0ff) is a LIGHT hue that declares --hue-1-ink (#143a6b): the slot's
// own ink clears at 9.89, where --on-dark (#ffffff) reads 1.15. The control composes ONE TierCard on
// hue 1 in the shipped shape; each plant is one mutation that makes the icon fall back to --on-dark
// on that light hue, and each must go red.
const TIER1 = `export const Route = { head: () => ({ title: "Home" }) };
export const Page = () => <Section tone="paper"><TierCard hue={1}>plan</TierCard></Section>;
`;
const BAR1 = '.tier-card[data-hue-bar="1"] { --tier-bar: var(--hue-1, var(--accent)); --tier-ink: var(--hue-1-ink, var(--on-dark)); }';
const ICON = ".tier-card .tier-ico on data-hue-bar=1";
const UNSCORED = "hue carrier slot(s) composed in the markup that [2] could not score on a hue ground";
{
  // GREEN CONTROL: the icon is scored in the slot's own ink, through --tier-ink, and passes
  const out = run(build("tier-ink-control", { indexTsx: TIER1 }));
  expect("[2] scores the tier icon in --hue-1-ink on a light --hue-1 through --tier-ink, and passes",
    passes(out, `--hue-1-ink on --hue-1 [${ICON} (--tier-bar; ink --tier-ink -> --hue-1-ink)] = 9.89`), lineOf(out, `[${ICON}`));
  // REGRESSION GUARD, not a control on its own: main scored nothing on this ground at all
  expect("and scores no --on-dark on that hue", !failsAny(out, "--on-dark on --hue-1"), verdicts(out, "FAIL").join(" | "));
  // GREEN CONTROL for the two plants at the end of this case, and a REGRESSION GUARD (#26's head
  // named no slot at all): a slot it scores is not named unscored
  expect("and names no composed slot it could not score", !out.includes(UNSCORED), lineOf(out, UNSCORED));
}
{
  // PLANT, and a REGRESSION GUARD: the icon paints --on-dark directly, the spine before the W-tier
  // ruling, which main scored the same way
  const out = run(build("tier-ink-hardcoded", { indexTsx: TIER1,
    spineCss: SPINE_CSS.replace("color: var(--tier-ink, var(--on-dark)); }", "color: var(--on-dark); }") }));
  expect("[2] FAILS an icon painted --on-dark on a light hue",
    failsAny(out, `--on-dark on --hue-1 [${ICON} (--tier-bar)] = 1.15`), verdicts(out, "FAIL").join(" | "));
}
{
  // PLANT: the slot's block sets no --tier-ink, so the icon falls back to --on-dark
  const out = run(build("tier-ink-unset", { indexTsx: TIER1,
    spineCss: SPINE_CSS.replace(BAR1, '.tier-card[data-hue-bar="1"] { --tier-bar: var(--hue-1, var(--accent)); }') }));
  expect("[2] FAILS a slot whose block sets no --tier-ink",
    failsAny(out, `--on-dark on --hue-1 [${ICON} (--tier-bar)] = 1.15`), verdicts(out, "FAIL").join(" | "));
}
{
  // PLANT: the skin declares the light hue and no ink, so --tier-ink falls through to --on-dark
  const out = run(build("tier-ink-undeclared", { indexTsx: TIER1, tokens: TOKENS.replace("  --hue-1-ink: #143a6b;\n", "") }));
  expect("[2] FAILS a light hue declared with no ink, and names the fallback route",
    failsAny(out, `--on-dark on --hue-1 [${ICON} (--tier-bar; ink --tier-ink -> --on-dark)] = 1.15`), verdicts(out, "FAIL").join(" | "));
}
{
  // CONTROL: the ground property is read from the slot itself, so a block that sets --tier-ink
  // before --tier-bar is still scored rather than taking --tier-ink for the ground and adding no pair
  const out = run(build("tier-ink-first", { indexTsx: TIER1,
    spineCss: SPINE_CSS.replace(BAR1, '.tier-card[data-hue-bar="1"] { --tier-ink: var(--hue-1-ink, var(--on-dark)); --tier-bar: var(--hue-1, var(--accent)); }') }));
  expect("[2] scores the icon whichever property the slot's block sets first",
    passes(out, `--hue-1-ink on --hue-1 [${ICON} (--tier-bar; ink --tier-ink -> --hue-1-ink)] = 9.89`), lineOf(out, "hue carriers beyond"));
}
// FOLDED from the code review of #26 (F2): the bar and the ink fall back independently, so a skin
// that declares --hue-1-ink and NOT --hue-1 paints that ink on the --accent fallback (#143a6b on
// #b34700, 2.07), a pair the carrier loop cannot score. Each plant must be NAMED in a note, where
// #26's head skipped the slot with no line at all.
{
  // PLANT: the ink declared, the hue not
  const out = run(build("tier-ink-orphan", { indexTsx: TIER1, tokens: TOKENS.replace("  --hue-1: #e6f0ff;\n", "") }));
  expect("[2] names a composed slot whose hue is undeclared and whose block still reads the declared ink",
    notes(out, UNSCORED) && lineOf(out, UNSCORED).includes("data-hue-bar=1 (--hue-1 undeclared; its block still reads the declared --hue-1-ink,"),
    lineOf(out, UNSCORED) || "no such note");
}
{
  // PLANT: the slot's block grounds on a name that is not the slot itself, which the ground match
  // (`var(--hue-N,` or `var(--hue-N)`) reads as no ground at all
  const out = run(build("tier-ink-offslot", { indexTsx: TIER1,
    spineCss: SPINE_CSS.replace(BAR1, '.tier-card[data-hue-bar="1"] { --tier-bar: var(--hue-1-soft, var(--accent)); --tier-ink: var(--hue-1-ink, var(--on-dark)); }') }));
  expect("[2] names a composed slot whose block grounds on no var(--hue-N)",
    notes(out, UNSCORED) && lineOf(out, UNSCORED).includes("data-hue-bar=1 (its block grounds on no var(--hue-1)"),
    lineOf(out, UNSCORED) || "no such note");
}

// ---- C18. R055 (brief S-VC-U1): [3]'s superlative arm by declared register -------------------
// Each fixture is the base site plus ONE copy file under src/content (and, where stated, another
// <html lang>), lent this repo's `typescript` so the arm parses as it does on a real site. A REVIEW
// never fails, so a PLANT here "goes red" by surfacing as a candidate in the [3] REVIEW line, and a
// GREEN CONTROL reads PASS "no superlative candidates". The two MUTANTS are verify.mjs with one
// line replaced, written into this harness's scratch directory: each must find its anchor exactly
// once, so a renamed line fails here rather than leaving the mutant equal to the real checker.
const voiceRoot = (lang) => ROOT_TSX.replace('<html lang="en">', lang === null ? "<html>" : `<html lang="${lang}">`);
const voiceFx = (name, copy, { lang = "en", ts = true, file = "src/content/voice.tsx" } = {}) =>
  build(`voice-${name}`, { ts, rootTsx: voiceRoot(lang), files: { [file]: copy } });
const page = (...paras) => `export const Voice = () => (\n  <section>\n${paras.map((p) => `    <p>${p}</p>\n`).join("")}  </section>\n);\n`;
const candLine = (out) => lineOf(out, "superlative candidates");
// the words one file reports under one arm, or null where that file and arm report nothing
const cands = (out, file, arm) => {
  const item = candLine(out).replace(/^.*?a liability hedge\): /, "").split(" | ").find((s) => s.startsWith(`${file} [${arm}]: `));
  return item ? item.slice(`${file} [${arm}]: `.length) : null;
};
const VOICE_FILE = "src/content/voice.tsx";
const VERIFY_SRC = readFileSync(VERIFY, "utf8");
const mutant = (name, from, to) => {
  const path = join(ROOT, `verify.mutant-${name}.mjs`);
  writeFileSync(path, VERIFY_SRC.replace(from, to));
  return { path, anchored: VERIFY_SRC.split(from).length === 2 };
};
const voiceNotRun = [];
// an assertion that needs the parse: run where `typescript` is installed, named where it is not
const parseExpect = (label, cond, detail) => (TS_DIR ? expect(label, cond, detail) : voiceNotRun.push(label));
if (!TS_DIR && process.env.CI === "true")
  expect("C18 can lend the fixtures this repo's typescript (the workflow runs npm ci first)", false, "no node_modules/typescript at the repo root");
{
  // GREEN CONTROL: the base site's copy carries no candidate, and the arm says what it read
  const out = run(build("voice-control", { ts: true }));
  expect("[3] GREEN CONTROL: the base site reads no superlative candidates", passes(out, "no superlative candidates"), candLine(out));
  expect("[3] names the arm, its register source and the hype list",
    notes(out, 'voice arm=en from <html lang="en"> in src/routes/__root.tsx (primary subtag), plus the hype list'), lineOf(out, "voice arm="));
  expect("[3] states the corpus by its three roots with a per-root count",
    lineOf(out, "voice arm=").includes("corpus: src/content, src/routes and src/components/spine, *.tsx and *.ts, 4 file(s): src/content 1, src/routes 2, src/components/spine 1"),
    lineOf(out, "voice arm="));
  parseExpect("[3] names the extractor it used, the TypeScript parse", lineOf(out, "voice arm=").includes("extractor: TypeScript parse (typescript "), lineOf(out, "voice arm="));
  expect("[3] GREEN CONTROL: a tree the parser reads cleanly names no syntax errors (F6)", !out.includes("parse recovered from syntax errors"), lineOf(out, "voice extractor"));
}
{
  // PLANT: an unlisted English -est word fires under the en arm; one more file moves the corpus count
  const out = run(voiceFx("en-newest", page("The newest way to book a table.")));
  expect("[3] PLANT: an unlisted -est word fires the en arm", cands(out, VOICE_FILE, "en") === "newest", candLine(out));
  expect("and the candidate line is REVIEW, never FAIL", /^\s*REVIEW\s/.test(candLine(out)), candLine(out));
  expect("and the corpus count follows the files", lineOf(out, "voice arm=").includes("5 file(s): src/content 2, src/routes 2, src/components/spine 1"), lineOf(out, "voice arm="));
  expect('[3] the REVIEW line\'s example is the en arm\'s own greeting, "Best wishes" (F8)', candLine(out).includes('("Best wishes" is fine, so is a liability hedge)'), candLine(out));
}
{
  // GREEN CONTROL: each of the eight stop-listed words, in copy, is silent; so are the three
  // context exclusions carried over from the old list
  const copy = page("Send a request, test it, read the digest, and rest.",
    "We take an honest interest in the manifest, and we attest to it.",
    "As best we reasonably can, we follow best practice and best effort, to the best of our knowledge.");
  const out = run(voiceFx("en-stoplist", copy));
  expect("[3] GREEN CONTROL: the eight stop-listed words and the three context exclusions are silent", passes(out, "no superlative candidates"), candLine(out));
  // PLANT: the same copy under a mutant whose stop-list is emptied fires all eight, so it is the
  // list that silences them and not a morphology that never matched them
  const m = mutant("stoplist", 'const VOICE_STOP_EN = ["request", "interest", "honest", "test", "digest", "rest", "manifest", "attest"];', "const VOICE_STOP_EN = [];");
  expect("the stop-list mutant finds its anchor once", m.anchored);
  const got = (cands(run(voiceFx("en-stoplist-mutant", copy), { verify: m.path }), VOICE_FILE, "en") || "").split(", ").map((w) => w.toLowerCase());
  for (const w of ["request", "interest", "honest", "test", "digest", "rest", "manifest", "attest"])
    expect(`[3] PLANT: with the stop-list emptied, "${w}" fires`, got.includes(w), got.join(", "));
}
{
  // PLANT: the four irregulars fire, and a context exclusion does not swallow a promotional use
  const out = run(voiceFx("en-irregular", page("The best CRM, most loved, the least fuss, never the worst.")));
  expect("[3] PLANT: best, most, least and worst fire the en arm", cands(out, VOICE_FILE, "en") === "best, most, least, worst", candLine(out));
}
{
  // the register: en-GB selects en by its PRIMARY subtag (ruled F9)
  const out = run(voiceFx("en-gb", page("The newest way to book a table."), { lang: "en-GB" }));
  expect("[3] en-GB selects the en arm", notes(out, 'voice arm=en from <html lang="en-GB">') && cands(out, VOICE_FILE, "en") === "newest", lineOf(out, "voice arm="));
  expect("and reports no register REVIEW", !out.includes("register: no arm"), lineOf(out, "register:"));
}
const NL = page("De mooiste avond van het jaar.", "Een van de meest toegankelijke manieren om te zingen.",
  "De meeste mensen komen naar het feest.");
{
  // PLANT and GREEN CONTROL in one Dutch fixture: the list and the analytic superlative fire;
  // the quantifier meeste and the noun feest stay silent, the en arm not running under nl
  const out = run(voiceFx("nl", NL, { lang: "nl" }));
  expect("[3] nl selects the nl arm", notes(out, 'voice arm=nl from <html lang="nl">'), lineOf(out, "voice arm="));
  expect("[3] PLANT: the nl arm fires a listed form and meest + adjective", cands(out, VOICE_FILE, "nl") === "mooiste, meest toegankelijke", candLine(out));
  expect("[3] GREEN CONTROL: the quantifier meeste is silent", !/meeste/i.test(candLine(out)), candLine(out));
  expect('[3] the REVIEW line\'s example is the nl arm\'s own greeting, "Beste klant" (F8)', candLine(out).includes('("Beste klant" is fine, so is a liability hedge)'), candLine(out));
  expect("[3] GREEN CONTROL: the en arm does not run under nl, so feest is silent", cands(out, VOICE_FILE, "en") === null && !/feest/i.test(candLine(out)), candLine(out));
  // NEGATIVE CONTROL: verify.mjs with arm selection removed runs every arm on every site, and its
  // English arm fires on the Dutch noun feest (live copy three times in zuidgeluid-site's corpus)
  const m = mutant("no-arm-selection", "const voiceArms = voicePrimary && Object.hasOwn(VOICE_ARMS, voicePrimary) ? [voicePrimary] : [];",
    "const voiceArms = Object.keys(VOICE_ARMS);");
  expect("the arm-selection mutant finds its anchor once", m.anchored);
  const mout = run(voiceFx("nl-mutant", NL, { lang: "nl" }), { verify: m.path });
  expect("[3] NEGATIVE CONTROL: with arm selection removed, the en arm fires on the Dutch fixture's feest",
    (cands(mout, VOICE_FILE, "en") || "").split(", ").includes("feest"), candLine(mout));
}
{
  // PLANT: allerliefste, by the one closed pattern
  const out = run(voiceFx("nl-aller", page("Onze allerliefste leiding."), { lang: "nl" }));
  expect("[3] PLANT: aller...ste fires the nl arm", cands(out, VOICE_FILE, "nl") === "allerliefste", candLine(out));
}
{
  // a hype word fires whatever the arm, and under no arm at all
  const en = run(voiceFx("hype-en", page("An amazing evening.")));
  expect("[3] PLANT: a hype word fires under the en arm", cands(en, VOICE_FILE, "hype") === "amazing", candLine(en));
  const nl = run(voiceFx("hype-nl", page("Een prachtig en hartverwarmend concert, AMAZING."), { lang: "nl" }));
  expect("[3] PLANT: a hype word fires under the nl arm, the two the client measured missing among them",
    cands(nl, VOICE_FILE, "hype") === "prachtig, hartverwarmend, AMAZING", candLine(nl));
}
{
  // no lang: REVIEW and NOT FAIL under --ci (S9.3 is IMPORTANT); [4] is what fails a missing lang
  const out = run(voiceFx("nolang", page("The newest and most amazing way."), { lang: null }), { args: ["--ci"] });
  expect("[3] no lang reports REVIEW register: no arm, under --ci", /^\s*REVIEW\s/.test(lineOf(out, "register: no arm for lang=(none)")), lineOf(out, "register:"));
  expect("and no [3] line FAILs", !verdicts(out, "FAIL").some((l) => /register|voice|superlative/.test(l)), verdicts(out, "FAIL").join(" | "));
  expect("and only the hype list ran", cands(out, VOICE_FILE, "hype") === "amazing" && cands(out, VOICE_FILE, "en") === null && notes(out, "voice arm=none"), candLine(out));
  const none = lineOf(out, "voice arm=none");
  expect('[3] the note says __root hard-sets no lang, and claims neither lang="" nor a primary subtag (F7)',
    none.includes('voice arm=none, src/routes/__root.tsx hard-sets no <html lang="..">, plus the hype list') && !none.includes('lang=""') && !none.includes("primary subtag"), none);
  // a language the arms do not know is the same branch, named
  const fr = run(voiceFx("fr", page("The newest and most amazing way."), { lang: "fr" }));
  expect("[3] an unknown language reports REVIEW register: no arm for lang=fr", /^\s*REVIEW\s/.test(lineOf(fr, "register: no arm for lang=fr")), lineOf(fr, "register:"));
}
{
  // `=> ... <T>` in a .ts: an arrow and a generic, which a regex extractor read as JSX text
  // (aismith-site's forge-intake catalog.ts). Parsed as TS, it carries no copy at all.
  const CATALOG = "type Row = { at: number };\ndeclare function latest<T>(rows: T[]): T[];\n" +
    "export const byDate = <T extends Row>(rows: T[]) => latest(rows) as Array<T>;\n";
  const out = run(voiceFx("arrow-generic", CATALOG, { file: "src/content/catalog.ts" }));
  parseExpect("[3] `=> ... <T>` in a .ts is not copy: the parse reports nothing there", cands(out, "src/content/catalog.ts", "en") === null && passes(out, "no superlative candidates"), candLine(out));
  // PLANT for the same file: under the fallback the identifier reaches the matcher
  const fb = run(voiceFx("arrow-generic-fallback", CATALOG, { file: "src/content/catalog.ts", ts: false }));
  expect("[3] PLANT: under the fallback the same .ts fires on the identifier latest", cands(fb, "src/content/catalog.ts", "en") === "latest", candLine(fb));
}
{
  // module specifiers and non-copy attribute values are markup; a title attribute is copy
  const CARD = 'import Hero from "./biggest-hero";\n' +
    'export const Card = () => <a className="card-newest" href="/latest" data-kind="fastest" title="Our finest work"><Hero />Read</a>;\n';
  const out = run(voiceFx("attrs", CARD));
  parseExpect("[3] the parse drops a module specifier and className, href and data-* values, and keeps a title", cands(out, VOICE_FILE, "en") === "finest", candLine(out));
}
{
  // the parse-absent fallback says so, and still runs the arms
  const out = run(voiceFx("fallback", page("The newest way."), { ts: false }));
  expect("[3] the parse-absent fallback prints its note", notes(out, "voice extractor FALLBACK") && lineOf(out, "voice arm=").includes("extractor: comment-stripped source (FALLBACK)"), lineOf(out, "voice extractor"));
  expect("and the arms still run on the comment-stripped source", cands(out, VOICE_FILE, "en") === "newest", candLine(out));
}
{
  // REGRESSION GUARD, the em-dash half, which this run does not touch: main held no case for it
  const EM = String.fromCharCode(0x2014);
  const lit = run(voiceFx("emdash-literal", page(`Plain copy ${EM} with a dash.`)));
  expect("[3] REGRESSION GUARD: a literal em-dash in copy FAILS", fails(lit, "em-dash(es) in rendered copy"), lineOf(lit, "em-dash"));
  const ent = run(voiceFx("emdash-entity", page("Plain copy &mdash; with a dash.")));
  expect("[3] REGRESSION GUARD: an em-dash entity in copy FAILS", fails(ent, "em-dash(es) in rendered copy"), lineOf(ent, "em-dash"));
  const com = run(voiceFx("emdash-comment", `// a comment ${EM} is exempt\n` + page("Plain copy.")));
  expect("[3] REGRESSION GUARD: an em-dash in a comment passes", passes(com, "no em-dashes in rendered copy"), lineOf(com, "em-dash"));
}
// ---- C18, the fold of #27's review (F1, F3, F5, F6, F8) ----
{
  // F1: a string-literal TYPE is not copy (aismith-site's `toggle<K extends "onRequest" | ...>`),
  // while a string passed as a call argument still is, which no parse can tell from a label: that
  // half is the controller's (a stop-list word, the noise, or re-opening the closed list)
  const TOGGLE = 'declare function toggle<K extends "latest" | "tracks">(k: K): void;\ntype Kind = "fastest" | "plain";\n' +
    'export const flip = (k: Kind) => toggle("newest");\n';
  const out = run(voiceFx("literal-type", TOGGLE, { file: "src/content/toggle.ts" }));
  parseExpect("[3] GREEN CONTROL: a string-literal type is not copy, so latest and fastest are silent (F1)",
    !/latest|fastest/.test(cands(out, "src/content/toggle.ts", "en") ?? ""), candLine(out));
  parseExpect("and a call argument is still read as copy, so newest fires (F1, the controller's half)", cands(out, "src/content/toggle.ts", "en") === "newest", candLine(out));
  // PLANT: the same file under a mutant without the string-literal-type skip fires both types
  const m = mutant("literal-type", "ts.isLiteralTypeNode(n) && ts.isStringLiteral(n.literal)", "false");
  expect("the string-literal-type mutant finds its anchor once", m.anchored);
  const mout = run(voiceFx("literal-type-mutant", TOGGLE, { file: "src/content/toggle.ts" }), { verify: m.path });
  parseExpect("[3] PLANT: with the string-literal-type skip removed, latest and fastest fire (F1)",
    cands(mout, "src/content/toggle.ts", "en") === "latest, fastest, newest", candLine(mout));
}
{
  // F3: a typescript in a directory ABOVE the site's root is not the site's, so the arm takes its
  // fallback there, whatever TMPDIR sits under
  const fx = voiceFx("ts-above-root", page("The newest way."), { ts: false });
  if (TS_DIR) {
    mkdirSync(join(dirname(fx.site), "node_modules"), { recursive: true });
    symlinkSync(TS_DIR, join(dirname(fx.site), "node_modules", "typescript"), "dir");
  }
  const out = run(fx);
  parseExpect("[3] a typescript above the site's root is not borrowed: the fallback runs and says why (F3)",
    lineOf(out, "voice extractor FALLBACK").includes("no node_modules/typescript at the site's root") && lineOf(out, "voice arm=").includes("extractor: comment-stripped source (FALLBACK)"),
    lineOf(out, "voice extractor"));
}
{
  // F5: [3] reads the register with [4]'s own expression, which verify.mjs holds three times ([3],
  // [4], and [4]'s og:locale check); nothing else holds them equal
  const langExprs = (src) => [...src.matchAll(/\.match\((\/<html\\s\+lang=[^\n]*?\/[a-z]*)\)/g)].map((x) => x[1]);
  const got = langExprs(VERIFY_SRC);
  expect("[3] the <html lang> expression is held three times in verify.mjs, all three byte-identical (F5)",
    got.length === 3 && new Set(got).size === 1 && VERIFY_SRC.split("<html\\s+lang=").length === 4, got.join(" | "));
  // NEGATIVE CONTROL: og:locale's copy edited, the same test tells the three apart
  const at = String.raw`const langTag = rootSrc && (rootSrc.match(/<html\s+lang=["']([a-zA-Z-]+)`;
  const drift = VERIFY_SRC.replace(at, at.replace("[a-zA-Z-]+", "[a-z]+"));
  expect("[3] NEGATIVE CONTROL: with og:locale's copy edited, the three are not all equal (F5)",
    VERIFY_SRC.split(at).length === 2 && new Set(langExprs(drift)).size === 2);
}
{
  // F6: the parser does not throw on malformed source, it recovers; the count it recovered from is
  // the note, and the copy it recovered is still read
  const out = run(voiceFx("parse-errors", "export const Voice = () => (\n  <section>\n    <p>The newest way to book.\n  </section>\n);\n"));
  parseExpect("[3] PLANT: a file the parser recovered from is named with its syntax-error count (F6)",
    /^\s*----\s+voice extractor: the parse recovered from syntax errors in src\/content\/voice\.tsx \(\d+\)/.test(lineOf(out, "parse recovered")), lineOf(out, "voice extractor"));
  parseExpect("and the copy it recovered is still read", (cands(out, VOICE_FILE, "en") || "").split(", ").includes("newest"), candLine(out));
}
{
  // F8: each arm's example greeting is a candidate that arm itself reports
  const en = run(voiceFx("greeting-en", page("Best wishes from the team.")));
  expect('[3] PLANT: "Best wishes", the en example, fires the en arm (F8)', cands(en, VOICE_FILE, "en") === "Best", candLine(en));
  const nl = run(voiceFx("greeting-nl", page("Beste klant, welkom."), { lang: "nl" }));
  expect('[3] PLANT: "Beste klant", the nl example, fires the nl arm (F8)', cands(nl, VOICE_FILE, "nl") === "Beste", candLine(nl));
}

// ---- C19. brief siteseed-emdash: [3]'s em-dash half reads every form, not four ------------------
// Each PLANT is the base site plus ONE copy file under src/content holding ONE form, so a red is
// attributable to that form; it goes red by FAILING "em-dash(es) in rendered copy" and naming the
// form it found. Each GREEN CONTROL reads PASS "no em-dashes in rendered copy". The code points are
// written as escapes, so this file stays ASCII.
{
  const emFails = (name, copy, form, label) => {
    const out = run(voiceFx(`emdash-${name}`, page(copy)));
    expect(`[3] PLANT: ${label} FAILS, naming its form`,
      fails(out, "em-dash(es) in rendered copy") && lineOf(out, "em-dash(es)").endsWith(`forms: ${form}`), lineOf(out, "in rendered copy"));
  };
  // leading zeros, decimal and hex
  emFails("zero-dec", "Plain copy &#08212; with a dash.", "&#08212;", "a decimal entity with a leading zero, &#08212;");
  emFails("zeros-hex", "Plain copy &#x0002014; with a dash.", "&#x0002014;", "a hex entity with leading zeros, &#x0002014;");
  // no semicolon, decimal, hex and named
  emFails("nosemi-dec", "Plain copy &#8212 with a dash.", "&#8212", "a decimal entity with no semicolon, &#8212");
  emFails("nosemi-hex", "Plain copy &#X2014 with a dash.", "&#X2014", "a hex entity with no semicolon, &#X2014");
  emFails("nosemi-named", "Plain copy &mdash with a dash.", "&mdash", "a named entity with no semicolon, &mdash");
  // the five lookalikes, literal
  for (const [cp, what] of [["2015", "the horizontal bar"], ["2E3A", "the two-em dash"], ["2E3B", "the three-em dash"],
    ["FE31", "the vertical em dash"], ["FE58", "the small em dash"]]) {
    emFails(`u${cp.toLowerCase()}`, `Plain copy ${String.fromCharCode(parseInt(cp, 16))} with a dash.`, `U+${cp}`, `U+${cp}, ${what}, literal`);
  }
  // and a lookalike's entity forms: named, decimal and hex
  emFails("horbar", "Plain copy &horbar; with a dash.", "&horbar;", "&horbar;, the horizontal bar's named entity");
  emFails("small-dec", "Plain copy &#65112; with a dash.", "&#65112;", "&#65112;, the small em dash in decimal");
  emFails("three-hex", "Plain copy &#x2e3b; with a dash.", "&#x2e3b;", "&#x2e3b;, the three-em dash in hex");
  {
    // the count and the forms over one file holding three forms, the literal named by code point
    const out = run(voiceFx("emdash-three", page(`One ${String.fromCharCode(0xfe58)} two &#08212; three &#8212 four.`)));
    expect("[3] PLANT: three forms in one file FAIL as a count of 3, each form named once",
      lineOf(out, "em-dash(es)").includes("3 em-dash(es) in rendered copy (literal or entity): src/content/voice.tsx; forms: U+FE58, &#08212;, &#8212"),
      lineOf(out, "in rendered copy"));
  }
  {
    // GREEN CONTROL: an en dash, a hyphen and the en dash's entities are none of these
    const out = run(voiceFx("emdash-en-dash", page(`Plain copy ${String.fromCharCode(0x2013)} with an en dash - and &ndash; and &#8211; and &#x2013.`)));
    expect("[3] GREEN CONTROL: an en dash, a hyphen and its entities pass", passes(out, "no em-dashes in rendered copy"), lineOf(out, "in rendered copy"));
  }
  {
    // GREEN CONTROL: a number that only begins with the em dash's digits is another code point
    const out = run(voiceFx("emdash-longer", page("Plain copy &#82120; and &#x20140; and &#x2014a; and &amp;mdash; as text.")));
    expect("[3] GREEN CONTROL: &#82120;, &#x20140;, &#x2014a; and &amp;mdash; pass (a digit after the number ends no match)",
      passes(out, "no em-dashes in rendered copy"), lineOf(out, "in rendered copy"));
  }
  {
    // GREEN CONTROL: a lookalike and a leading-zero entity in comments, which are exempt (S9.4)
    const out = run(voiceFx("emdash-lookalike-comment",
      `// a comment ${String.fromCharCode(0x2015)} is exempt\n/* so is &#08212 */\n` + page("Plain copy.")));
    expect("[3] GREEN CONTROL: a lookalike and an entity in comments pass", passes(out, "no em-dashes in rendered copy"), lineOf(out, "in rendered copy"));
  }
}

// ---- C20. Factory backlog row 1897 (brief siteseed-voice-json): [3] reads src/content/*.json ------
// Each fixture is the base site plus ONE JSON file under src/content holding the case's string. A
// PLANT is a string that exists only in that JSON: a superlative goes red by surfacing under the JSON
// file in the [3] REVIEW line, an em-dash by FAILING and naming the file. A GREEN CONTROL reads PASS
// on both halves. The NEGATIVE CONTROL is verify.mjs with the JSON list emptied, which is main before
// this run: the same plants read PASS there.
const JSON_FILE = "src/content/voice.json";
const json = (v) => JSON.stringify(v, null, 2) + "\n";
const jsonFx = (name, body, opts = {}) => voiceFx(`json-${name}`, body, { file: JSON_FILE, ...opts });
const EMJ = String.fromCharCode(0x2014);
const JSON_SUP = json({ title: "The newest way to book a table." });
const JSON_EM = json({ title: `Plain copy ${EMJ} with a dash.` });
{
  // GREEN CONTROL: no JSON file, and the corpus line still names the JSON half, at zero
  const out = run(build("json-none", { ts: true }));
  expect("[3] the corpus line names the string values of src/content/*.json, at zero where there are none",
    lineOf(out, "voice arm=").includes("src/components/spine 1, and the string values of src/content/*.json, 0 file(s), 0 string(s); matches:"), lineOf(out, "voice arm="));
}
{
  // GREEN CONTROL: a clean JSON file is read and passes both halves; its keys are lookups, not copy,
  // so a superlative key and an em-dash key are silent; numbers and booleans are not strings
  const out = run(jsonFx("control", json({ newest: "A plain line.", [`a${EMJ}b`]: "Plain.", list: ["Plain.", { deep: "Plain too." }], n: 3, ok: true })));
  expect("[3] GREEN CONTROL: a clean JSON file reads no superlative candidates, its keys silent", passes(out, "no superlative candidates"), candLine(out));
  expect("[3] GREEN CONTROL: a clean JSON file reads no em-dash, its keys silent", passes(out, "no em-dashes in rendered copy"), lineOf(out, "in rendered copy"));
  expect("[3] the corpus line counts the JSON file and its four string values beside the *.tsx and *.ts roots",
    lineOf(out, "voice arm=").includes("4 file(s): src/content 1, src/routes 2, src/components/spine 1, and the string values of src/content/*.json, 1 file(s), 4 string(s)"),
    lineOf(out, "voice arm="));
}
{
  // PLANT: a superlative that exists only in a JSON string value surfaces under the JSON file, REVIEW
  const out = run(jsonFx("superlative", JSON_SUP));
  expect("[3] PLANT: a superlative only in src/content/*.json fires the en arm under that file", cands(out, JSON_FILE, "en") === "newest", candLine(out));
  expect("and the candidate line is REVIEW, never FAIL", /^\s*REVIEW\s/.test(candLine(out)), candLine(out));
  // PLANT: a value at depth, inside an array inside an object, is read; the hype list runs on it too
  const deep = run(jsonFx("deep", json({ a: [{ b: { c: "An amazing evening." } }] })));
  expect("[3] PLANT: a string value at depth fires the hype list", cands(deep, JSON_FILE, "hype") === "amazing", candLine(deep));
}
{
  // PLANT: an em-dash only in a JSON string value FAILS and names the file, literal and as a JSON
  // escape, which is the same string once parsed and which no read of the raw text would see
  const lit = run(jsonFx("emdash", JSON_EM));
  expect("[3] PLANT: a literal em-dash only in src/content/*.json FAILS, naming the file and the form",
    fails(lit, "em-dash(es) in rendered copy") && lineOf(lit, "em-dash(es)").includes("src/content/voice.json; forms: U+2014"), lineOf(lit, "in rendered copy"));
  const esc = run(jsonFx("emdash-escape", '{ "title": "Plain copy \\u2014 with a dash." }\n'));
  expect("[3] PLANT: an em-dash written as the JSON escape \\u2014 FAILS as U+2014, the value being read and not the text",
    fails(esc, "em-dash(es) in rendered copy") && lineOf(esc, "em-dash(es)").includes("src/content/voice.json; forms: U+2014"), lineOf(esc, "in rendered copy"));
}
{
  // the JSON half needs no parser: with no typescript the plant still fires and the line still counts
  const out = run(jsonFx("fallback", JSON_SUP, { ts: false }));
  expect("[3] PLANT: under the parse-absent fallback a JSON-only superlative still fires", cands(out, JSON_FILE, "en") === "newest", candLine(out));
  expect("and the corpus line counts its string value", lineOf(out, "voice arm=").includes("src/content/*.json, 1 file(s), 1 string(s)"), lineOf(out, "voice arm="));
}
{
  // a JSON file that does not parse is read as its comment-stripped text, and a note names it
  const out = run(jsonFx("unparsed", '{ "title": "The newest way", }\n'));
  expect("[3] a JSON file that does not parse is named in a note", notes(out, "voice corpus: src/content/voice.json did not parse as JSON"), lineOf(out, "did not parse"));
  expect("and its text is still read, so the plant fires", cands(out, JSON_FILE, "en") === "newest", candLine(out));
}
{
  // SCOPE GUARD: src/content/*.json is the top level, as the row names it; a JSON file in a
  // subdirectory is not in the corpus (the PR body carries the question of reading below it)
  const out = run(jsonFx("subdir", JSON_EM, { file: "src/content/sub/voice.json" }));
  expect("[3] SCOPE GUARD: a JSON file below src/content's top level is not read", passes(out, "no em-dashes in rendered copy") &&
    lineOf(out, "voice arm=").includes("src/content/*.json, 0 file(s), 0 string(s)"), lineOf(out, "voice arm="));
}
{
  // NEGATIVE CONTROL: verify.mjs with the JSON list emptied, which is main before this run, reads
  // both plants as PASS, so it is the JSON read that turns them red
  const m = mutant("no-json", "const copyJson = existsSync(P.content)", "const copyJson = [];\nconst copyJsonUnread = existsSync(P.content)");
  expect("the no-JSON mutant finds its anchor once", m.anchored);
  const sup = run(jsonFx("superlative-mutant", JSON_SUP), { verify: m.path });
  expect("[3] NEGATIVE CONTROL: with the JSON list emptied, the JSON-only superlative reads PASS", passes(sup, "no superlative candidates"), candLine(sup));
  const em = run(jsonFx("emdash-mutant", JSON_EM), { verify: m.path });
  expect("[3] NEGATIVE CONTROL: with the JSON list emptied, the JSON-only em-dash reads PASS", passes(em, "no em-dashes in rendered copy"), lineOf(em, "in rendered copy"));
}
if (voiceNotRun.length) console.log(`  NOT RUN (typescript is not installed here; npm ci installs it): ${voiceNotRun.join(" | ")}`);

rmSync(ROOT, { recursive: true, force: true });
console.log(`\n${pass} assertion(s) passed, ${fail} failed, over ${caseNo} fixture(s).`);
console.log("SCOPE: the three checks added 2026-09-18 (rows 046 ground half, 098, 107), the [8]");
console.log("fill-in branches attacker-2 measured as uncovered, one control, and the checks added");
console.log("2026-10-11 (C7 field edge R121, C8 crumb inks R122, C9 six hue slots R112, C10 non-grounding");
console.log("carriers R120, C11 [10] phone menu R125), and the fold of #24's review (C7 focus edge, C8 accent");
console.log("ground, C10 bare form and sweeps, C11 cascade, C12 [4] link-preview card and og:locale R221), and brief W14");
console.log("(C13 skins and every declared hue slot R110, C14 [5] route paths R111, C15 component hue grounds R063,");
console.log("C16 [11] build output R109), and the fold of #25's review (C13 partial slot pairs F1 and the base slot");
console.log("note F4, C15 the R063 markup scope F5, C16 a linked file with no copy F2), and brief W-tier");
console.log("(C17 the tier icon in its slot's own ink through --tier-ink), and the fold of #26's review (C3 and");
console.log("C17 a composed carrier slot [2] cannot score named in a note, F2).");
console.log("And brief S-VC-U1 (C18 [3] the superlative arm by declared register R055, with three regression guards on its em-dash half),");
console.log("and the fold of #27's review (C18 string-literal types F1, the typescript bound F3, the lang expression's three copies F5,");
console.log("the recovered syntax errors F6, the absent lang F7, each arm's own greeting F8).");
console.log("And brief siteseed-emdash (C19 [3]'s em-dash half: leading-zero and semicolon-less entities, and U+2015,");
console.log("U+2E3A, U+2E3B, U+FE31 and U+FE58 literal and as entities).");
console.log("And brief siteseed-voice-json (C20 [3] reads the string values of src/content/*.json in both halves, Factory backlog row 1897).");
console.log("The sections that predate them are NOT covered.");
if (fail) { console.log("SELF-TEST FAIL"); process.exitCode = 1; }
else console.log("SELF-TEST PASS");

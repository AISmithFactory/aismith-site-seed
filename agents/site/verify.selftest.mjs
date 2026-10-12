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
// EXTENDED 2026-10-12 (brief S-NV U1, plan-nav-variant U1) by the check THAT run added: C17 the nav item
// variant SPOTLIGHT, declared and then enforced (D7). In use is read from the built page, a variant set
// through a constant included; the four slots its rules pair are required as opaque colours; a
// half-declared pair FAILS rather than being skipped; --accent is scored at 3.0 on the hot header's
// ground for the logo's dot and the current-page bar; a skin is scored in its own pass; an unbuilt tree
// is NOT DECIDED; a spine whose rules parse to nothing FAILS; one control parses the SHIPPED spine.css;
// and a MUTANT NEGATIVE CONTROL, the rendered-fact predicate removed, turns the absent-slot plant green.
// Run against the verify.mjs of main before that run, 19 of these 21 assertions FAIL; the two that hold
// there are the fixture's own literal guard and the mutant's green, main carrying no such check at all.
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

import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
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

// ---- the base fixture ------------------------------------------------------------------------
// A minimal site that is quiet on the checks this harness scores. Every negative case below is
// this tree plus exactly one stated mutation.
//
// --on-dark (#ffffff) on --hue-3 (#8a8a8a) is 3.45, which is BELOW 4.5: that is the cell the
// hue-carrier case needs, and it is the cell the tone-keyed and [data-hue] paths cannot reach.
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
.tier-card[data-hue-bar="1"] { --tier-bar: var(--hue-1, var(--accent)); }
.tier-card[data-hue-bar="3"] { --tier-bar: var(--hue-3, var(--accent)); }
.tier-card .tier-ico { width: 46px; height: 46px; background: var(--tier-bar, var(--accent)); color: var(--on-dark); }
` +
// The six-slot families [2] requires (R112), generated one line per slot so a case can drop a slot
// by line: the remaining [data-hue] and data-hue-bar slots, then .em-hue-N and data-hue-tint 1-6.
[2, 4, 5, 6].map((n) =>
  `[data-hue="${n}"] { --sec-bg: var(--hue-${n}, var(--tone-bg)); --sec-text: var(--hue-${n}-ink, var(--tone-text)); --sec-soft: var(--hue-${n}-soft, var(--hue-${n}-ink, var(--tone-soft))); }\n` +
  `.tier-card[data-hue-bar="${n}"] { --tier-bar: var(--hue-${n}, var(--accent)); }\n`).join("") +
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
    put(base, "src/components/spine/index.tsx", mut.spineTsx ?? SPINE_TSX);
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

console.log("verify.selftest -- negative cases for the checks added 2026-09-18 (rows 046 ground half, 098, 107) and 2026-10-11 (R112, R120, R121, R122, R125, R221, the review fold of #24, and R110, R111, R063, R109)\n");

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
  // in --hue-3 and that selector hardcodes `color: var(--on-dark)` = 3.45, a real ink on a real
  // ground that no [data-hue] block and no [data-tone] selector appears in.
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
  expect("a carrier on an undeclared hue slot adds no pair", !out.includes("--hue-2"), lineOf(out, "--hue-2"));
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
  const fx = build("bar-grounds", { spineCss: SPINE_CSS.replace('.tier-card[data-hue-bar="1"] { --tier-bar: var(--hue-1, var(--accent)); }',
    '.tier-card[data-hue-bar="1"] { --tier-bar: var(--hue-1, var(--accent)); background: var(--hue-1); }') });
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

// ---- C17. the nav item variant, SPOTLIGHT (plan-nav-variant U1, D7): declared, then enforced -----
// The fixture spine carries the variant's rules in the shipped spine.css's shape (the item's colour on
// its background-color; the header's colour on the background-color of the :has() holding the item)
// and the two header marks that keep --accent, and its header component writes data-variant. IN USE is
// read from the build, so each case writes the prerendered page it needs under dist/client.
const SPOT_CSS = SPINE_CSS + `.logo .dot { color: var(--accent); }
.nav a.on::after { content: ""; background: var(--accent); }
.nav a[data-variant="spotlight"]:is(:hover, :focus-visible) { color: var(--nav-spotlight-ink, var(--accent-text)); background-color: var(--nav-spotlight-bg, transparent); text-shadow: var(--nav-spotlight-glow, none); }
@media (hover: hover) and (min-width: 901px) {
  .header:has(.nav a[data-variant="spotlight"]:is(:hover, :focus-visible)) { background-color: var(--nav-spotlight-header-bg, var(--bg)); background-image: var(--nav-spotlight-wash, none); }
  .header:has(.nav a[data-variant="spotlight"]:is(:hover, :focus-visible))
    :is(.logo, .member-link, .nav > a, .navitem > a):not([data-variant]) { color: var(--nav-spotlight-header-ink, var(--text)); }
}
.header:has(.nav a[data-variant="spotlight"]) :is(.logo, .member-link, .nav > a, .navitem > a) { transition: none; }
`;
const SPOT_TSX = SPINE_TSX + `export function SiteHeader({ nav }) {
  return <header className="header"><nav className="nav">{nav.map((i) => <a key={i.href} href={i.href} data-variant={i.variant}>{i.label}</a>)}</nav></header>;
}
`;
// the four required slots, every pair clearing: orange on navy 7.52 (the item), gold on night 8.56
// (the hot header), and the fixture's --accent #b34700 on night 3.74 (the dot and the bar)
const SLOTS = { "--nav-spotlight-bg": "#0b0583", "--nav-spotlight-ink": "#ff9f2f",
  "--nav-spotlight-header-bg": "#000020", "--nav-spotlight-header-ink": "#d19e57" };
const withSlots = (slots) => TOKENS.replace("}", Object.entries(slots).map(([k, v]) => `  ${k}: ${v};\n`).join("") + "}");
const BUILT = (variant) => `<!doctype html><html lang="en"><body><header class="header"><nav class="nav"><a href="/">Home</a>` +
  `<a href="/nacht"${variant ? ' data-variant="spotlight"' : ""}>De Nacht</a></nav></header><main id="main"></main></body></html>\n`;
const spot = (name, { slots = SLOTS, built = true, extra = {}, ...mut } = {}) => build(name, { spineCss: SPOT_CSS, spineTsx: SPOT_TSX,
  tokens: withSlots(slots), ...mut, files: { ...(built === null ? {} : { "dist/client/index.html": BUILT(built) }), ...extra } });
const spotFails = (out) => verdicts(out, "FAIL").filter((l) => l.includes("nav variant") || l.includes("--nav-spotlight-"));
const den = (out) => (lineOf(out, "AA denominator").match(/(\d+) pair\(s\) derived, (\d+) asserted/) || []).slice(1).map(Number);
{
  // CONTROL: in use with all four slots declared and clearing. Against the same fixture with the
  // variant on no built page, three more pairs are derived and three more asserted: the two 4.5 pairs
  // and the 3.0 pair, which joins the derived count as ACCENT_LARGE_PAIRS does on this verify.mjs.
  const used = run(spot("spot-control"));
  const [d1, a1] = den(used), [d0, a0] = den(run(spot("spot-control-unused", { built: false })));
  expect("[2] reads the variant IN USE from the built page", notes(used, 'nav variant "spotlight": IN USE on 1 of 1 prerendered page(s)'), lineOf(used, "IN USE"));
  expect("and asserts its three pairs, failing none", passes(used, '--nav-spotlight-ink on --nav-spotlight-bg [nav variant "spotlight": the hot item] = 7.52') &&
    passes(used, "--nav-spotlight-header-ink on --nav-spotlight-header-bg [nav variant \"spotlight\": the hot header's logo, top-level links and member link] = 8.56") &&
    passes(used, "--accent on --nav-spotlight-header-bg [nav variant \"spotlight\": the logo's dot and the current-page bar on the hot header] = 3.74 (>= 3.0 large / non-text)") &&
    !spotFails(used).length, verdicts(used, "PASS").filter((l) => l.includes("spotlight")).join(" | ") + " | " + spotFails(used).join(" | "));
  expect("and three more pairs are derived and three more asserted than with the variant unused", d1 - d0 === 3 && a1 - a0 === 3, `derived ${d0} -> ${d1}, asserted ${a0} -> ${a1}`);
}
{
  // CONTROL, against the SHIPPED spine.css, so the real rules are what parse: the same three pairs.
  // Other lines of the shipped spine are not this case's; only the deltas and the spotlight lines are.
  const real = readFileSync(join(HERE, "../../src/styles/spine.css"), "utf8");
  const used = run(spot("spot-shipped", { spineCss: real }));
  const [d1, a1] = den(used), [d0, a0] = den(run(spot("spot-shipped-unused", { spineCss: real, built: false })));
  expect("the shipped spine.css parses to the same three pairs, each asserted", d1 - d0 === 3 && a1 - a0 === 3 &&
    ["the hot item] = 7.52", "member link] = 8.56", "current-page bar on the hot header] = 3.74"].every((t) => verdicts(used, "PASS").some((l) => l.includes(t))),
    `derived ${d0} -> ${d1}, asserted ${a0} -> ${a1} | ` + verdicts(used, "PASS").filter((l) => l.includes("spotlight")).join(" | "));
}
const { "--nav-spotlight-header-bg": _hb, ...NO_HEADER_BG } = SLOTS;
{
  // PLANT: in use with --nav-spotlight-header-bg absent
  const out = run(spot("spot-no-header-bg", { slots: NO_HEADER_BG }));
  expect("[2] FAILS the variant in use without --nav-spotlight-header-bg, and names it",
    fails(out, "so --nav-spotlight-header-bg is required as an opaque colour in tokens.css, and it is not declared"), spotFails(out).join(" | "));
  expect("and FAILS the header pair as half-declared rather than skipping it",
    failsAny(out, "--nav-spotlight-header-ink on --nav-spotlight-header-bg [nav variant \"spotlight\": the hot header's logo, top-level links and member link] is HALF-DECLARED"), spotFails(out).join(" | "));
}
{
  // PLANT: only --nav-spotlight-header-ink declared, the state the plan's render measured painting
  // gold on the header's own ground at 2.20
  const out = run(spot("spot-ink-only", { slots: { "--nav-spotlight-header-ink": "#d19e57" } }));
  expect("[2] FAILS a half-declared header pair", failsAny(out, "is HALF-DECLARED: --nav-spotlight-header-ink is declared and --nav-spotlight-header-bg is not"), spotFails(out).join(" | "));
  expect("and names each of the three missing slots", ["--nav-spotlight-bg", "--nav-spotlight-ink", "--nav-spotlight-header-bg"].every((s) =>
    fails(out, `so ${s} is required as an opaque colour in tokens.css, and it is not declared`)), spotFails(out).join(" | "));
}
{
  // PLANT: a required slot declared translucent
  const out = run(spot("spot-translucent", { slots: { ...SLOTS, "--nav-spotlight-bg": "rgba(0, 0, 32, .6)" } }));
  expect("[2] FAILS a required slot that is not opaque", fails(out, "so --nav-spotlight-bg is required as an opaque colour in tokens.css, and it is declared translucent"), spotFails(out).join(" | "));
}
{
  // PLANT: --accent under 3.0 on the hot header's ground (#b34700 on navy #0b0583 = 2.80)
  const out = run(spot("spot-accent", { slots: { ...SLOTS, "--nav-spotlight-header-bg": "#0b0583" } }));
  expect("[2] FAILS --accent on the hot header's ground under 3.0, naming the dot and the bar",
    failsAny(out, "--accent on --nav-spotlight-header-bg [nav variant \"spotlight\": the logo's dot and the current-page bar on the hot header] = 2.80 (< 3.0 large / non-text)"), spotFails(out).join(" | "));
}
{
  // PLANT: a skin that lays a light header ground over the base's slots is scored in its own pass
  const out = run(spot("spot-skin", { tokens: withSlots(SLOTS) + SKIN("  --nav-spotlight-header-bg: #ffffff;") }));
  expect("[2] FAILS a skin's own spotlight pair, named by the skin",
    failsAny(out, 'skin "nacht": --nav-spotlight-header-ink on --nav-spotlight-header-bg') && failsAny(out, "= 2.40 (< 4.5"), spotFails(out).join(" | "));
}
{
  // PLANT: content sets the variant through a constant, which tsc passes and a source match on the
  // literal misses; in use is read from the build, so the missing slots still FAIL
  const config = CONFIG + `const V = "spotlight" as const;\nexport const nav = [{ label: "De Nacht", href: "/nacht", variant: V }];\n`;
  const out = run(spot("spot-constant", { slots: {}, config }));
  expect("the fixture's content carries no `variant: \"spotlight\"` literal", !config.includes('variant: "spotlight"'));
  expect("[2] reads a variant set through a constant as in use, and FAILS its missing slots",
    notes(out, 'nav variant "spotlight": IN USE') && fails(out, "so --nav-spotlight-header-bg is required as an opaque colour"), lineOf(out, "nav variant"));
}
{
  // CONTROL: slots declared, the variant on no built page: named, not asserted, nothing fails
  const out = run(spot("spot-unused", { built: false }));
  expect("[2] notes declared slots of an unused variant and asserts none", notes(out, 'nav variant "spotlight" slot(s) declared but not asserted, the variant being in use on no built page') &&
    !spotFails(out).length && !verdicts(out, "PASS").some((l) => l.includes("spotlight")), lineOf(out, "slot(s) declared but not asserted"));
}
{
  // no built page to read is NOT DECIDED: a warning locally and a failure under --ci
  const fx = spot("spot-unbuilt", { built: null, slots: NO_HEADER_BG });
  expect("[2] warns that an unbuilt tree cannot decide the variant", warns(run(fx), "nav variant: no prerendered page in dist/client to read"), lineOf(run(fx), "nav variant"));
  expect("and fails closed under --ci", fails(run(fx, { args: ["--ci"] }), "nav variant: no prerendered page in dist/client to read"), lineOf(run(fx, { args: ["--ci"] }), "nav variant"));
}
{
  // PLANT: the spine writes data-variant and its rules parse to nothing
  const out = run(spot("spot-unparsed", { spineCss: SPINE_CSS }));
  expect("[2] FAILS a spine that writes data-variant with no rule to score", fails(out, "a spine component writes data-variant but spine.css's [data-variant=\"spotlight\"] rules parse to nothing"), lineOf(out, "nav variant"));
}
{
  // CONTROL: a spine that carries no variant at all derives nothing and says so
  const out = run(build("spot-absent", {}));
  expect("[2] notes a spine with no variant and derives no pair", notes(out, "nav variant: the spine carries no data-variant rule and writes none"), lineOf(out, "nav variant"));
}
{
  // MUTANT NEGATIVE CONTROL: verify.mjs with D7(a)'s rendered-fact predicate removed (the variant read
  // as in use on no page), against the absent-slot plant. The plant goes green under it, so it is the
  // predicate, not something else in the fixture, that makes the case fire.
  const src = readFileSync(VERIFY, "utf8"), line = "  const spotlightUsed = using.length > 0;\n";
  expect("the mutant's target line is in verify.mjs exactly once", src.split(line).length === 2);
  const mutant = join(ROOT, "verify-mutant-d7a.mjs");
  writeFileSync(mutant, src.replace(line, "  const spotlightUsed = false;\n"));
  const fx = spot("spot-mutant", { slots: NO_HEADER_BG });
  const out = run(fx, { verify: mutant });
  expect("under the mutant the absent-slot plant goes green", !verdicts(out, "FAIL").length && out.includes("VERIFY: PASS"), verdicts(out, "FAIL").join(" | "));
  expect("and the real verify.mjs fails the same tree", spotFails(run(fx)).length > 0);
}

rmSync(ROOT, { recursive: true, force: true });
console.log(`\n${pass} assertion(s) passed, ${fail} failed, over ${caseNo} fixture(s).`);
console.log("SCOPE: the three checks added 2026-09-18 (rows 046 ground half, 098, 107), the [8]");
console.log("fill-in branches attacker-2 measured as uncovered, one control, and the checks added");
console.log("2026-10-11 (C7 field edge R121, C8 crumb inks R122, C9 six hue slots R112, C10 non-grounding");
console.log("carriers R120, C11 [10] phone menu R125), and the fold of #24's review (C7 focus edge, C8 accent");
console.log("ground, C10 bare form and sweeps, C11 cascade, C12 [4] link-preview card and og:locale R221), and brief W14");
console.log("(C13 skins and every declared hue slot R110, C14 [5] route paths R111, C15 component hue grounds R063,");
console.log("C16 [11] build output R109), and the fold of #25's review (C13 partial slot pairs F1 and the base slot");
console.log("note F4, C15 the R063 markup scope F5, C16 a linked file with no copy F2).");
console.log("And brief S-NV U1 (C17 the nav item variant SPOTLIGHT, declared then enforced, D7).");
console.log("The sections that predate them are NOT covered.");
if (fail) { console.log("SELF-TEST FAIL"); process.exitCode = 1; }
else console.log("SELF-TEST PASS");

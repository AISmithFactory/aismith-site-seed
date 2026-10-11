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

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
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
// --on-dark (#ffffff) on --hue-3 (#8a8a8a) is 3.55, which is BELOW 4.5: that is the cell the
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
  put(site, "src/content/site.config.tsx", CONFIG);
  put(site, "src/routes/__root.tsx", ROOT_TSX);
  put(site, "src/routes/index.tsx", mut.indexTsx ?? INDEX_TSX);
  put(site, "public/sitemap.xml", "<urlset/>\n");
  put(site, "public/robots.txt", "User-agent: *\n");
  if (mut.charterFile !== null) put(site, mut.charterFile ?? "demo-site-charter.md", CHARTER);
  if (mut.workflow !== null) put(site, ".github/workflows/site-verify.yml", mut.workflow ?? WORKFLOW());
  if (mut.brief) put(site, "intake-brief.md", mut.brief);
  return { site, seed };
}

function run(fx, { args = [], env = {} } = {}) {
  const argv = [VERIFY, fx.site, "--seed", fx.seed, ...args];
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

console.log("verify.selftest -- negative cases for the checks added 2026-09-18 (rows 046 ground half, 098, 107) and 2026-10-11 (R112, R120, R121, R122, R125)\n");

// ---- C1. CONTROL: a fully instantiated site fires NONE of the new checks ----------------------
{
  const fx = build("control", { brief: BRIEF(FULL_LANES) });
  const out = run(fx, { args: ["--charter", join(fx.site, "demo-site-charter.md"), "--brief", join(fx.site, "intake-brief.md")] });
  for (const sub of ["SEED_REPO names THIS repository", "field SEED_REF is absent",
                     "is NOT a full 40-character sha", "no such file exists in this repo",
                     "omits the S8 record for lane(s)", "present but incomplete",
                     "HUE_CARRIERS does not name"]) {
    expect(`control is silent on: ${sub}`, !out.includes(sub), lineOf(out, sub));
  }
  expect("control passes the S8 lane record", passes(out, "all 5 intake lanes carry an S8 record"), lineOf(out, "intake lanes"));
  expect("control states what [9] cannot prove", out.includes("THIS CHECK CANNOT PROVE A LANE WAS RUN"));
  expect("control passes both [8] fill-in fields", passes(out, "SEED_REF is a full 40-character sha") && passes(out, "field CHARTER names a file that exists"), lineOf(out, "SEED_REF"));
  expect("control composes no hue, so no carrier pair is added", !out.includes("hue carriers beyond <Section hue>"), lineOf(out, "hue carriers"));
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
  // in --hue-3 and that selector hardcodes `color: var(--on-dark)` = 3.55, a real ink on a real
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
  expect("and the denominator counts the non-text pairs", lineOf(out, "AA denominator").includes("2 non-text pair(s) asserted at 3.0"), lineOf(out, "AA denominator"));
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
  expect("and the accent tone is held out (large display only)", !out.includes("crumb ink .crumb + .crumb a:hover, tone=accent"));
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
  // no phone block to read is UNVERIFIED: a warning locally and a failure under --ci
  const fx = build("phone-menu-noblock", { spineCss: SPINE_CSS.slice(0, SPINE_CSS.indexOf("@media")) });
  expect("[10] warns when no phone block can be read", warns(run(fx), "no media block that hides the desktop .nav"), lineOf(run(fx), "no media block"));
  expect("and fails closed under --ci", fails(run(fx, { args: ["--ci"] }), "no media block that hides the desktop .nav"), lineOf(run(fx, { args: ["--ci"] }), "no media block"));
}

rmSync(ROOT, { recursive: true, force: true });
console.log(`\n${pass} assertion(s) passed, ${fail} failed, over ${caseNo} fixture(s).`);
console.log("SCOPE: the three checks added 2026-09-18 (rows 046 ground half, 098, 107), the [8]");
console.log("fill-in branches attacker-2 measured as uncovered, one control, and the checks added");
console.log("2026-10-11 (C7 field edge R121, C8 crumb inks R122, C9 six hue slots R112, C10 non-grounding");
console.log("carriers R120, C11 [10] phone menu R125). The sections that predate them are NOT covered.");
if (fail) { console.log("SELF-TEST FAIL"); process.exitCode = 1; }
else console.log("SELF-TEST PASS");

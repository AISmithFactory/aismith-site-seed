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
    put(base, "src/styles/spine.css", SPINE_CSS);
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

console.log("verify.selftest -- negative cases for the checks added 2026-09-18 (rows 046 ground half, 098, 107)\n");

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

rmSync(ROOT, { recursive: true, force: true });
console.log(`\n${pass} assertion(s) passed, ${fail} failed, over ${caseNo} fixture(s).`);
console.log("SCOPE: the three checks added 2026-09-18 (rows 046 ground half, 098, 107), the [8]");
console.log("fill-in branches attacker-2 measured as uncovered, and one control. The sections that");
console.log("predate them are NOT covered.");
if (fail) { console.log("SELF-TEST FAIL"); process.exitCode = 1; }
else console.log("SELF-TEST PASS");

#!/usr/bin/env node
// verify.mjs -- the public-site Section-6 gate, standalone. CANONICAL MERGE.
//
// Provenance: the spike-era Section-6 gate (four assertions, as-site-build-agent.md
//   Section 6) HARDENED by the independent Cafe Kamiel audit (verify-vetted.mjs
//   structure) and CORRECTED by the spike rebuttal. Folds proposal item E.
//
// Merge = auditor's hardened structure + the spike's three corrections:
//   auditor: re-derive spine hashes from the seed at RUNTIME (recursive spine scan),
//            stray-stylesheet guard, title uniqueness, bidirectional charter-as-fail,
//            entity em-dashes, accent-tone evaluation, honest SSR note.
//   spike  : (1) accent-as-text uses the 3.0 LARGE threshold (require 4.5 only when an
//                accent section carries small text -- the canonical AS Ember reference
//                skin has --on-dark on Ember = 3.81, which S2.3 sanctions as
//                large-display-only; checking it at 4.5 FALSE-FAILS the reference skin);
//            (2) FAIL CLOSED if no authoritative baseline is found -- never silently
//                fall back to embedded spine constants in CI;
//            (3) do NOT hardcode the aismith.io host in the sitemap check.
//
// This is the AUDIT agent's runnable core (read-only), shared by:
//   - the scaffold agent (its CLAUDE.md runs this before it may report "done"),
//   - CI as a required status check.
// Per as-agent-fleet.md Section 8: build the gate once, share it; never re-encode it.
//
// Zero dependencies. Node 18+. ([3]'s voice arm borrows the SITE's own `typescript` when it
// resolves, and reads the comment-stripped source when it does not.)  Usage:
//   node verify.mjs [repoRoot] --seed <seedRoot> [--charter <file>] [--brief <file>]
//                   [--base <ref>] [--ci]
//   exit 0 = all hard checks pass | exit 1 = a hard check failed
//   exit 2 = INVOCATION error (repoRoot is not a directory). Distinct from 1 on purpose:
//            a run that never looked at the tree has not measured it, and must not be
//            readable as nine findings about it.
//
//   repoRoot is optional and defaults to "." -- but it must be a DIRECTORY. It is taken
//   from the first argv that is neither a flag nor a flag's VALUE.
//
// --seed     authoritative spine source (a checked-out site-seed repo, or a dir
//            holding the canonical spine files). REQUIRED to prove spine integrity.
// --charter  the <slug>-site-charter.md to reconcile routes against (bidirectional).
// --brief    the intake brief to read the as-site-intake-standard.md S8 per-lane record
//            from. OPT-IN: with no --brief, section [9] reports NOT ARMED and fails
//            nothing, because the stamped workflow template passes no such argument and
//            arming a check through a template nobody has cut would red every site.
// --ci       fail-closed mode: a missing seed baseline or unresolvable git base is a
//            HARD FAIL, not a warning. CI must pass --ci.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, basename, dirname, resolve, sep } from "node:path";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";

const args = process.argv.slice(2);
// Flags that CONSUME the next argv. Without this set a flag's VALUE looks like a bare
// positional, and the first bare positional is repoRoot -- so
// `node verify.mjs --charter zuidgeluid-site-charter.md` rooted the entire check at the
// CHARTER FILE, every path below it missed, and the run reported NINE confident FAILs on
// a clean tree. CI was never exposed (it passes `.` first); the documented local
// invocation was. Raised by zuidgeluid-site, 2026-08-04.
const VALUE_FLAGS = new Set(["--seed", "--charter", "--brief", "--base"]);
const consumesNext = new Set();
args.forEach((a, i) => { if (VALUE_FLAGS.has(a)) consumesNext.add(i + 1); });
const ROOT = args.find((a, i) => !a.startsWith("--") && !consumesNext.has(i)) ?? ".";
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };

// The argv fix alone would still let a typo'd or non-existent path through, and the
// failure mode is the dangerous one: a gate that cannot see the tree reports FAILs about
// it in exactly the same shape as a gate that can. Refusing to run is the only honest
// answer, so this is an invocation error (exit 2), not a finding (exit 1).
if (!existsSync(ROOT) || !statSync(ROOT).isDirectory()) {
  console.error(`verify.mjs: repoRoot ${JSON.stringify(ROOT)} is not a directory -- refusing to run.`);
  console.error("Usage: node verify.mjs [repoRoot] --seed <seedRoot> [--charter <file>] [--brief <file>] [--base <ref>] [--ci]");
  process.exit(2);
}
const SEED = flag("--seed");

// THE SEED'S OWN ROLE, added 2026-08-24. ONE TEMPLATE SERVES TWO ROLES AND ONLY ONE OF
// THEM HAS A BASELINE. A site verifies against the seed; the seed IS the baseline and has
// nothing external to verify against, so NO value of SEED_REF lets a seed PR change a
// spine file and then check it. Pointing `.seed` at the PR head would make [1a] and [1b]
// pass by construction, which is a check that cannot fail and therefore cannot find.
//
// So where the repo under test IS the seed, the two spine sections report REVIEW with the
// reason named: never PASS, and never FAIL. review() is the existing severity for "a human
// should look", which is exactly what a spine change with no mechanical baseline needs.
// Nothing else changes: [0] still resolves the baseline, and every other section still
// runs and still gates, which is why SEED_REF must stay set to something resolvable.
//
// THE SIGNAL IS THE WORKFLOW'S OWN ENV, so this costs no new argument and no change to the
// stamped fill-in template: SEED_REPO is declared at workflow level and GITHUB_REPOSITORY
// is set by Actions, so both reach this process. Outside CI neither is set, this is false,
// and a local run behaves exactly as it did before.
//
// AND THE CARVE-OUT IS GRANTED ONLY TO A REPO CANON DECLARES TO BE THE SEED (row 107: "the
// SEED_REPO carve-out has no assertion"). Until now the two lines below granted it to ANY repo
// whose SEED_REPO named itself, so a site that copied its own slug into that env line turned
// [1a] and [1b] from GATES into REVIEW and its workflow still reported green. That is the
// fail-closed-to-no-op conversion as-site-spine-standard.md S8 rule 3 exists to stop, reached by
// a copied env line rather than by a dropped flag; S8 rule 4 states the fact a site author reads
// ("a site's SEED_REPO names AISmithFactory/aismith-site-seed and never itself") and says in
// terms that the ASSERTION half is not written there.
//
// ONE LIST, HERE, AND IT FOLLOWS EXTRA_SPINE's RULE EXACTLY: add a name only after canon declares
// it, never the other way round, because a checker leading its declaration enforces a rule no
// document states. Its sole entry is the repository as-site-spine-standard.md S8 rule 4 names in
// terms (site-contract 1.8.25). [8] INSTANTIATION resolves the same question from the git remote
// and reads THIS constant rather than carrying a second copy of it.
const CANON_SEED_REPOS = ["aismithfactory/aismith-site-seed"];
const isCanonSeed = (repo) => CANON_SEED_REPOS.includes((repo || "").trim().toLowerCase());
const ghRepo = (process.env.GITHUB_REPOSITORY || "").trim().toLowerCase();
const envSeedRepo = (process.env.SEED_REPO || "").trim().toLowerCase();
// Both env values present and equal. A LOCAL run sets neither, so this is false and nothing
// below changes behaviour outside CI, exactly as before.
const SEED_SELF_NAMED = !!(ghRepo && envSeedRepo && ghRepo === envSeedRepo);
const SEED_ROLE = SEED_SELF_NAMED && isCanonSeed(envSeedRepo);
const CHARTER = flag("--charter");
const BRIEF = flag("--brief");
const BASE = flag("--base");
const CI = args.includes("--ci") || process.env.CI === "true";

// EXTRA SPINE PATHS -- files declared SEED-SPINE that live OUTSIDE the spine layer's two
// directories. The baseline was `src/components/spine/**` + `spine.css` and nothing else,
// so a file that is spine by classification but not by location could not be covered no
// matter what canon declared. `src/router.tsx` is the first: 18 lines of TanStack Start
// router wiring with no per-site surface at all, declared SEED-SPINE in
// as-site-seed-spine.md's file manifest (site-contract 1.8.19). Add a path here ONLY after
// canon declares it, never the other way round -- a baseline that leads the declaration is
// a gate enforcing a rule no document states.
const EXTRA_SPINE = ["src/router.tsx"];

const P = {
  tokens: join(ROOT, "src/styles/tokens.css"),
  spineCss: join(ROOT, "src/styles/spine.css"),
  spineDir: join(ROOT, "src/components/spine"),
  stylesDir: join(ROOT, "src/styles"),
  content: join(ROOT, "src/content"),
  routes: join(ROOT, "src/routes"),
  root: join(ROOT, "src/routes/__root.tsx"),
  config: join(ROOT, "src/content/site.config.tsx"),
  sitemap: join(ROOT, "public/sitemap.xml"),
  robots: join(ROOT, "public/robots.txt"),
};

let hardFail = false;
const out = [];
const ok = (m) => out.push(`  PASS  ${m}`);
const bad = (m) => { out.push(`  FAIL  ${m}`); hardFail = true; };
// THREE severities, and the distinction is load-bearing (site-contract 1.8.8).
//
//   bad()    a proven violation. Always fails.
//   soft()   COULD NOT VERIFY -- a missing seed, base or charter. Fails CLOSED in CI,
//            because an unverifiable gate that passes is worse than one that fails.
//   review() A HUMAN SHOULD LOOK. Never fails, in CI or out.
//
// review() exists because soft() was doing both jobs under one name, and the superlative
// check -- whose own message says "review" and carries an example of an acceptable hit --
// was wired to it. In CI there is no human, so a check that asks for judgement can only
// ever block. That made [3] VOICE a permanent blocker on aismith-site for two hits that
// were both false positives, one of them a liability hedge in the terms page. A check
// that cannot be satisfied mechanically is not a gate; it is a report.
const soft = (m) => { out.push(`  ${CI ? "FAIL" : "WARN"}  ${m}`); if (CI) hardFail = true; };
const review = (m) => out.push(`  REVIEW  ${m}`);
const note = (m) => out.push(`  ----  ${m}`);

function walk(dir, exts) {
  if (!existsSync(dir)) return [];
  const found = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) found.push(...walk(p, exts));
    else if (!exts || exts.some((x) => p.endsWith(x))) found.push(p);
  }
  return found;
}
const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);
const sha = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 16);
const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

// == 0. BASELINE RESOLUTION (FAIL CLOSED -- spike correction 2) ==
// Re-derive the authoritative spine file set + hashes from the SEED at runtime.
// Never trust pasted/embedded constants. If the seed cannot be resolved, fail
// closed in CI (do not assume the spine is fine).
out.push("\n[0] BASELINE -- authoritative spine re-derived from the seed at runtime; SEED_REPO provenance asserted");
let seedSpine = null; // map relPathUnderSpineLayer -> sha
function spineFilesUnder(rootDir) {
  // recursive scan: every file under src/components/spine + the single spine.css
  const map = {};
  const compDir = join(rootDir, "src/components/spine");
  for (const f of walk(compDir, null)) map[relative(rootDir, f).replace(/\\/g, "/")] = sha(readFileSync(f));
  const css = join(rootDir, "src/styles/spine.css");
  if (existsSync(css)) map["src/styles/spine.css"] = sha(readFileSync(css));
  for (const rel of EXTRA_SPINE) {
    const p = join(rootDir, rel);
    if (existsSync(p)) map[rel] = sha(readFileSync(p));
  }
  return map;
}
if (SEED && existsSync(SEED)) {
  seedSpine = spineFilesUnder(SEED);
  const n = Object.keys(seedSpine).length;
  if (!n) { (CI ? bad : soft)(`--seed ${SEED} resolved but holds no spine files`); }
  else ok(`spine baseline re-derived from --seed (${n} files hashed at runtime)`);
} else {
  // FAIL CLOSED in CI. No embedded-constant fallback, ever.
  (CI ? bad : soft)(`no authoritative spine baseline (--seed missing/unresolvable); ` +
    `${CI ? "failing closed (CI)" : "byte-for-byte spine check skipped -- pass --seed to enforce"}`);
}
// (b) SEED_REPO PROVENANCE -- the assertion half of as-site-spine-standard.md S8 rule 4, which
// states the fact and says in terms that the assertion is not written there. A site whose
// SEED_REPO names its own repository has disabled two spine gates while its workflow still
// reports green, so this is a hard FAIL that names the field rather than a review line: the whole
// defect is that the surface reads green, and a severity a reader can skip reproduces it.
if (SEED_SELF_NAMED && !SEED_ROLE) {
  bad(`SEED_REPO names THIS repository (${envSeedRepo}) and canon does not declare it the seed: a ` +
      `site's SEED_REPO names the canon-declared seed and never itself (as-site-spine-standard.md ` +
      `S8 rule 4). Pointed at itself, the seed-role carve-out would turn [1a] and [1b] from GATES ` +
      `into REVIEW and this run would still report green. Set SEED_REPO to ${CANON_SEED_REPOS.join(" or ")} ` +
      `in the gate workflow.`);
} else if (SEED_ROLE) {
  ok(`SEED_REPO names this repository AND canon declares it the seed (${envSeedRepo}), so the S8 ` +
     `rule 4 carve-out applies here and [1a]/[1b] report REVIEW rather than PASS`);
} else if (ghRepo && envSeedRepo) {
  ok(`SEED_REPO (${envSeedRepo}) is not this repository (${ghRepo})`);
} else {
  // A LOCAL run sets neither variable, and that is not a finding about the site. Saying WHICH of
  // the two is missing keeps a green local run from being read as a cleared assertion.
  note(`SEED_REPO provenance not evaluated from the environment: ${!ghRepo ? "GITHUB_REPOSITORY" : "SEED_REPO"} ` +
       `is unset (a local run sets neither). [8] INSTANTIATION resolves the same question from the ` +
       `git remote and the workflow's declared value instead`);
}

// == 1. SCOPED DIFF + SPINE INTEGRITY ==
out.push("\n[1] SCOPED DIFF -- instance layer only; spine byte-for-byte vs seed");
// (a) git diff against a base, if we have one (fail-closed in CI if unresolvable)
let base = BASE;
if (!base) {
  try { base = execSync("git merge-base origin/main HEAD", { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { base = null; }
}
if (base) {
  try {
    const changed = execSync(`git diff --name-only ${base}...HEAD`, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] })
      .toString().trim().split("\n").filter(Boolean);
    const spineTouched = changed.filter((f) => f.includes("src/components/spine/") || f.endsWith("src/styles/spine.css") || EXTRA_SPINE.some((x) => f.replace(/\\/g, "/").endsWith(x)));
    if (spineTouched.length) {
      // #150: a SANCTIONED Trigger-1 resync is exactly "spine changed vs parent", and [1b]
      // proves byte-identity with the sha-pinned seed in this same run. Rule: [1a] passes iff
      // spine is unchanged vs the parent OR every touched spine file is byte-identical to the
      // pinned seed (definitionally a resync, not a local edit). A touched file matching
      // neither parent nor seed stays a hard FAIL. No new inputs; no weakening of the guard.
      const rel = (f) => {
        const n = f.replace(/\\/g, "/");
        const hit = EXTRA_SPINE.find((x) => n.endsWith(x));
        return hit || n.replace(/^.*?(src\/(components\/spine|styles)\/)/, "$1");
      };
      const notSeed = seedSpine
        ? spineTouched.filter((f) => {
            const r = rel(f);
            const p = join(ROOT, r);
            return !(r in seedSpine) || !existsSync(p) || sha(readFileSync(p)) !== seedSpine[r];
          })
        : spineTouched; // no seed baseline resolvable: keep the old fail-closed behaviour
      if (SEED_ROLE) review(`spine changed vs ${base} in the SEED repo itself (${spineTouched.length} file(s)): there is no external baseline for this repo, so [1a] is NOT DECIDABLE here and is not reported as a pass. A human reviews the change: ${spineTouched.join(", ")}`);
      else if (notSeed.length) bad(`spine files changed vs ${base} and differ from the pinned seed (local edit, not a resync): ${notSeed.join(", ")}`);
      else ok(`spine changed vs ${base} but byte-identical to the pinned seed (sanctioned resync, ${spineTouched.length} files)`);
    }
    else ok(`git diff vs ${base}: no spine path changed (${changed.length} files touched)`);
  } catch { (CI ? bad : soft)("git diff failed; relying on static + hash checks"); }
} else {
  (CI ? bad : soft)("no git base resolvable (pass --base <ref>); relying on static + hash checks");
}
// (b) spine byte-for-byte vs the seed baseline (recursive). Auditor hardening.
if (seedSpine && SEED_ROLE) {
  review(`spine byte-for-byte vs seed is NOT DECIDABLE in the SEED repo: the baseline resolved is the pre-PR state of this same repo, so a correct spine change reads here as a mismatch. Not a pass and not a failure; the change is reviewed by a human.`);
} else if (seedSpine) {
  const built = spineFilesUnder(ROOT);
  const mism = [], missing = [], extra = [];
  for (const [rel, h] of Object.entries(seedSpine)) {
    if (!(rel in built)) missing.push(rel);
    else if (built[rel] !== h) mism.push(rel);
  }
  for (const rel of Object.keys(built)) if (!(rel in seedSpine) && !EXTRA_SPINE.includes(rel)) extra.push(rel);
  if (mism.length) bad(`spine differs from seed (edited per site -- S3.2 violation): ${mism.join(", ")}`);
  if (missing.length) bad(`spine files missing from build: ${missing.join(", ")}`);
  if (extra.length) bad(`extra files under spine/ not in seed (stray spine file): ${extra.join(", ")}`);
  if (!mism.length && !missing.length && !extra.length) ok(`spine byte-for-byte identical to seed (${Object.keys(seedSpine).length} files)`);
}
// (c) tokens.css is variables-only (S2.2 -- no per-site structural CSS)
const tokens = read(P.tokens);
if (!tokens) bad("src/styles/tokens.css not found");
else {
  const blocks = [...stripComments(tokens).matchAll(/([^{};]+)\{/g)].map((m) => m[1].trim().split("\n").pop().trim());
  const illegal = blocks.filter((sel) => sel && !/^:root$/.test(sel) && !/^@media/.test(sel) && !/:root\s*$/.test(sel));
  if (illegal.length) bad(`tokens.css declares non-:root rules (spine styling belongs in spine.css): ${illegal.slice(0, 5).join(" | ")}`);
  else ok("tokens.css is variables-only (no component selectors)");
}
// (d) no raw hex colour literals in content/routes (S2.2 -- semantic tokens only)
const colourLeak = [];
for (const f of [...walk(P.content, [".tsx", ".ts"]), ...walk(P.routes, [".tsx", ".ts"])]) {
  const body = stripComments(read(f) || "");
  if (/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/.test(body)) colourLeak.push(relative(ROOT, f));
}
if (colourLeak.length) bad(`raw hex colour in content/routes (use semantic tokens): ${colourLeak.join(", ")}`);
else ok("no raw hex colour literals in content/routes");
// (d2) no UNDECLARED var(--x) in content/routes (S2.2 -- #123: an undefined custom
// property resolves to the initial value and renders wrong SILENTLY -- the ZG
// black-illustration incident. Stronger than the hex check: an undeclared var()
// cannot render as intended.) Allowed vocabulary = every --name declared in
// tokens.css, plus every --name the spine itself declares or reads as an optional
// slot (var(--x, fallback)) -- collected from the seed spine, so the sanctioned
// slot set never has to be hand-listed here.
{
  const declared = new Set();
  const collectDecls = (css) => { for (const m of stripComments(css || "").matchAll(/(--[\w-]+)\s*:/g)) declared.add(m[1]); };
  collectDecls(tokens);
  const spineCssFiles = [];
  for (const dir of [join(ROOT, "src/styles"), join(ROOT, "src/components/spine")])
    for (const f of walk(dir, [".css"])) spineCssFiles.push(f);
  for (const f of spineCssFiles) {
    const css = stripComments(read(f) || "");
    collectDecls(css);
    // optional slots: a var() WITH a fallback declares the slot name as sanctioned
    for (const m of css.matchAll(/var\(\s*(--[\w-]+)\s*,/g)) declared.add(m[1]);
  }
  const offenders = new Map();
  for (const f of [...walk(P.content, [".tsx", ".ts", ".css"]), ...walk(P.routes, [".tsx", ".ts"])]) {
    const body = stripComments(read(f) || "");
    const badNames = new Set();
    for (const m of body.matchAll(/var\(\s*(--[\w-]+)\s*[,)]/g))
      if (!declared.has(m[1])) badNames.add(m[1]);
    if (badNames.size) offenders.set(relative(ROOT, f), [...badNames]);
  }
  if (offenders.size) {
    for (const [f, names] of offenders)
      bad(`undeclared custom property in content/routes (renders as the initial value): ${f} -> ${names.join(", ")}`);
  } else ok("every var(--x) in content/routes is declared (tokens.css or spine slot)");
}
// (e) stray-stylesheet guard (auditor hardening): only spine.css + tokens.css exist
const styleFiles = walk(P.stylesDir, [".css"]).map((f) => basename(f));
const stray = styleFiles.filter((n) => n !== "spine.css" && n !== "tokens.css");
if (stray.length) bad(`stray stylesheet(s) under src/styles (only spine.css + tokens.css allowed): ${stray.join(", ")}`);
else ok("no stray stylesheets (spine.css + tokens.css only)");

// == 2. AA MATRIX (spike correction 1: accent at 3.0 large, gated on accentUses) ==
out.push("\n[2] AA MATRIX -- normal text 4.5; accent-as-text 3.0 (large), 4.5 only if small text; field edge 3.0 (non-text)");
function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }
function L(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((x) => x + x).join("");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
const cr = (fg, bg) => { const a = L(fg), b = L(bg), hi = Math.max(a, b), lo = Math.min(a, b); return (hi + 0.05) / (lo + 0.05); };
function parseTokens(css) {
  const map = {};
  for (const m of (css || "").matchAll(/(--[\w-]+)\s*:\s*(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}))\s*;/g)) map[m[1]] = m[2];
  return map;
}
// TRANSLUCENT tokens -- rgba(...) and 8-digit #RRGGBBAA -- parsed SEPARATELY, then
// FLATTENED over whichever ground the pair puts them on. Raised 2026-08-27 (seed PR #17).
//
// WHY THIS EXISTS. parseTokens above read hex only, so every rgba() token dropped out of
// `T` and the `if (!T[fg]) continue` guard downstream skipped its pair WITHOUT SAYING SO.
// On this seed that is --on-dark-soft: rgba(248, 245, 239, .82), the soft ink on BOTH dark
// tones, so two of the derived pairs were never asserted and the run still printed a clean
// matrix. The 1824 round measured exactly those pairs BY HAND (AS 10.74 and 8.93, ZG 4.75
// and 7.81) because the gate could not, which is the shape of a denominator nobody states.
//
// AND THE 8-DIGIT HEX CASE WAS WORSE THAN THE rgba ONE. The old pattern matched
// #[0-9a-fA-F]{3,8}, so #RRGGBBAA landed in `T` as an opaque colour and L() sliced the
// first six digits and DISCARDED the alpha -- an asserted ratio against a colour the
// browser never paints. A silent skip is a gap; a confident wrong number is a defect.
// Eight-digit values route here instead, where the alpha is honoured.
//
// THE FLATTEN IS NOT INVENTED HERE: the mapping profile's Rule B already states that a
// translucent ink is evaluated composited over its ground, which is also what a browser
// does. Source-over, no blend mode: out = a*fg + (1-a)*bg per channel.
// A translucent GROUND is still skipped and NAMED, because it composites over whatever
// sits behind the section and this gate cannot see that.
function parseAlphaTokens(css) {
  const map = {};
  for (const m of (css || "").matchAll(/(--[\w-]+)\s*:\s*rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*[,/]?\s*([\d.]*)\s*\)\s*;/g))
    map[m[1]] = { r: +m[2], g: +m[3], b: +m[4], a: m[5] === "" ? 1 : +m[5] };
  for (const m of (css || "").matchAll(/(--[\w-]+)\s*:\s*#([0-9a-fA-F]{8})\s*;/g)) {
    const h = m[2];
    map[m[1]] = { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16),
                  b: parseInt(h.slice(4, 6), 16), a: parseInt(h.slice(6, 8), 16) / 255 };
  }
  return map;
}
// EACH SKIN BLOCK IS SCORED AS ITS OWN MAP (R110). parseTokens and parseAlphaTokens each fill ONE
// map, and they ran over the whole file, so a second block went into the same map as the first and
// the LATER value of each token won. tokens.css admits a second skin as a selector ending in `:root`
// ([1c]), written `[data-skin="x"]:root`: sz-site's Nacht skin sat in one flat map with the group's
// own look, the file's ORDER decided which of the two [2] scored, and the other had an AA record in
// docs/skin-contrast.md and in nothing here.
//
// So the BASE is every block whose selector is a `:root` with no `data-skin` in it, and each
// `[data-skin="x"]...:root` block is a SKIN, scored as its own map laid over the base the way the
// cascade lays it: the skin's selector outranks `:root` by specificity, so a token the skin declares
// replaces the base value wherever the two blocks sit in the file. A colour token the skin declares
// with a value [2] cannot read (neither hex nor rgba) is DROPPED from that skin's map and named,
// because scoring the base value there is a confident number for a colour the browser does not
// paint. The base pass prints as it always has; a skin's pass prints only the lines that DIFFER from
// it, each prefixed with the skin, and then one line with that skin's own denominator.
const TOKEN_BLOCKS = (() => {
  const base = [], skins = new Map();   // skin name -> { selector, bodies }, in file order
  for (const m of stripComments(tokens || "").matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const part of m[1].split(",").map((s) => s.trim())) {
      if (!/:root$/.test(part)) continue;
      const skin = part.match(/\[data-skin(?:\s*=\s*["']?([\w-]+)["']?)?\s*\]/);
      if (!skin) { base.push(m[2]); continue; }
      const name = skin[1] || part;
      if (!skins.has(name)) skins.set(name, { selector: part, bodies: [] });
      skins.get(name).bodies.push(m[2]);
    }
  }
  return { base: base.join("\n"), skins };
})();
const BASE_T = parseTokens(TOKEN_BLOCKS.base);
const BASE_TA = parseAlphaTokens(TOKEN_BLOCKS.base);
function skinMaps(css) {
  const T = { ...BASE_T }, TA = { ...BASE_TA }, ownT = parseTokens(css), ownTA = parseAlphaTokens(css);
  const declared = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  const unread = [];
  for (const name of declared) {
    if (!(name in ownT) && !(name in ownTA) && (name in T || name in TA)) unread.push(name);
    delete T[name];
    delete TA[name];
  }
  return { T: Object.assign(T, ownT), TA: Object.assign(TA, ownTA), declared, unread };
}
// THE MATRIX, AS A FUNCTION OF THE SKIN. Everything from here to its closing brace is the [2] that
// ran once over the flat map; it now runs once for the base and once for each skin, with the
// reporters passed in so a skin's lines can carry its name.
function aaMatrix(T, TA, { ok, bad, soft, note }) {
  const hexOf = (n) => "#" + [n.r, n.g, n.b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
  function flattenOver(name, groundHex) {
    const c = TA[name];
    if (!c || !groundHex) return null;
    let g = groundHex.replace("#", "");
    if (g.length === 3) g = g.split("").map((x) => x + x).join("");
    const gr = parseInt(g.slice(0, 2), 16), gg = parseInt(g.slice(2, 4), 16), gb = parseInt(g.slice(4, 6), 16);
    return hexOf({ r: c.a * c.r + (1 - c.a) * gr, g: c.a * c.g + (1 - c.a) * gg, b: c.a * c.b + (1 - c.a) * gb });
  }
  // Resolve one side of a pair to a hex the contrast maths can take. An opaque token answers
  // as itself; a translucent one is flattened over the ground it is being checked against.
  const resolveColour = (name, groundHex = null) =>
    T[name] ?? (groundHex ? flattenOver(name, groundHex) : null);
  // The set of tokens a pair referenced and this gate could NOT resolve, reported by name at
  // the end of [2]. A skip nobody can see is the whole defect above.
  const skippedTokens = new Set();
  let flattenedPairs = 0;
  // Normal body-text pairs -- must clear 4.5.
  //
  // GENERATED, NOT ENUMERATED (v0.13.9). This was a hardcoded list of 15 tone pairs while
  // S2.3 said "the full matrix", and the gap between those two sentences shipped a live
  // 1.55:1 on zuidgeluid.be. A Section sets `tone` and `hue` INDEPENDENTLY: the ground comes
  // from the hue, the ink still comes from the tone. So `tone="slate" hue={3}` renders a
  // dark-register ink on a light hue ground -- a pair that appeared in no list, because
  // S2.3 owned text x tone, S4.6 owned hue x hue-ink, and neither owned the product.
  // Enumerating cannot express a cross-product; discovering the declared hues can.
  // DERIVED FROM spine.css's [data-tone=...] BLOCKS, not enumerated (site-contract 1.8.24,
  // plan-site-1824-2026-08-27.md M3). The tone map is the thing that decides which ink lands
  // on which ground, so it is the operand; a second copy of it here is a copy that decays.
  // It already had: TONE_GROUNDS named `--slate`, which NO tokens.css declares (the map says
  // `--dark-alt`), so the three slate pairs it listed were silently skipped by the `if (T[bg])`
  // guard downstream and the checker reported OK on a matrix it was not checking.
  //
  // THE PARSER ANCHORS ON THE OPENING BRACE. Contract 1.8.23's E0 split every [data-tone]
  // block across two lines, so a single-line pattern no longer matches: take everything from
  // the brace to the closing brace and read the declarations out of that.
  //
  // THE ACCENT TONE IS DERIVED BUT EXCLUDED FROM THE 4.5 LIST, and that is not a scope
  // judgement: S2.3/S4.3 make accent-as-background large-display-only, and the block further
  // down already checks --on-dark on --accent at the 3.0 threshold. Including it here would
  // assert 4.5 on a pair the standard puts at 3.0.
  const TONE_BLOCKS = (() => {
    const css = stripComments(read(P.spineCss) || "");
    const out = {};
    for (const m of css.matchAll(/\[data-tone=["']?(\w+)["']?\]\s*\{/g)) {
      const start = m.index + m[0].length;
      const end = css.indexOf("}", start);
      if (end < 0) continue;
      const body = css.slice(start, end);
      const decl = (name) => {
        const d = body.match(new RegExp("--" + name + "\\s*:\\s*var\\(\\s*(--[\\w-]+)"));
        return d ? d[1] : null;
      };
      out[m[1]] = { bg: decl("sec-bg"), text: decl("sec-text"), soft: decl("sec-soft"), accent: decl("tone-accent") };
    }
    return out;
  })();
  if (!Object.keys(TONE_BLOCKS).length) bad("tone map: no [data-tone] blocks parsed out of spine.css (the derivation below is empty)");

  const ACCENT_TONE = "accent";   // checked at 3.0 by the accent-as-background block below
  const TONE_GROUNDS = [...new Set(Object.values(TONE_BLOCKS).map((b) => b.bg).filter(Boolean))];
  const TONE_INKS = Object.fromEntries(Object.entries(TONE_BLOCKS).map(
    ([tone, b]) => [tone, [...new Set([b.text, b.soft, b.accent].filter(Boolean))]]));
  const NORMAL_PAIRS = [];
  for (const [tone, b] of Object.entries(TONE_BLOCKS)) {
    if (tone === ACCENT_TONE || !b.bg) continue;
    for (const ink of TONE_INKS[tone]) NORMAL_PAIRS.push([ink, b.bg]);
  }
  note(`tone map derived from spine.css: ${Object.keys(TONE_BLOCKS).length} tone(s), ` +
       `${TONE_GROUNDS.length} ground(s), ${NORMAL_PAIRS.length} base pair(s) ` +
       `(${ACCENT_TONE} tone held for the 3.0 check)`);
  // The tone x hue cells that ACTUALLY OCCUR, read from the markup -- not every arithmetic
  // pair. A blind cross-product of six inks x five hues yields 19 "failures" on ZG where two
  // are real, and a checker that fires where there is no defect trains people to ignore it,
  // which lands in the same place as one that checks nothing. So: find every Section that
  // sets BOTH tone and hue, and check exactly the inks that tone puts on that hue's ground.
  // A site that never combines them generates zero extra pairs; an undeclared hue is inert.
  const composed = new Set();
  for (const f of [...walk(P.content, [".tsx"]), ...walk(P.routes, [".tsx"])]) {
    const src = stripComments(read(f) || "");
    for (const tag of src.matchAll(/<Section\b[^>]*>/g)) {
      const t = tag[0].match(/tone\s*=\s*["'`](\w+)["'`]/);
      const h = tag[0].match(/hue\s*=\s*\{?\s*["'`]?(\d+)/);
      if (!h) continue;                       // no hue -- the tone matrix already covers it
      const tone = t ? t[1] : "paper";        // no tone -- the default light register
      composed.add(`${tone}|${h[1]}`);
    }
  }
  // THE HUE BLOCK, READ AS THE OPERAND IT IS (site-contract 1.8.24 M3's own lesson, applied
  // one level down; backlog rows of 2026-08-27). M3 stopped ENUMERATING the pair list and
  // derived it from the tone map. The loop that replaced it still derived the composed cell's
  // INKS from the tone -- and on a hue ground the hue block has already REPLACED --sec-text,
  // --sec-soft and --sec-accent. So the gate asserted tokens the browser does not paint
  // there: measured 2026-08-27 on zuidgeluid-site with all five --hue-N-accent slots
  // declared, `[2]` still reddened `--on-dark on --hue-3 = 2.06` (the TONE's main text token,
  // which [data-hue] overrides) and exit 1 did not move. A red nobody can act on and a render
  // nobody can trust are the same defect twice.
  //
  // So the inks for a composed cell are RESOLVED THROUGH THE HUE BLOCK'S OWN FALLBACK CHAIN
  // against the skin, exactly as the cascade resolves them.
  const HUE_BLOCKS = (() => {
    const css = stripComments(read(P.spineCss) || "");
    const out = {};
    for (const m of css.matchAll(/\[data-hue=["']?(\d+)["']?\]\s*\{/g)) {
      const start = m.index + m[0].length;
      const end = css.indexOf("}", start);
      if (end < 0) continue;
      const body = css.slice(start, end);
      const decl = (name) => {
        const d = body.match(new RegExp("--" + name + "\\s*:\\s*([^;]+)"));
        return d ? d[1] : null;
      };
      out[m[1]] = { bg: decl("sec-bg"), text: decl("sec-text"), soft: decl("sec-soft"), accent: decl("sec-accent") };
    }
    return out;
  })();
  // Walk a var(--a, var(--b, var(--c))) chain and return the FIRST name the skin actually
  // declares, mapping --tone-* back through the tone map. Returns null when the whole chain
  // is undeclared, which is the S4.6 "inert" case and stays inert.
  function resolveChain(expr, tone) {
    if (!expr) return null;
    for (const m of expr.matchAll(/(--[\w-]+)/g)) {
      let name = m[1];
      const role = name.match(/^--tone-(bg|text|soft|accent)$/);
      if (role) {
        const b = TONE_BLOCKS[tone] || TONE_BLOCKS.paper;
        name = b ? b[role[1] === "bg" ? "bg" : role[1]] : null;
        if (!name) continue;
      }
      if (T[name] || TA[name]) return name;
    }
    return null;
  }
  // SELECTORS WHOSE INK COMES FROM THE TONE REGARDLESS OF THE GROUND -- the other half of the
  // same defect, and the half no instrument has ever held. A component that reads a token
  // directly rather than --sec-* is INVISIBLE to a model that derives the ink from the tone,
  // which is precisely what the client manifest recorded as `guard_is_partial` and what a
  // controller re-derived from an attacker run four weeks later. The hue block re-grounds the
  // section; it does not reach inside a selector keyed on [data-tone].
  //
  // So: scan spine.css for a rule whose selector carries [data-tone=X] AND a descendant, and
  // whose `color` is a token that is NOT --sec-*. Each one is a real ink on the hue ground,
  // named, and checked there. A selector already reading --sec-* follows the hue and is not
  // a divergence -- which is why widening this set keeps it narrow.
  const TONE_KEYED = [];   // { tone, selector, ink }
  {
    const css = stripComments(read(P.spineCss) || "");
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const body = m[2];
      const c = body.match(/(?:^|[;\s])color\s*:\s*var\(\s*(--[\w-]+)/);
      if (!c || c[1].startsWith("--sec-")) continue;
      for (const part of m[1].split(",")) {
        const t = part.match(/\[data-tone=["']?(\w+)["']?\]\s*\S/);
        if (t) TONE_KEYED.push({ tone: t[1], selector: part.trim(), ink: c[1] });
      }
    }
  }
  if (TONE_KEYED.length) note(`selectors keying ink on the TONE rather than the ground (checked on every composed hue): ` +
    TONE_KEYED.map((k) => `${k.selector} -> ${k.ink}`).join(" | "));

  const composedHues = new Set();
  // which route put each composed slot under something, for the denominator at the end of [2] (R063)
  const groundRoutes = { section: new Set(), carrier: new Set(), component: new Set() };
  for (const cell of [...composed].sort()) {
    const [tone, n] = cell.split("|");
    const hue = `--hue-${n}`;
    if (!T[hue] && !TA[hue]) continue;        // undeclared slot is inert (S4.6)
    composedHues.add(n);
    const hb = HUE_BLOCKS[n];
    if (!hb) { note(`hue ${n} is composed in the markup but spine.css declares no [data-hue="${n}"] block`); continue; }
    groundRoutes.section.add(n);
    // (i) the inks the HUE BLOCK renders, resolved through its own fallback chain.
    const seen = new Set();
    for (const role of ["text", "soft", "accent"]) {
      const ink = resolveChain(hb[role], tone);
      if (ink && !seen.has(ink)) { seen.add(ink); NORMAL_PAIRS.push([ink, hue, `hue ${n} --sec-${role}, tone=${tone}`]); }
    }
    // (ii) the inks a TONE-KEYED selector puts there anyway, named by selector.
    for (const k of TONE_KEYED) {
      if (k.tone !== tone || seen.has(k.ink)) continue;
      seen.add(k.ink);
      NORMAL_PAIRS.push([k.ink, hue, `${k.selector} on hue ${n}`]);
    }
  }
  // THE GROUND HALF OF row 046: `<Section hue>` IS NOT THE ONLY HUE CARRIER, and the ones it
  // misses carry inks of their own. Everything above discovers grounds from `[data-hue="N"]`, which
  // is what `<Section hue>` renders. `<TierCard hue={N}>` renders `data-hue-bar={N}`, spine.css turns
  // that into `--tier-bar: var(--hue-N)`, and `.tier-card .tier-ico` paints its ink ON that
  // background. So a real ink lands on a real hue ground through a path no [data-hue] block and no
  // [data-tone] selector appears in, and TONE_KEYED above cannot see it either, because the
  // selector is keyed on the GROUND rather than on the tone.
  //
  // THE INK IS RESOLVED THROUGH THE SLOT'S OWN BLOCK (W-tier, ruled 2026-10-12). The icon painted a
  // hardcoded `--on-dark` on every slot, which reddened zuidgeluid-site's hues 1 to 3 (1.72, 1.33,
  // 2.06) while each declared a dark `--hue-N-ink`. Each `[data-hue-bar="N"]` block now also sets
  // `--tier-ink: var(--hue-N-ink, var(--on-dark))` and the icon reads `var(--tier-ink,
  // var(--on-dark))`, so the ink scored is the first name in that chain the skin declares, read
  // through the custom properties the carrier's own block sets for that slot, as the cascade
  // resolves it. A slot whose block sets no `--tier-ink`, or a skin that declares the hue and no
  // ink, falls back to `--on-dark` here exactly as it does in the browser, and is scored there.
  //
  // THE THRESHOLD IS THE NORMAL-TEXT 4.5 AND NO NEW RULE IS ADDED HERE. A tier-ico ground carries an
  // ICON rather than body text, and WCAG puts non-text contrast at 3.0, so 4.5 is arguably strict
  // for it. Measured on zuidgeluid-site 2026-09-18, the three cells this finds are 1.72, 1.33 and
  // 2.06, which clear NEITHER threshold, so the threshold question does not decide any live cell and
  // a second threshold rule would be ceremony. It is raised in the PR that added this, not settled.
  // Since the icon reads its slot's own ink (W-tier), those three cells score that ink instead.
  //
  // A LIST A STRANGER CAN EXTEND, one line per carrier, each naming the component that renders the
  // attribute and the spine.css anchor that grounds it. `data-hue` is listed for completeness and
  // handled above, tone-aware, because its ink comes from the cascade rather than from a selector.
  // The sweep below this loop names any carrier the spine layer ships that is NOT in this list, so
  // the list decaying is a finding rather than a silence.
  //
  // `grounds` SAYS WHETHER THE ATTRIBUTE'S OWN BLOCK MAY GROUND WHAT CARRIES IT (R120). `data-hue`
  // does by design: it sets background, color and the --sec-* inks. A carrier declared
  // `grounds: false` sets an indirection property and nothing else, so a selector that reads the
  // property grounds its own box (scored above) and the element carrying the attribute keeps its
  // ground and its inks. That is a PROPERTY OF THE SPINE, and it is asserted below: a `grounds:
  // false` block that sets background, color or any --sec-* is a FAIL, because a wrapper using the
  // hue only as a band or tint would hand the hue's inks to its children.
  const HUE_CARRIERS = [
    { attr: "data-hue",     handledAbove: true,  grounds: true,
      source: "<Section hue> in src/components/spine/primitives.tsx -> [data-hue=\"N\"] in spine.css" },
    { attr: "data-hue-bar", handledAbove: false, grounds: false,
      source: "<TierCard hue> in src/components/spine/cards.tsx -> .tier-card[data-hue-bar=\"N\"] --tier-bar in spine.css" },
    { attr: "data-hue-tint", handledAbove: false, grounds: false,
      source: "any element's data-hue-tint=\"N\" (R120) -> [data-hue-tint=\"N\"] --hue-tint in spine.css" },
  ];
  {
    const css = stripComments(read(P.spineCss) || "");
    // (i) which spine COMPONENTS render a hue carrier attribute, read from the spine layer rather
    // than named here: a component renaming itself must not silently drop out of the scan.
    const carrierTags = {};        // attr -> Set(componentName)
    const shippedAttrs = new Set();
    // A carrier need not have a component: data-hue-tint (R120) is CSS plus an attribute written in
    // markup, by design. So the sweep in (iii) also reads every attribute selector spine.css keys on
    // and every data-hue* attribute the content and route markup writes, or it is blind to exactly
    // the kind of carrier R120 introduced.
    for (const m of css.matchAll(/\[(data-hue[\w-]*)/g)) shippedAttrs.add(m[1]);
    for (const f of [...walk(P.content, [".tsx"]), ...walk(P.routes, [".tsx"])])
      for (const m of stripComments(read(f) || "").matchAll(/\b(data-hue[\w-]*)\s*=/g)) shippedAttrs.add(m[1]);
    for (const f of walk(P.spineDir, [".tsx"])) {
      const src = stripComments(read(f) || "");
      for (const m of src.matchAll(/\bdata-hue[\w-]*\b/g)) shippedAttrs.add(m[0]);
      const marks = [...src.matchAll(/export\s+(?:function|const)\s+([A-Z]\w*)/g)];
      marks.forEach((m, i) => {
        const body = src.slice(m.index, i + 1 < marks.length ? marks[i + 1].index : src.length);
        for (const a of body.matchAll(/\b(data-hue[\w-]*)\s*=/g)) {
          (carrierTags[a[1]] ||= new Set()).add(m[1]);
        }
      });
    }
    // (ii) for each carrier that is not the [data-hue] cascade, learn the indirection property the
    // attribute sets (--tier-bar), then score every selector that uses that property as a BACKGROUND
    // and declares a colour. A selector with no colour (the 6px ::before rule) grounds no text and
    // is not a pair.
    const carrierPairs = [];
    // a composed slot the loop below cannot score is NAMED, never skipped in silence (the code
    // review of #26, F2): the ground falls back where the hue is undeclared while the block may
    // still resolve an ink of the slot's own family, a pair no line below asserts
    const unscored = [];
    // the ink a rule's `color` paints on slot n: each name in its var() chain in order, a custom
    // property the carrier's own block sets for that slot (--tier-ink) expanded through that block's
    // value, and otherwise the first name the skin declares. `via` collects the block properties it
    // went through, so the label names the route.
    const carrierInk = (expr, own, via = [], depth = 0) => {
      for (const m of expr.matchAll(/(--[\w-]+)/g)) {
        const name = m[1];
        if (own.has(name) && depth < 4) {
          const r = carrierInk(own.get(name), own, [...via, name], depth + 1);
          if (r) return r;
          continue;
        }
        if (T[name] || TA[name]) return { ink: name, via };
      }
      return null;
    };
    for (const c of HUE_CARRIERS) {
      if (c.handledAbove) continue;
      const tags = [...(carrierTags[c.attr] || [])];
      const props = new Map();                 // hue number -> indirection property name
      const decls = new Map();                 // hue number -> Map(custom property -> value) its block sets
      for (const m of css.matchAll(new RegExp("\\[" + c.attr + "=[\"']?(\\d+)[\"']?\\]\\s*\\{", "g"))) {
        const start = m.index + m[0].length;
        const end = css.indexOf("}", start);
        if (end < 0) continue;
        const body = css.slice(start, end);
        // the ground property reads the SLOT itself, `var(--hue-N,` or `var(--hue-N)`, so an ink
        // property reading `var(--hue-N-ink` is never taken for it, whichever the block sets first
        const d = body.match(/(--[\w-]+)\s*:\s*var\(\s*--hue-(\d+)\s*[,)]/);
        if (d && d[2] === m[1]) props.set(m[1], d[1]);
        if (!decls.has(m[1])) decls.set(m[1], new Map());
        for (const x of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) decls.get(m[1]).set(x[1], x[2].trim());
      }
      if (!props.size) { note(`hue carrier ${c.attr}: no [${c.attr}="N"] block in spine.css resolves to a --hue-N slot; nothing to score (${c.source})`); continue; }
      // which N values the MARKUP actually composes through one of this carrier's components, or
      // through the attribute written on an element directly (data-hue-tint has no component).
      const used = new Set();
      const rawRe = new RegExp("\\b" + c.attr + "\\s*=\\s*\\{?\\s*[\"'`]?(\\d+)", "g");
      for (const f of [...walk(P.content, [".tsx"]), ...walk(P.routes, [".tsx"])]) {
        const src = stripComments(read(f) || "");
        for (const a of src.matchAll(rawRe)) used.add(a[1]);
        if (!tags.length) continue;
        const tagRe = new RegExp("<(" + tags.join("|") + ")\\b[\\s\\S]*?>", "g");
        for (const tag of src.matchAll(tagRe)) {
          const h = tag[0].match(/hue\s*=\s*\{?\s*["'`]?(\d+)/);
          if (h) used.add(h[1]);
        }
      }
      for (const n of [...used].sort()) {
        const prop = props.get(n);
        const hue = `--hue-${n}`;
        if (!prop || (!T[hue] && !TA[hue])) {              // undeclared slot stays inert (S4.6), and is named
          const reads = [...(decls.get(n) || new Map()).values()].flatMap((v) => [...v.matchAll(/(--[\w-]+)/g)].map((x) => x[1]));
          const own = [...new Set(reads)].filter((t) => t.startsWith(`${hue}-`) && (T[t] || TA[t]));
          const why = !decls.has(n) ? `spine.css has no [${c.attr}="${n}"] block`
            : !prop ? `its block grounds on no var(${hue})` : `${hue} undeclared`;
          const ink = own.length ? `; its block still reads the declared ${own.join(", ")}, painted on a ground no pair asserts` : "";
          unscored.push(`${c.attr}=${n} (${why}${ink})`);
          continue;
        }
        composedHues.add(n);
        groundRoutes.carrier.add(n);
        for (const r of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
          const body = r[2];
          if (!new RegExp("background(?:-color)?\\s*:\\s*var\\(\\s*" + prop + "\\b").test(body)) continue;
          const expr = body.match(/(?:^|[;\s])color\s*:\s*(var\([^;]+)/);
          if (!expr) continue;                              // grounds no text: not a pair
          // an unresolved chain keeps its first name, which the loop below treats as inert (S4.6)
          const got = carrierInk(expr[1], decls.get(n) || new Map()) || { ink: (expr[1].match(/(--[\w-]+)/) || [])[1], via: [] };
          if (!got.ink) continue;
          const route = got.via.length ? `; ink ${[...got.via, got.ink].join(" -> ")}` : "";
          carrierPairs.push([got.ink, hue, `${r[1].trim()} on ${c.attr}=${n} (${prop}${route})`]);
        }
      }
    }
    for (const pr of carrierPairs) NORMAL_PAIRS.push(pr);
    if (carrierPairs.length) note(`hue carriers beyond <Section hue>: ${carrierPairs.length} pair(s) added -- ` +
      carrierPairs.map((x) => `${x[0]} on ${x[1]} via ${x[2]}`).join(" | "));
    if (unscored.length) note(`hue carrier slot(s) composed in the markup that [2] could not score on a hue ground: ` +
      unscored.join(" | "));
    // (iii) the list decaying is a FINDING. Any data-hue* attribute the spine layer ships that no
    // HUE_CARRIERS entry names is a ground nothing above scores, and saying so is how the next
    // carrier gets added instead of being missed.
    const unlisted = [...shippedAttrs].filter((a) => !HUE_CARRIERS.some((c) => c.attr === a));
    if (unlisted.length) note(`spine layer or markup carries hue carrier attribute(s) HUE_CARRIERS does not name: ` +
      `${unlisted.join(", ")} -- any ink on those grounds is UNSCORED. Add a line to HUE_CARRIERS in this file`);
    // (iv) A NON-GROUNDING CARRIER SETS NO GROUND AND NO INK (R120). Every block whose selector
    // carries the attribute of a `grounds: false` carrier is read, valued ([attr="N"]) or BARE
    // ([attr]), whatever selector it is compounded with, and any background, color or --sec-* it
    // sets is named. Without this the declared way to borrow a hue as a band or tint is a comment,
    // and one added line turns it back into the [data-hue] behaviour it replaces. The bare form is
    // the likelier line, since one `[data-hue-tint] { ... }` grounds every slot at once.
    const nonGrounding = HUE_CARRIERS.filter((c) => c.grounds === false);
    const groundingHits = [];
    let blocksRead = 0;
    for (const c of nonGrounding) {
      for (const r of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (!new RegExp("\\[" + c.attr + "(?![\\w-])").test(r[1])) continue;
        blocksRead++;
        const set = [...r[2].matchAll(/(?:^|[;\s])(background(?:-color)?|color|--sec-[\w-]+)\s*:/g)].map((m) => m[1]);
        if (set.length) groundingHits.push(`${r[1].trim()} sets ${[...new Set(set)].join(", ")}`);
      }
    }
    if (groundingHits.length) bad(`non-grounding hue carrier block(s) set a ground or an ink, so whatever carries the ` +
      `attribute is grounded in the hue and hands its inks to its children (R120): ${groundingHits.join(" | ")}`);
    else if (blocksRead) ok(`non-grounding hue carrier(s) ${nonGrounding.map((c) => c.attr).join(", ")} set no ground ` +
      `and no ink (${blocksRead} block(s) read)`);
    else note(`no block of a non-grounding hue carrier (${nonGrounding.map((c) => c.attr).join(", ")}) found in spine.css`);
  }
  // THE REST OF R063: A HUE COMPOSED AS A GROUND THROUGH A COMPONENT'S PROP OR AN INLINE STYLE. The
  // carriers above are SPINE attributes, and a site composes hue grounds the spine never declared:
  // zuidgeluid-site's `<IlluStage sheet="var(--hue-3)">` (its own src/content/ui.tsx) writes the prop
  // as a `background`, so a slot is a ground there that no [data-hue] block, carrier or tone selector
  // names, and every ink on it sat outside the denominator. So the resolver reads every component
  // under src/ whose body writes a destructured prop as its `background`, and every opening tag in
  // the content and route markup that passes such a prop, or carries an inline `background`, whose
  // value is a `var(--hue-N)`.
  //
  // WHAT LANDS ON THE GROUND IS SCORED, AND WHAT IS NOT IS COUNTED. A `color: "var(--x)"` the
  // component's body or the tag's own style declares is an ink there. Literal text between the
  // opening and the closing tag, where neither declares a colour, inherits the enclosing Section's
  // ink, resolved as the cascade resolves --sec-text there. A value that is not one flat slot (a
  // gradient, a color-mix) has no single colour to score and is NAMED, as a translucent ground is
  // below. An svg fill or stroke is not text and is not scored, and text a component renders from its
  // own props is not visible to this reading of the markup; the last clause of the line below counts
  // every `var(--hue-N)` in the markup the resolver did not place as a ground, so that limit is a
  // number on the page rather than a silence.
  //
  // THAT COUNT HAS A SCOPE, AND THE LINE STATES IT (the code review of #25, F5). The markup read for
  // grounds is src/content and src/routes, while the components are read from all of src/. A ground
  // composed in a site's own markup elsewhere under src/ (a src/components/** outside the spine) is
  // neither placed nor counted above, so the line names the scope and counts every `var(--hue-N)` in
  // that markup by file as not read: the guard's own denominator is on the page with its edge.
  {
    const markupFiles = [...walk(P.content, [".tsx"]), ...walk(P.routes, [".tsx"])];
    const slotRef = /var\(\s*--hue-\d+\s*[,)]/g;
    const outsideScope = walk(join(ROOT, "src"), [".tsx"])
      .filter((f) => !markupFiles.includes(f) && relative(P.spineDir, f).startsWith(".."))
      .map((f) => [relative(ROOT, f).replace(/\\/g, "/"), (stripComments(read(f) || "").match(slotRef) || []).length])
      .filter(([, k]) => k > 0);
    const notRead = outsideScope.reduce((a, [, k]) => a + k, 0);
    // (i) the components that write a prop as their background, wherever under src/ they are defined
    const grounders = new Map();   // name -> { file, props, inks }
    for (const f of walk(join(ROOT, "src"), [".tsx"])) {
      const src = stripComments(read(f) || "");
      const defs = [...src.matchAll(/\b(?:function\s+([A-Z]\w*)\s*\(|const\s+([A-Z]\w*)\s*=\s*\()\s*\{([^{}]*)\}/g)];
      defs.forEach((m, i) => {
        const body = src.slice(m.index, i + 1 < defs.length ? defs[i + 1].index : src.length);
        const props = m[3].split(",").map((p) => p.trim().split(/[\s=:]/)[0])
          .filter((p) => /^[A-Za-z_]\w*$/.test(p) && new RegExp("\\bbackground(?:Color)?\\s*:\\s*" + p + "\\b").test(body));
        if (props.length) grounders.set(m[1] || m[2], { file: relative(ROOT, f).replace(/\\/g, "/"), props,
          inks: [...new Set([...body.matchAll(/(?<![\w-])color\s*:\s*["'`]\s*var\(\s*(--[\w-]+)/g)].map((x) => x[1]))] });
      });
    }
    // (ii) an opening tag read to its closing `>` across quotes and braces, so an attribute holding
    // `=>` or a nested element does not end it early
    const openTag = (src, at) => {
      let depth = 0, q = null;
      for (let i = at + 1; i < src.length; i++) {
        const c = src[i];
        if (q) { if (c === q) q = null; continue; }
        if (c === '"' || c === "'" || c === "`") q = c;
        else if (c === "{") depth++;
        else if (c === "}") depth--;
        else if (c === ">" && !depth) return { text: src.slice(at, i + 1), end: i + 1, selfClosing: src[i - 1] === "/" };
      }
      return null;
    };
    // the literal text of a JSX fragment: every tag and every {expression} dropped, each read to its
    // own end so an arrow function in an attribute does not leave its body behind as "text"
    const textOf = (s) => {
      let txt = "", i = 0;
      while (i < s.length) {
        if (s[i] === "<" && /[A-Za-z/]/.test(s[i + 1] || "")) {
          const end = s[i + 1] === "/" ? s.indexOf(">", i) + 1 : (openTag(s, i) || { end: 0 }).end;
          if (!end) break;
          i = end; txt += " "; continue;
        }
        if (s[i] === "{") {
          let d = 1, j = i + 1;
          for (; j < s.length && d; j++) { if (s[j] === "{") d++; else if (s[j] === "}") d--; }
          i = j; txt += " "; continue;
        }
        txt += s[i++];
      }
      return txt;
    };
    // the tone and hue of the innermost <Section> open at a position, which is what text there inherits
    const enclosing = (src, at) => {
      const stack = [];
      for (const m of src.slice(0, at).matchAll(/<Section\b|<\/Section\s*>/g)) {
        if (m[0].startsWith("</")) { stack.pop(); continue; }
        const t = openTag(src, m.index);
        if (t && !t.selfClosing) stack.push(t.text);
      }
      const top = stack[stack.length - 1] || "";
      return { tone: (top.match(/\btone\s*=\s*["'`](\w+)["'`]/) || [])[1] || "paper",
               hue: (top.match(/(?<![\w-])hue\s*=\s*\{?\s*["'`]?(\d+)/) || [])[1] || null };
    };
    const flat = (v) => /^\s*var\(\s*--hue-\d+\s*[,)]/.test(v) && (v.match(slotRef) || []).length === 1 && !/gradient|color-mix|url\(/i.test(v);
    const pairs = new Map();       // "ink|hue|route" -> { ink, hue, label, files }
    const nonFlat = [], viaBySlot = new Map(), placed = new Map();
    let refs = 0;
    for (const f of markupFiles) {
      const src = stripComments(read(f) || "");
      const rel = relative(ROOT, f).replace(/\\/g, "/");
      refs += (src.match(slotRef) || []).length;
      for (const m of src.matchAll(/(?<![\w)\]])<([A-Za-z][\w.]*)/g)) {   // not a generic or a comparison
        const t = openTag(src, m.index);
        if (!t) continue;
        const name = m[1], g = grounders.get(name), values = [];   // [route, value, inks]
        if (g) for (const p of g.props) {
          const v = t.text.match(new RegExp("\\s" + p + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|\\{\\s*[\"'`]([^\"'`]*)[\"'`]\\s*\\})"));
          if (v) values.push([`<${name} ${p}> (${g.file})`, v[1] ?? v[2] ?? v[3], g.inks]);
        }
        const style = t.text.match(/\bstyle\s*=\s*\{\{([\s\S]*)\}\}/);
        const bg = style && style[1].match(/\bbackground(?:Color)?\s*:\s*["'`]([^"'`]*)["'`]/);
        if (bg) {
          const ink = style[1].match(/(?<![\w-])color\s*:\s*["'`]\s*var\(\s*(--[\w-]+)/);
          values.push([`an inline style background on <${name}>`, bg[1], ink ? [ink[1]] : []]);
        }
        for (const [route, v, inks] of values) {
          const n = (v.match(slotRef) || []).length;
          if (!n) continue;
          placed.set(rel, (placed.get(rel) || 0) + n);
          if (!flat(v)) { nonFlat.push(`${route} in ${rel}: ${v.trim()}`); continue; }
          const slot = v.match(/--hue-(\d+)/)[1], hue = `--hue-${slot}`;
          if (!T[hue] && !TA[hue]) continue;          // undeclared slot stays inert (S4.6)
          composedHues.add(slot);
          groundRoutes.component.add(slot);
          if (!viaBySlot.has(slot)) viaBySlot.set(slot, new Set());
          viaBySlot.get(slot).add(route);
          const lands = inks.map((ink) => [ink, `the colour ${route} declares, on hue ${slot}`]);
          if (!inks.length && !t.selfClosing) {
            const close = src.indexOf(`</${name}>`, t.end);
            if (close >= 0 && /[A-Za-z0-9]/.test(textOf(src.slice(t.end, close)))) {
              const e = enclosing(src, m.index);
              const ink = resolveInk("var(--sec-text)", e.tone, e.hue);
              if (ink) lands.push([ink, `text inside ${route} inherits the section ink, tone=${e.tone}${e.hue ? `, hue ${e.hue}` : ""}, on hue ${slot}`]);
            }
          }
          for (const [ink, label] of lands) {
            const key = `${ink}|${hue}|${label}`;
            if (!pairs.has(key)) pairs.set(key, { ink, hue, label, files: new Set() });
            pairs.get(key).files.add(rel);
          }
        }
      }
    }
    for (const p of pairs.values()) NORMAL_PAIRS.push([p.ink, p.hue, `${p.label}, in ${[...p.files].join(", ")}`]);
    const unplaced = markupFiles.map((f) => relative(ROOT, f).replace(/\\/g, "/"))
      .map((rel) => [rel, (stripComments(read(join(ROOT, rel)) || "").match(slotRef) || []).length - (placed.get(rel) || 0)])
      .filter(([, k]) => k > 0);
    const left = unplaced.reduce((a, [, k]) => a + k, 0);
    if (refs || grounders.size || notRead) note(`hue grounds through a component prop or an inline style (R063): ` +
      `${viaBySlot.size} slot(s) composed${viaBySlot.size ? ` (${[...viaBySlot].map(([n, v]) => `--hue-${n} via ${[...v].join(" and ")}`).join("; ")})` : ""}, ` +
      `${pairs.size} pair(s) added, ${nonFlat.length} ground(s) that are not one flat slot named and not scored` +
      `${nonFlat.length ? ` (${nonFlat.join(" | ")})` : ""}; ${refs - left} of ${refs} var(--hue-N) reference(s) in the ` +
      `content and route markup (src/content, src/routes) placed as a ground` + (left ? `, the other ${left} a fill, a stroke, ` +
      `a border or an ink, or routed through data this reading does not follow: ${unplaced.map(([r, k]) => `${r} (${k})`).join(", ")}` : "") +
      `; markup elsewhere under src/ outside the spine is not read, ${notRead} var(--hue-N) reference(s) there` +
      (notRead ? `: ${outsideScope.map(([r, k]) => `${r} (${k})`).join(", ")}` : ""));
  }
  if (composed.size) note(`tone x hue compositions found in markup: ${[...composed].sort().join(", ")} -- ${composed.size} cell(s) added to the matrix`);
  // PALETTE-LEVEL LINE for slots DECLARED but never composed. ZG's numbers show the dark
  // register is uniformly unsafe over that palette (--accent-on-dark on --hue-2 = 1.00, the
  // same hex) rather than slot-specific, so a skin can ship five safe pairs and still have no
  // usable dark cell. That is worth SAYING and is not worth failing: nothing renders it, and
  // a checker that fires where there is no defect trains people to ignore it. ADVISORY.
  {
    const declaredHues = [...new Set(Object.keys(HUE_BLOCKS))].filter((n) => T[`--hue-${n}`] || TA[`--hue-${n}`]);
    const uncomposed = declaredHues.filter((n) => !composedHues.has(n));
    const wouldFail = [];
    for (const n of uncomposed) {
      const hue = `--hue-${n}`;
      const ground = T[hue];
      if (!ground) continue;
      for (const ink of [...new Set(TONE_KEYED.map((k) => k.ink))]) {
        const fg = resolveColour(ink, ground);
        if (!fg) continue;
        const r = cr(fg, ground);
        if (r < 4.5) wouldFail.push(`${ink} on ${hue} = ${r.toFixed(2)}`);
      }
    }
    if (uncomposed.length) note(`declared but UNCOMPOSED hue slot(s) ${uncomposed.map((n) => `--hue-${n}`).join(", ")}: not asserted (nothing renders them). ` +
      (wouldFail.length ? `Were a tone-keyed ink composed there it would fail: ${wouldFail.join(", ")}` : `every tone-keyed ink would clear 4.5 there`));
  }

  // Accent-as-BACKGROUND text pair (on-dark body colour on the accent tone) --
  // large-display-only by S2.3/S4.3, so the threshold is 3.0 (NOT 4.5). On the accent
  // tone, accent text falls back to the on-dark BODY colour only (S4.3), so --on-dark is
  // the single exercised pair -- --on-dark-soft is "n/a" in the S2.3 matrix and must not
  // be force-checked. The canonical AS skin --on-dark on Ember = 3.81 clears 3.0 and
  // S2.3 sanctions it as large-only; checking it at 4.5 would false-fail the reference skin.
  const ACCENT_LARGE_PAIRS = [
    ["--on-dark", "--accent"],
  ];
  // THE CRUMB'S INKS ON EVERY GROUND A CRUMB SITS ON (R122). `.crumb a:hover` painted --accent, a
  // FILL token, as 12.5px weight-800 text, where 4.5 is owed: 3.81 on this seed's --bg. No pair
  // above could see it, because the tone map scores the tone's own roles and a state rule that
  // reads a raw token is not one of them. So each rule below has its `color` READ OUT OF spine.css
  // and RESOLVED the way the cascade resolves it, on every tone ground and on every composed hue
  // cell, and scored at the normal-text 4.5. A LIST A STRANGER CAN EXTEND: one line per selector
  // that paints text directly on the section's ground.
  //
  // THE ACCENT GROUND IS SCORED TOO, and the reason it once was not was one word carrying two facts.
  // S2.3/S4.3 put --accent AS INK at large display only, which is why ACCENT_LARGE_PAIRS above is
  // 3.0. On the accent GROUND the crumb's inks are --on-dark and --on-dark-soft, and a crumb is
  // 12.5px text, so 4.5 is owed there like any small text on that ground (the accentSmallText rule
  // below). The pairs are ASSERTED when the markup composes a <Crumb> inside an accent-tone Section,
  // read by that rule's own 600-character window. Where none is composed they are printed with their
  // ratios as an advisory line and never silently dropped, in the shape of the UNCOMPOSED hue-slot
  // line: nothing renders them, and a gate that fails where nothing renders trains people to ignore
  // it. On this seed's skin no token clears 4.5 on --accent, so a crumb cannot sit there at all.
  const SECTION_INK_RULES = [
    { selector: ".crumb",         source: "<Crumb> in primitives.tsx, the trail itself" },
    { selector: ".crumb a",       source: "a crumb link at rest (the hue-ink rule)" },
    { selector: ".crumb a:hover", source: "a crumb link on hover (R122)" },
  ];
  // Resolve one `color` expression to the skin token the browser paints: --sec-* through the hue
  // block's own chain on a hue ground and through the tone block otherwise (a tone block sets no
  // --sec-accent, so that name falls through to the next in the chain), --tone-* through the tone.
  function resolveInk(expr, tone, n) {
    if (!expr) return null;
    for (const m of expr.matchAll(/(--[\w-]+)/g)) {
      const sec = m[1].match(/^--sec-(bg|text|soft|accent)$/);
      if (sec) {
        if (n && HUE_BLOCKS[n]) { const r = resolveChain(HUE_BLOCKS[n][sec[1]], tone); if (r) return r; continue; }
        if (sec[1] === "accent") continue;
        const v = (TONE_BLOCKS[tone] || {})[sec[1]];
        if (v && (T[v] || TA[v])) return v;
        continue;
      }
      const r = resolveChain(m[1], tone);
      if (r) return r;
    }
    return null;
  }
  {
    const css = stripComments(read(P.spineCss) || "");
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sels: m[1].split(",").map((s) => s.trim()), body: m[2] }));
    // a <Crumb> composed inside an accent-tone Section, by the accentSmallText window below
    let accentCrumb = false;
    for (const f of [...walk(P.content, [".tsx"]), ...walk(P.routes, [".tsx"])]) {
      const body = stripComments(read(f) || "");
      for (const m of body.matchAll(/tone=["']accent["']|data-tone=["']accent["']/g))
        if (/<Crumb\b|className=["'][^"']*\bcrumb\b/.test(body.slice(m.index, m.index + 600))) accentCrumb = true;
    }
    const grounds = [];   // { tone, n, ground, held }
    for (const [tone, b] of Object.entries(TONE_BLOCKS)) if (b.bg) grounds.push({ tone, n: null, ground: b.bg, held: tone === ACCENT_TONE && !accentCrumb });
    for (const cell of [...composed].sort()) {
      const [tone, n] = cell.split("|");
      if ((T[`--hue-${n}`] || TA[`--hue-${n}`]) && HUE_BLOCKS[n]) grounds.push({ tone, n, ground: `--hue-${n}`, held: false });
    }
    // "ink|ground" -> cell -> selectors, so one pair painted by two rules is asserted once. A HELD
    // ground (the accent ground with no crumb composed on it) collects into its own map.
    const pairs = new Map();
    const heldPairs = new Map();
    const unread = [];
    for (const r of SECTION_INK_RULES) {
      // the LAST rule setting colour for the exact selector wins, as it does in the cascade
      const hit = rules.filter((x) => x.sels.includes(r.selector) && /(?:^|[;\s])color\s*:/.test(x.body)).pop();
      const expr = hit && (hit.body.match(/(?:^|[;\s])color\s*:\s*([^;]+)/) || [])[1];
      if (!expr) { unread.push(r.selector); continue; }
      for (const g of grounds) {
        const ink = resolveInk(expr, g.tone, g.n);
        if (!ink) continue;
        const into = g.held ? heldPairs : pairs;
        const key = `${ink}|${g.ground}`;
        const cell = `tone=${g.tone}${g.n ? `, hue ${g.n} ground` : ""}`;
        if (!into.has(key)) into.set(key, new Map());
        if (!into.get(key).has(cell)) into.get(key).set(cell, []);
        into.get(key).get(cell).push(r.selector);
      }
    }
    // Worded apart from the TONE_KEYED label (`<selector> on hue N`), which fixtures.mjs forbids for
    // a rule that reads --sec-*: a crumb rule here is SCORED, it is not reported as a divergence.
    const label = (cells) => [...cells].map(([cell, sels]) => `crumb ink ${sels.join(" + ")}, ${cell}`).join("; ");
    // A crumb pair can be one the tone map already asserts under its own label (the crumb's chain IS
    // the tone's accent and soft ink on most grounds), so the count says how many are NEW pairs.
    const already = new Set(NORMAL_PAIRS.map(([fg, bg]) => `${fg}|${bg}`));
    let fresh = 0;
    for (const [key, cells] of pairs) {
      const [ink, ground] = key.split("|");
      if (!already.has(key)) fresh++;
      NORMAL_PAIRS.push([ink, ground, label(cells)]);
    }
    const heldLines = [];
    for (const [key, cells] of heldPairs) {
      const [ink, ground] = key.split("|");
      const bgHex = T[ground];
      const fgHex = bgHex && resolveColour(ink, bgHex);
      if (!fgHex) continue;
      const ratio = cr(fgHex, bgHex);
      heldLines.push(`${ink} on ${ground} = ${ratio.toFixed(2)}${ratio < 4.5 ? " (< 4.5)" : ""} [${label(cells)}]`);
    }
    if (unread.length) soft(`crumb ink rule(s) not found in spine.css, so their inks are unscored: ${unread.join(", ")}`);
    const heldGrounds = grounds.filter((g) => g.held).length;
    note(`crumb inks: ${SECTION_INK_RULES.length} rule(s) x ${grounds.length - heldGrounds} ground(s) -> ${pairs.size} distinct pair(s) ` +
         `added at 4.5 (${fresh} new to the matrix, ${pairs.size - fresh} already in it under another label)` +
         (heldGrounds ? `; the ${ACCENT_TONE} ground is scored on the next line and not asserted` : ""));
    if (heldLines.length) note(`crumb inks on the ${ACCENT_TONE} ground, NOT ASSERTED because no <Crumb> is composed in an ` +
      `${ACCENT_TONE}-tone Section (a crumb is 12.5px text and owes 4.5 there the moment one is): ${heldLines.join(" | ")}`);
    if (accentCrumb) note(`a <Crumb> is composed in an ${ACCENT_TONE}-tone Section, so its inks are asserted at 4.5 on the ${ACCENT_TONE} ground`);
  }

  // S4.6 SIX SLOTS IN EVERY HUE-KEYED FAMILY (R112). A site with six categories needs six slots, and
  // the spine had five, so sz-site reached its sixth tak through an inline var(--hue-6). The slot
  // count is ONE constant here, and every family spine.css keys on a hue number must carry all of
  // them: a family that stops at five is a site that cannot compose its sixth category in that form.
  // A LIST A STRANGER CAN EXTEND, one line per hue-keyed family. Standard S4.6 moves to six at the
  // Factory re-embed of this seed release; the seed leads by the brief's one-way order.
  const HUE_SLOTS = 6;
  const HUE_FAMILIES = [
    { family: '[data-hue="N"]',      re: /\[data-hue=["']?(\d+)["']?\]/g,      source: "<Section hue>, the slot itself" },
    { family: ".em-hue-N",           re: /\.em-hue-(\d+)\b/g,                  source: "<Em hue>, hue as text" },
    { family: '[data-hue-bar="N"]',  re: /\[data-hue-bar=["']?(\d+)["']?\]/g,  source: "<TierCard hue>, the top bar" },
    { family: '[data-hue-tint="N"]', re: /\[data-hue-tint=["']?(\d+)["']?\]/g, source: "a band or tint without grounding (R120)" },
  ];
  {
    const css = stripComments(read(P.spineCss) || "");
    const short = [];
    for (const f of HUE_FAMILIES) {
      const have = new Set([...css.matchAll(f.re)].map((m) => +m[1]));
      const missing = [];
      for (let n = 1; n <= HUE_SLOTS; n++) if (!have.has(n)) missing.push(n);
      if (missing.length) short.push(`${f.family} (${f.source}) lacks slot(s) ${missing.join(", ")}`);
    }
    if (short.length) bad(`spine.css does not carry all ${HUE_SLOTS} S4.6 hue slots in every hue-keyed family (R112): ${short.join(" | ")}`);
    else ok(`spine.css carries all ${HUE_SLOTS} S4.6 hue slots in each of ${HUE_FAMILIES.length} hue-keyed families`);
    // THE LIST DECAYING IS A FINDING HERE TOO, by the carrier sweep's rule above. Any family spine.css
    // keys on a hue number, by attribute ([x-hue-y="N"]) or by class (.x-hue-N, which .em-hue-N proves
    // exists), that no HUE_FAMILIES entry matches is a family whose slot count nothing checks.
    const seen = new Map();   // family -> one selector that keys it
    for (const m of css.matchAll(/\[([\w-]*hue[\w-]*)=["']?\d+["']?\]/g)) if (!seen.has(`[${m[1]}="N"]`)) seen.set(`[${m[1]}="N"]`, m[0]);
    for (const m of css.matchAll(/\.((?:[\w-]*-)?hue)-\d+\b/g)) if (!seen.has(`.${m[1]}-N`)) seen.set(`.${m[1]}-N`, m[0]);
    const unlisted = [...seen].filter(([, sel]) => !HUE_FAMILIES.some((f) => new RegExp(f.re.source).test(sel))).map(([fam]) => fam);
    if (unlisted.length) note(`spine.css keys hue-numbered family(ies) HUE_FAMILIES does not name: ${unlisted.join(", ")} -- ` +
      `their slot count is UNCHECKED (R112). Add a line to HUE_FAMILIES in this file`);
  }

  // S4.6 hue slots + hue-as-text (declared-only; undeclared tokens skip below): the
  // standard has ALWAYS said each declared --hue-N/--hue-N-ink pair is AA-gated, but no
  // pair was in the list until v1.8.2 -- the gate now matches the standard. --hue-N-text
  // (ruled in 2026-07-30) is checked as normal text on the three light grounds.
  //
  // EVERY DECLARED SLOT, WHATEVER N (R110). The loop ran n from 1 to 5, so a sixth slot was declared,
  // used and never scored; #24 raised the bound to HUE_SLOTS. A bound is the same defect one slot
  // later, so the slot numbers are read out of the skin: any --hue-N, --hue-N-ink or --hue-N-text it
  // declares puts N in the loop, and a slot the skin declares nothing for adds no pair at all, where
  // the bounded loop added four inert ones per slot to the derived count.
  //
  // AND A PAIR, NOT ONLY A SLOT (the code review of #25, F1). A slot declaring --hue-N and its ink
  // but no --hue-N-text still pushed its three text pairs, which the loop below drops as undeclared
  // (inert by S4.6, not a skip): counted as derived, never asserted, never named, while the line read
  // `0 token(s) unresolvable`. Measured on zuidgeluid-site, which declares no --hue-2-text: 51 derived,
  // 48 asserted. So a pair is derived only where the map declares both its ink and its ground; a
  // declared token [2] cannot read still reaches the loop and is named there as a skip.
  const declaredSlots = [...new Set([...Object.keys(T), ...Object.keys(TA)]
    .map((name) => (name.match(/^--hue-(\d+)(?:-ink|-text)?$/) || [])[1]).filter(Boolean).map(Number))].sort((a, b) => a - b);
  const declares = (tok) => Boolean(T[tok] || TA[tok]);
  for (const n of declaredSlots) {
    for (const [fg, bg] of [[`--hue-${n}-ink`, `--hue-${n}`],
      [`--hue-${n}-text`, "--bg"], [`--hue-${n}-text`, "--bg-alt"], [`--hue-${n}-text`, "--surface"]])
      if (declares(fg) && declares(bg)) NORMAL_PAIRS.push([fg, bg]);
  }
  note(`hue slot pairs: every --hue-N the map declares is gated, whatever N (R110): ` +
    (declaredSlots.length ? declaredSlots.map((n) => `--hue-${n}`).join(", ") : "none declared"));
  let aaChecked = 0;
  // the accent-ground pair is asserted by its own loop below, at 3.0, and is derived all the same; the
  // four inert pairs per undeclared slot the bounded hue loop used to add had hidden that it was not
  // counted here (R110)
  let derivedPairs = NORMAL_PAIRS.length + ACCENT_LARGE_PAIRS.length;
  // "fg|bg" of every pair ASSERTED, so the denominator can say how many are distinct: one pair is
  // asserted again under every label that reaches it (a crumb rule painting the tone's own ink).
  const assertedKeys = new Set();
  for (const [fg, bg, via] of NORMAL_PAIRS) {
    // The GROUND must be opaque: a translucent ground composites over whatever sits behind
    // the section, which this gate cannot see, so it is a NAMED skip rather than a guess.
    const bgHex = T[bg];
    if (!bgHex) { if (TA[bg]) skippedTokens.add(`${bg} (translucent GROUND -- what sits behind it is not knowable here)`); continue; }
    const fgHex = resolveColour(fg, bgHex);
    if (!fgHex) { if (!T[fg] && !TA[fg]) { /* undeclared: inert by S4.6, not a skip */ } else skippedTokens.add(fg); continue; }
    const flat = !T[fg];
    if (flat) flattenedPairs++;
    aaChecked++;
    assertedKeys.add(`${fg}|${bg}`);
    const ratio = cr(fgHex, bgHex);
    const label = `${fg} on ${bg}${flat ? ` (rgba flattened over the ground -> ${fgHex})` : ""}${via ? ` [${via}]` : ""}`;
    if (ratio < 4.5) bad(`${label} = ${ratio.toFixed(2)} (< 4.5 normal)`);
    else ok(`${label} = ${ratio.toFixed(2)}`);
  }
  // accentUses: does any accent-tone section carry small (non-display) text? If so the
  // large-only sanction does not apply and we DO require 4.5. Heuristic: a Section with
  // tone/data-tone="accent" that also renders Lead/body rather than only Display.
  const sectionFiles = [...walk(P.content, [".tsx"]), ...walk(P.routes, [".tsx"])];
  let accentSmallText = false;
  for (const f of sectionFiles) {
    const body = stripComments(read(f) || "");
    const re = /tone=["']accent["']|data-tone=["']accent["']/g;
    let m;
    while ((m = re.exec(body))) {
      const window = body.slice(m.index, m.index + 600);
      if (/<Lead|<p[ >]|className=["'][^"']*\blead\b|<Body|<SecTitle/.test(window)) accentSmallText = true;
    }
  }
  for (const [fg, bg] of ACCENT_LARGE_PAIRS) {
    if (!T[fg] || !T[bg]) continue;
    aaChecked++;
    assertedKeys.add(`${fg}|${bg}`);
    const ratio = cr(T[fg], T[bg]);
    const threshold = accentSmallText ? 4.5 : 3.0;
    if (ratio < threshold) bad(`${fg} on ${bg} (accent tone) = ${ratio.toFixed(2)} (< ${threshold} ${accentSmallText ? "-- accent section carries small text" : "large"})`);
    else ok(`${fg} on ${bg} (accent tone) = ${ratio.toFixed(2)} (>= ${threshold}${accentSmallText ? "" : " large-only"})`);
  }
  if (accentSmallText) note("an accent-tone section appears to carry small text -- accent checked at 4.5, not the large-only 3.0");
  // NON-TEXT CONTRAST, 3.0: THE FORM FIELD EDGE (R121, WCAG 1.4.11). A field's 2px edge is the only
  // thing that shows where the control is, so it owes 3.0 against the FIELD it bounds and against
  // the CARD the field sits in. The spine drew it in --line, the rule-and-divider token, and nothing
  // scored it: 1.27 against the field and 1.38 against the card on this seed's skin, on every form.
  //
  // EVERY OPERAND IS READ OUT OF spine.css, NONE IS NAMED HERE: the edge token from the
  // `.form-card input` rule's border, the field ground from the same rule's background, the card
  // ground from `.form-card`'s background, and every `[data-card-ground]` override of --card-bg as a
  // further card ground. Each var() chain resolves to the first token the skin declares, as the
  // cascade does. A translucent edge is FLATTENED over the field's own ground before it is scored
  // against either side, because that is the pixel the browser paints: the field's background runs
  // under its border. The FOCUSED edge (the `:focus` rule's border token) is scored against the same
  // grounds, below.
  let nonTextChecked = 0;
  {
    const css = stripComments(read(P.spineCss) || "");
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sels: m[1].split(",").map((s) => s.trim()), body: m[2] }));
    const declOf = (body, prop) => (body.match(new RegExp("(?:^|[;\\s])" + prop + "\\s*:\\s*([^;]+)")) || [])[1] || null;
    const fromVar = (v) => (v && v.includes("var(") ? v.slice(v.indexOf("var(")) : null);
    // first opaque token the skin declares along a chain; a translucent GROUND is named, not guessed
    const opaqueGround = (expr) => {
      for (const m of (expr || "").matchAll(/(--[\w-]+)/g)) {
        if (T[m[1]]) return m[1];
        if (TA[m[1]]) { skippedTokens.add(`${m[1]} (translucent GROUND -- what sits behind it is not knowable here)`); return null; }
      }
      return null;
    };
    const field = rules.filter((r) => r.sels.includes(".form-card input") && /(?:^|[;\s])border(?:-color)?\s*:[^;]*var\(/.test(r.body)).pop();
    const card = rules.filter((r) => r.sels.includes(".form-card") && declOf(r.body, "background(?:-color)?")).pop();
    const edgeExpr = field && fromVar(declOf(field.body, "border(?:-color)?"));
    const fieldExpr = field && fromVar(declOf(field.body, "background(?:-color)?"));
    const cardExpr = card && fromVar(declOf(card.body, "background(?:-color)?"));
    if (!edgeExpr || !fieldExpr || !cardExpr) {
      soft(`cannot score the form field edge: spine.css has no ${!edgeExpr ? "`.form-card input` border token" : !fieldExpr ? "`.form-card input` background" : "`.form-card` background"} to read (WCAG 1.4.11 owes the edge 3.0)`);
    } else {
      const edge = (() => { for (const m of edgeExpr.matchAll(/(--[\w-]+)/g)) if (T[m[1]] || TA[m[1]]) return m[1]; return null; })();
      const fieldG = opaqueGround(fieldExpr);
      const cardGs = [opaqueGround(cardExpr)];
      if (/--card-bg\b/.test(cardExpr)) {
        for (const r of rules) {
          if (!r.sels.some((s) => /\[data-card-ground=/.test(s))) continue;
          const v = fromVar(declOf(r.body, "--card-bg"));
          const g = v && opaqueGround(v);
          if (g) cardGs.push(g);
        }
      }
      if (!edge || !fieldG) {
        soft(`cannot score the form field edge: ${!edge ? `no token along ${edgeExpr.trim()} is declared` : `the field ground ${fieldExpr.trim()} does not resolve to an opaque token`}`);
      } else {
        const fieldHex = T[fieldG];
        const sides = [["the field", fieldG], ...[...new Set(cardGs.filter(Boolean))].map((g) => ["the card", g])];
        const scoreEdge = (what, tok) => {
          const edgeHex = resolveColour(tok, fieldHex);
          const flat = !T[tok];
          const lbl = `${what} ${tok}${flat ? ` (rgba flattened over the field ${fieldG} -> ${edgeHex})` : ""}`;
          for (const [side, g] of sides) {
            nonTextChecked++;
            const ratio = cr(edgeHex, T[g]);
            if (ratio < 3.0) bad(`${lbl} vs ${side} ${g} = ${ratio.toFixed(2)} (< 3.0 non-text, WCAG 1.4.11)`);
            else ok(`${lbl} vs ${side} ${g} = ${ratio.toFixed(2)} (>= 3.0 non-text)`);
          }
        };
        scoreEdge("form field edge", edge);
        // THE FOCUSED EDGE, against the same grounds. The rest rule sets `outline: none`, so the
        // `:focus` border colour is the ONLY thing that shows which field has focus, and a re-skin
        // edits only tokens.css: a paler accent loses WCAG 1.4.11 and the visible focus indicator
        // together. Read out of spine.css the same way, from the rule naming `.form-card input:focus`.
        const focus = rules.filter((r) => r.sels.includes(".form-card input:focus") && /(?:^|[;\s])border(?:-color)?\s*:[^;]*var\(/.test(r.body)).pop();
        const focusExpr = focus && fromVar(declOf(focus.body, "border(?:-color)?"));
        const focusTok = focusExpr && (() => { for (const m of focusExpr.matchAll(/(--[\w-]+)/g)) if (T[m[1]] || TA[m[1]]) return m[1]; return null; })();
        if (!focusTok) soft(`cannot score the form field focus edge: spine.css has ${!focusExpr ? "no `.form-card input:focus` border token" : `no declared token along ${focusExpr.trim()}`} to read (it is the field's only focus indicator, and WCAG 1.4.11 owes it 3.0)`);
        else scoreEdge("form field focus edge", focusTok);
      }
    }
  }
  // THE DENOMINATOR, AND THE CHOICE, STATED IN THE SAME PLACE. A checker that reports a
  // verdict without its denominator has been silently narrowed before while it kept printing
  // OK, and the rgba class was outside the checked set for weeks with nothing saying so.
  // AND THE ASSERTIONS ARE NOT THE PAIRS: a pair two labels reach is asserted twice and is one
  // ink on one ground, so the line says how many DISTINCT pairs the assertions cover. Without it a
  // list that re-asserts pairs already in the matrix reads as new coverage.
  note(`AA denominator: ${derivedPairs} pair(s) derived, ${aaChecked} asserted, covering ` +
       `${assertedKeys.size} distinct ink/ground pair(s) (${aaChecked - assertedKeys.size} re-assert a pair ` +
       `already asserted, under a further label; ${flattenedPairs} assertion(s) with a translucent ink ` +
       `FLATTENED over its ground per the mapping profile's Rule B), ${skippedTokens.size} token(s) unresolvable; ` +
       `${nonTextChecked} non-text pair(s) asserted at 3.0 (the form field edge, at rest and on focus); ` +
       `hue slot(s) composed as a ground: ${groundRoutes.section.size} by <Section hue>, ${groundRoutes.carrier.size} ` +
       `by a hue carrier (<TierCard hue>, data-hue-tint), ${groundRoutes.component.size} by a component prop or an ` +
       `inline style (R063)`);
  if (skippedTokens.size) note(`tokens the AA matrix could NOT resolve, by name: ${[...skippedTokens].join(", ")}`);
  if (!aaChecked) bad("no colour token pairs found to check (tokens.css missing or unparseable)");
  return { aaChecked, distinct: assertedKeys.size, nonTextChecked };
}
{
  const baseLines = new Set();
  const recorded = (fn, kind) => (m) => { baseLines.add(`${kind}|${m}`); fn(m); };
  aaMatrix(BASE_T, BASE_TA, { ok: recorded(ok, "ok"), bad: recorded(bad, "bad"), soft: recorded(soft, "soft"), note: recorded(note, "note") });
  if (!TOKEN_BLOCKS.skins.size) note("skins: tokens.css carries no [data-skin] block, so [2] scored the base :root alone (R110)");
  for (const [name, skin] of TOKEN_BLOCKS.skins) {
    const s = skinMaps(skin.bodies.join("\n"));
    const tag = `skin "${name}": `;
    let same = 0, failed = 0;
    const ownLine = (fn, kind) => (m) => {
      if (baseLines.has(`${kind}|${m}`)) { same++; return; }
      if (kind === "bad") failed++;
      fn(tag + m);
    };
    const r = aaMatrix(s.T, s.TA, { ok: ownLine(ok, "ok"), bad: ownLine(bad, "bad"), soft: ownLine(soft, "soft"), note: ownLine(note, "note") });
    if (s.unread.length) note(`${tag}colour token(s) declared with a value [2] cannot read, so they are dropped from this ` +
      `skin's map rather than scored at the base value: ${s.unread.join(", ")}`);
    note(`${tag}${skin.selector} scored as its own map over the base :root (${s.declared.size} token(s) declared ` +
      `there): ${r.aaChecked} assertion(s) covering ${r.distinct} distinct pair(s) and ${r.nonTextChecked} non-text ` +
      `pair(s); ${failed} FAIL line(s) of its own, ${same} line(s) identical to the base pass not repeated (R110)`);
  }
}

// == 3. VOICE -- em-dash literal AND entity forms (auditor hardening) ==
// EVERY FORM, NOT FOUR (Factory backlog row "the site seed's em-dash gate misses ...", brief
// siteseed-emdash of 2026-10-13). This half read U+2014, &mdash;, &#8212; and &#x2014; alone, so
// &#08212;, an &#8212 with no semicolon and a lookalike all reached a site's copy past it: the blind
// spot F2 of the code review of AISmithFactory/aismith-hub-seed #161 found, which that seed's
// public.site_has_em_dash() folded. It now reads U+2014 and its lookalikes U+2015 (horizontal bar),
// U+2E3A and U+2E3B (the two- and three-em dash), U+FE31 (the vertical em dash) and U+FE58 (the small
// em dash), literal, and every entity form of the six, case-insensitive: named (&mdash, &horbar),
// decimal and hex, with any leading zeros and with or without the semicolon. A digit after the
// number ends no match, so &#82120; is not &#8212. An en dash (U+2013) and a hyphen are none of
// these. A FAIL names the forms it found, since a lookalike is hard to see in an editor.
out.push("\n[3] VOICE -- zero prose em-dashes (literal + entity); superlatives flagged");
const copyFiles = [...walk(P.content, [".tsx", ".ts"]), ...walk(P.routes, [".tsx", ".ts"]), ...walk(P.spineDir, [".tsx", ".ts"])];
// AND THE STRING VALUES OF src/content/*.json, read as copy by both halves (Factory backlog row
// 1897). aismith-site #95 moved 14 literals out of site.config.tsx into src/content/legal-controller.json
// and every one of them left this section, whose corpus was *.tsx and *.ts alone. A JSON file holds
// no markup and no code, so its copy is its string values at any depth; its keys are lookups and
// are not read. The top level of src/content only, as the row names it. A file that does not parse
// is read as its comment-stripped text, as a source file is without a parser, and a note names it.
const copyJson = existsSync(P.content)
  ? readdirSync(P.content).filter((e) => e.endsWith(".json")).map((e) => join(P.content, e)).filter((p) => statSync(p).isFile()) : [];
const jsonCopy = new Map(), jsonUnparsed = [];
let jsonStrings = 0;
for (const f of copyJson) {
  const src = read(f) || "";
  const strings = [];
  const visit = (v) => { if (typeof v === "string") strings.push(v); else if (v && typeof v === "object") Object.values(v).forEach(visit); };
  try { visit(JSON.parse(src)); jsonStrings += strings.length; jsonCopy.set(f, strings); }
  catch { jsonUnparsed.push(relative(ROOT, f)); jsonCopy.set(f, [stripComments(src)]); }
}
let emDash = 0; const emFiles = []; const emForms = new Set();
// by escape, not by character, so this file stays ASCII
const EM_LITERAL = /[\u2014\u2015\u2e3a\u2e3b\ufe31\ufe58]/g;
const EM_ENTITY = /&(?:mdash|horbar);?|&#0*(?:8212|8213|11834|11835|65073|65112)(?![0-9]);?|&#x0*(?:2014|2015|2e3a|2e3b|fe31|fe58)(?![0-9a-f]);?/gi;
for (const f of [...copyFiles, ...copyJson]) {
  const body = jsonCopy.has(f) ? jsonCopy.get(f).join("\n") : stripComments(read(f) || "");
  const lit = body.match(EM_LITERAL) || [], ent = body.match(EM_ENTITY) || [];
  for (const c of lit) emForms.add("U+" + c.codePointAt(0).toString(16).toUpperCase());
  for (const e of ent) emForms.add(e);
  const n = lit.length + ent.length;
  if (n) { emDash += n; emFiles.push(relative(ROOT, f)); }
}
if (emDash) bad(`${emDash} em-dash(es) in rendered copy (literal or entity): ${emFiles.join(", ")}; forms: ${[...emForms].join(", ")}`);
else ok("no em-dashes in rendered copy (U+2014 and its five lookalikes, literal or any entity form; comments exempt, S9.4)");

// THE SUPERLATIVE HALF, BY DECLARED REGISTER (R055; Factory plan-voice-check-2026-10-11 v0.2,
// unit U1). One regex of 26 words, Dutch and English mixed, used to run over every file's raw
// source here: no register, no morphology, no stop-list, and because the corpus is SOURCE, code
// reached it on every site (aismith-site's only candidate was the identifier `const unique`).
//
//   REGISTER. The arm is chosen by the <html lang> __root hard-sets, the declaration [4] already
//     holds every site to (ruled 2026-10-12, Q1 (a)), by its PRIMARY subtag, so the seed's own
//     `en-GB` selects `en` (ruled F9). Any other language, or none, runs the hype list alone and
//     says so as REVIEW: never soft() and never bad(), because S9.3 is IMPORTANT and soft() fails
//     closed under --ci. A missing lang is [4]'s to fail, not this arm's.
//   WHAT IS MATCHED. COPY, not source (ruled Q2 (a)): a TypeScript parse of each corpus file
//     collects JSX text, string literals and template text, minus module specifiers, string-literal
//     TYPES (`<K extends "onRequest">`) and the values of the non-copy JSX attributes in
//     VOICE_NON_COPY_ATTRS. A string passed as a call argument (`toggle("onRequest")`) is still
//     read as copy: no parse can tell it from a label. `typescript` is borrowed from the
//     node_modules at the SITE's root, so this file keeps no dependency of its own; where the site
//     has none, the arm reads the comment-stripped body as before and says so in a note. It never
//     fails. The string values of src/content/*.json are copy as they stand, parser or none.
//   THE LISTS, each CLOSED. English: `-est` morphology plus four irregulars, minus a stop-list of
//     the eight non-superlatives measured in the two English corpora. Dutch: the superlative forms
//     measured in the two Dutch corpora, `aller...ste`, and the analytic `meest <adjective>`, while
//     ordinals, adjectival `-ste` and the quantifier `meeste` stay out (morphology was measured 60
//     percent wrong on Dutch). Hype: the old list's non-superlative words plus `prachtig` and
//     `hartverwarmend`, run whatever the arm, because copy says AMAZING in any language.
//   Every output is review() (S9.5): under-coverage here costs a missed prompt, not a false pass.
//
// The old list's three context exclusions carry over unchanged, onto the English arm and the hype
// list: "as best we reasonably can" is a liability hedge, "best practice(s)", "best effort" and
// "best of our knowledge" are terms of art, so they are excluded by context rather than by dropping
// the word, and "the best CRM" still surfaces. The em-dash half above never reads the parse.
const VOICE_STOP_EN = ["request", "interest", "honest", "test", "digest", "rest", "manifest", "attest"];
const VOICE_ARMS = {
  en: { re: /(?<!\bas\s)(?<!\p{L})(?:\p{L}+est|best|most|least|worst)(?!\p{L})(?!\s+(?:practices?|effort|of\s+our\s+knowledge))/giu,
        keep: (w) => !VOICE_STOP_EN.includes(w.toLowerCase()) },
  nl: { re: /(?<!\p{L})(?:beste|grootste|mooiste|verste|liefste|leukste|zotste|slimste|schattigste|lelijkste|oudste|jongste|enigste|aller\p{L}+ste|meest\s+\p{L}+)(?!\p{L})/giu,
        keep: () => true },
};
const VOICE_HYPE = /(?<!\bas\s)\b(?:uniek|magisch|naadloos|onvergetelijk|wereldklasse|toonaangevend|onge[eë]venaard|revolutionair|prachtig|hartverwarmend|leading|premier|world-class|cutting-edge|revolutionary|unique|amazing|incredible|unparalleled|ultimate|seamless|effortless|transformative|unforgettable|magical)\b(?!\s+(?:practices?|effort|of\s+our\s+knowledge))/gi;
const VOICE_NON_COPY_ATTRS = new Set(["className", "id", "key", "href", "to", "src", "rel", "type", "role", "name"]);
// [4]'s own expression for the lang __root hard-sets, read the same way, raw. The file holds it
// three times, here, in [4] and in [4]'s og:locale check, and C18 in verify.selftest.mjs fails
// unless all three are byte-identical: change all three together.
const voiceLang = ((read(P.root) || "").match(/<html\s+lang=["']([a-zA-Z-]+)["']/) || [])[1] || null;
const voicePrimary = voiceLang ? voiceLang.split("-")[0].toLowerCase() : null;
const voiceArms = voicePrimary && Object.hasOwn(VOICE_ARMS, voicePrimary) ? [voicePrimary] : [];
// The site's own copy only: node_modules/typescript at the site's ROOT, where `npm ci` installs
// it, and neither one in a directory above the root nor the global folders (NODE_PATH and the
// like) that require() would also consult, so the extractor this gate uses is a fact about the
// tree and not about the machine it runs on.
let voiceTs = null, voiceTsAt = null, voiceTsWhy = "no node_modules/typescript at the site's root";
const voiceTsDir = join(resolve(ROOT), "node_modules", "typescript");
if (existsSync(join(voiceTsDir, "package.json"))) {
  voiceTsAt = relative(ROOT, voiceTsDir).replace(/\\/g, "/");
  try {
    const ts = createRequire(import.meta.url)(voiceTsDir);
    if (typeof ts.createSourceFile === "function") voiceTs = ts;
    else voiceTsWhy = `${voiceTsAt} exports no createSourceFile`;
  } catch { voiceTsWhy = `${voiceTsAt} did not load`; }
}
// The copy one file carries, as a list of strings, and how many syntax errors the parser
// recovered from on the way (createSourceFile does not throw on malformed source: it recovers and
// records each error in parseDiagnostics, so the count is the fact worth stating).
function voiceCopy(ts, file, text) {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, false, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const strings = [], skip = new Set();
  const visit = (n) => {
    if (skip.has(n)) return;
    if ((ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) && n.moduleSpecifier) skip.add(n.moduleSpecifier);
    else if (ts.isImportEqualsDeclaration(n) && ts.isExternalModuleReference(n.moduleReference)) skip.add(n.moduleReference.expression);
    else if (ts.isCallExpression(n) && n.arguments.length &&
      (n.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(n.expression) && n.expression.text === "require"))) skip.add(n.arguments[0]);
    else if (ts.isImportTypeNode(n)) skip.add(n.argument);
    else if (ts.isModuleDeclaration(n) && ts.isStringLiteral(n.name)) skip.add(n.name);
    else if (ts.isLiteralTypeNode(n) && ts.isStringLiteral(n.literal)) skip.add(n.literal); // a string-literal TYPE is not copy
    else if (ts.isJsxAttribute(n) && ts.isIdentifier(n.name) &&
      (VOICE_NON_COPY_ATTRS.has(n.name.text) || n.name.text.startsWith("data-"))) return; // markup, not copy
    if (ts.isJsxText(n)) { if (!n.containsOnlyTriviaWhiteSpaces) strings.push(n.text); }
    else if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateHead(n) ||
      ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) strings.push(n.text);
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return { strings, errors: sf.parseDiagnostics?.length ?? 0 };
}
const voiceRun = [...voiceArms, "hype"];
const voiceCount = Object.fromEntries(voiceRun.map((a) => [a, 0]));
const voiceHits = [], voiceParseErrors = [];
let voiceStrings = 0;
for (const f of [...copyFiles, ...copyJson]) {
  const src = read(f) || "";
  let texts;
  if (jsonCopy.has(f)) texts = jsonCopy.get(f);
  else if (voiceTs) {
    const { strings, errors } = voiceCopy(voiceTs, f, src);
    texts = strings; voiceStrings += strings.length;
    if (errors) voiceParseErrors.push(`${relative(ROOT, f)} (${errors})`);
  } else texts = [stripComments(src)];
  for (const arm of voiceRun) {
    const re = arm === "hype" ? VOICE_HYPE : VOICE_ARMS[arm].re;
    const hits = texts.flatMap((t) => [...t.matchAll(re)].map((m) => m[0].replace(/\s+/g, " ")))
      .filter(arm === "hype" ? () => true : VOICE_ARMS[arm].keep);
    voiceCount[arm] += hits.length;
    if (hits.length) voiceHits.push(`${relative(ROOT, f)} [${arm}]: ${[...new Set(hits)].join(", ")}`);
  }
}
if (!voiceArms.length) review(`register: no arm for lang=${voiceLang ?? "(none)"} -- the arms are ${Object.keys(VOICE_ARMS).join(" and ")}, ` +
  `chosen by the primary subtag of the <html lang> __root hard-sets, so only the hype list ran`);
const voiceRoots = [["src/content", P.content], ["src/routes", P.routes], ["src/components/spine", P.spineDir]];
note(`voice arm=${voiceArms[0] ?? "none"}${voiceLang ? ` from <html lang="${voiceLang}"> in src/routes/__root.tsx (primary subtag)`
  : `, src/routes/__root.tsx hard-sets no <html lang="..">`}, plus the hype list; ` +
  `extractor: ${voiceTs ? `TypeScript parse (typescript ${voiceTs.version}, ${voiceTsAt}), ${voiceStrings} string(s) extracted` : "comment-stripped source (FALLBACK)"}; ` +
  `corpus: src/content, src/routes and src/components/spine, *.tsx and *.ts, ${copyFiles.length} file(s): ` +
  `${voiceRoots.map(([name, dir]) => `${name} ${copyFiles.filter((f) => f.startsWith(dir + sep)).length}`).join(", ")}, ` +
  `and the string values of src/content/*.json, ${copyJson.length} file(s), ${jsonStrings} string(s); ` +
  `matches: ${voiceRun.map((a) => `${a} ${voiceCount[a]}`).join(", ")}`);
if (jsonUnparsed.length) note(`voice corpus: ${jsonUnparsed.join(", ")} did not parse as JSON, so both halves read its ` +
  `comment-stripped text, keys included`);
if (!voiceTs) note(`voice extractor FALLBACK: ${voiceTsWhy}, so the arms read each file's comment-stripped source, code ` +
  `included, and identifiers can surface as candidates (npm ci installs it where the site lists it)`);
if (voiceParseErrors.length) note(`voice extractor: the parse recovered from syntax errors in ${voiceParseErrors.join(", ")}, ` +
  `and those files' copy is read as the parser recovered it`);
// The example is the running arm's own greeting: "Beste klant" is no candidate under en, where
// "Best wishes" is.
const voiceGreeting = { en: '"Best wishes"', nl: '"Beste klant"' }[voiceArms[0]] ?? "a greeting";
if (voiceHits.length) review(`superlative candidates -- ADVISORY, never blocks (${voiceGreeting} is fine, so is a liability hedge): ${voiceHits.join(" | ")}`);
else ok("no superlative candidates");

// == 4. PER-ROUTE META + LANG + NOINDEX + TITLE UNIQUENESS ==
out.push("\n[4] META / LANG / NOINDEX -- per-route head, unique titles, host-agnostic sitemap, the link-preview card");
const rootSrc = read(P.root);
if (!rootSrc) bad("src/routes/__root.tsx not found");
else {
  const lang = rootSrc.match(/<html\s+lang=["']([a-zA-Z-]+)["']/);
  if (lang && lang[1]) ok(`__root hard-sets lang="${lang[1]}"`);
  else bad('__root does not hard-set <html lang="..">');
  if (/seo\.noindex/.test(rootSrc)) ok("__root gates robots meta on seo.noindex");
  else bad("__root does not reference seo.noindex (robots meta gate missing)");
}
const cfg = read(P.config);
if (cfg && /export\s+const\s+seo\s*=\s*{[^}]*noindex/.test(cfg)) ok("site.config exports seo.noindex");
else bad("site.config does not export seo = { noindex }");

const routeFiles = walk(P.routes, [".tsx"]).filter((f) => !f.endsWith("__root.tsx"));
const missing = [], titles = [];
for (const f of routeFiles) {
  const s = read(f) || "";
  if (!/head\s*:/.test(s) || !/title/.test(s)) missing.push(relative(ROOT, f));
  const t = s.match(/title\s*:\s*["'`]([^"'`]+)["'`]/);
  if (t) titles.push(t[1].trim());
}
if (!routeFiles.length) bad("no route files found under src/routes");
else if (missing.length) bad(`routes without head()/title: ${missing.join(", ")}`);
else ok(`all ${routeFiles.length} route(s) carry head() with a title`);
// title uniqueness (auditor hardening)
const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
if (dupes.length) bad(`duplicate route <title>s (each route needs a unique title): ${[...new Set(dupes)].join(" | ")}`);
else if (titles.length) ok(`all ${titles.length} route titles are unique`);

existsSync(P.sitemap) ? ok("public/sitemap.xml present") : bad("public/sitemap.xml missing");
existsSync(P.robots) ? ok("public/robots.txt present") : bad("public/robots.txt missing");
// sitemap host NOT hardcoded (spike correction 3): if site.config declares a canonical
// host, the sitemap must agree with IT -- we never assert a literal aismith.io here.
const smap = read(P.sitemap);
if (smap) {
  const declared = cfg && (cfg.match(/canonicalHost\s*:\s*["'`]([^"'`]+)["'`]/) || cfg.match(/host\s*:\s*["'`](https?:\/\/[^"'`]+)["'`]/));
  if (declared) {
    const host = declared[1].replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (smap.includes(host)) ok(`sitemap host matches site.config canonical host (${host})`);
    else bad(`sitemap host does not match site.config canonical host (${host}) -- no hardcoded host assumed`);
  } else note("site.config declares no canonical host; sitemap host left unchecked (not hardcoded)");
}

// THE LINK-PREVIEW CARD (R221), checked against its own bytes. site.config's `og` block is the fill
// point the root head builds every og:image tag from, and its comment asks a human to keep type,
// width and height true to the file. Nothing checked that, so deleting public/og-card.png left this
// gate green while every shared link rendered a broken card, which is the row's own defect class.
// So where `og.image` is declared, the file it names under public/ must exist, be under 300 KB, be
// the 1200 x 630 landscape card the row sets (a near-square image renders as a small thumbnail),
// and be what `og.type`, `og.width` and `og.height` say it is, read from its PNG or JPEG header. An
// image on another host cannot be read from here and is named for review. No `og` block at all is
// a note, because a site that has not taken the fill point has nothing here to be false to.
//
// AND og:locale AGREES WITH THE <html lang> __root hard-sets. They are two statements of one
// language, so their language subtags must match, and their regions too where both carry one.
{
  const cfgSrc = stripComments(cfg || "");
  const at = cfgSrc.match(/export\s+const\s+og\s*=\s*\{/);
  const ogSrc = at ? braced(cfgSrc, at.index + at[0].length - 1) || "" : null;
  const field = (k) => {
    const m = ogSrc && ogSrc.match(new RegExp("\\b" + k + "\\s*:\\s*(?:[\"'`]([^\"'`]*)[\"'`]|(\\d+))"));
    return m ? (m[1] ?? m[2]) : null;
  };
  // { type, w, h } from a PNG IHDR or a JPEG start-of-frame; null for any other format
  const imageHeader = (buf) => {
    if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47 && buf.toString("ascii", 12, 16) === "IHDR")
      return { type: "image/png", w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
    for (let i = 2; i + 9 < buf.length;) {
      if (buf[i] !== 0xff) { i++; continue; }
      const mk = buf[i + 1];
      if (mk === 0xff) { i++; continue; }
      if (mk === 0x01 || (mk >= 0xd0 && mk <= 0xd8)) { i += 2; continue; }
      if (mk >= 0xc0 && mk <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(mk))
        return { type: "image/jpeg", w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return { type: "image/jpeg", w: null, h: null };
  };
  const img = field("image");
  if (!img) note("site.config declares no og.image, so the link-preview card is not checked (R221)");
  else {
    const hostDecl = (cfgSrc.match(/canonicalHost\s*:\s*["'`]([^"'`]+)["'`]/) || [])[1] || null;
    const hostOf = (u) => { try { return new URL(u).host; } catch { return null; } };
    let path = null;
    if (/^https?:\/\//i.test(img)) {
      if (hostDecl && hostOf(img) === hostOf(hostDecl)) path = decodeURIComponent(new URL(img).pathname);
      else review(`og.image ${img} is not on the site's own host${hostDecl ? ` (${hostDecl})` : ""}, so the gate cannot read ` +
        `the card, and a card hosted elsewhere breaks when that host does (R221)`);
    } else path = "/" + img.replace(/^\.?\//, "");
    if (path) {
      const file = join(ROOT, "public", path);
      if (!existsSync(file) || !statSync(file).isFile()) {
        bad(`og.image ${img} names public${path}, which does not exist: every shared link renders a broken card (R221)`);
      } else {
        const buf = readFileSync(file);
        const kb = (buf.length / 1024).toFixed(0);
        const head = imageHeader(buf);
        const problems = [];
        if (buf.length > 300 * 1024) problems.push(`it is ${kb} KB, over the 300 KB a messaging app will fetch`);
        if (head && head.w) {
          if (head.w !== 1200 || head.h !== 630) problems.push(`it is ${head.w} x ${head.h}, not the 1200 x 630 landscape card`);
          const W = field("width"), H = field("height"), TY = field("type");
          if (W !== String(head.w) || H !== String(head.h)) problems.push(`og.width x og.height read ${W ?? "unset"} x ${H ?? "unset"} and the file is ${head.w} x ${head.h}`);
          if (TY !== head.type) problems.push(`og.type reads ${TY ?? "unset"} and the file is ${head.type}`);
        } else review(`link-preview card public${path} is not a PNG or JPEG whose header this gate can read, so its dimensions and type are unchecked (R221)`);
        if (problems.length) bad(`link-preview card public${path}: ${problems.join("; ")} (R221)`);
        else if (head && head.w) ok(`link-preview card public${path} is ${head.w} x ${head.h} ${head.type}, ${kb} KB, and og.type, og.width and og.height are true to it (R221)`);
      }
    }
  }
  const loc = field("locale");
  const langTag = rootSrc && (rootSrc.match(/<html\s+lang=["']([a-zA-Z-]+)["']/) || [])[1];
  if (loc && langTag) {
    const [lLang, lReg] = langTag.toLowerCase().split("-");
    const [oLang, oReg] = loc.toLowerCase().split(/[_-]/);
    if (lLang !== oLang || (lReg && oReg && lReg !== oReg))
      bad(`og.locale ${loc} and <html lang="${langTag}"> in __root state different languages; they are one fact and must agree`);
    else ok(`og.locale ${loc} agrees with <html lang="${langTag}"> in __root`);
  }
}

// == 5. CHARTER <-> REPO (bidirectional -- auditor hardening) ==
out.push("\n[5] CHARTER <-> REPO -- routes match in BOTH directions");
// DECLARE-THEN-ENFORCE (site-contract 1.8.8), the same pattern as [6] LOGO and the
// sitemap<->host check. The charter declares its routes in ONE fenced block:
//
//     ```routes
//     /
//     /apps
//     /contact
//     ```
//
// and nothing outside that block is read. The previous parser scavenged every backticked
// lowercase token in the whole document, which on the aismith.io charter meant it declared
// `aismith-site`, `aismith-site-seed`, `aismith-skins`, `data-skin`, `fetch`, `forge`,
// `noindex` and `verify` as ROUTES while missing all twelve real ones -- the charter writes
// them slash-prefixed as `/apps`, and the regex required a leading letter. It then reported
// 11 of 12 repo routes as undeclared orphans. Its own guard ("charter declares routes none
// of which exist") passed only because `contact` happened to appear in backticks elsewhere
// in the prose: one coincidental token was the only thing stopping the check from admitting
// it had parsed nothing. Widening the regex would have kept the scavenging; a delimited
// block ends it.
// A ROUTE FILE'S PATH IS TANSTACK ROUTER'S FILE CONVENTION, NOT ITS BASENAME (R111). This keyed each
// file by basename(f) with `.tsx` stripped, so `takken.kapoenen.tsx` read as `/takken.kapoenen`
// where the router serves `/takken/kapoenen`, and `takken/kapoenen.tsx` lost its parent and read as
// `/kapoenen`; sz-site took flat tak routes to stay clear of it. The convention, as the router's
// generator applies it: a directory and an unescaped `.` each end a segment and `[x]` escapes x;
// `index` is its parent's own page and a final `route` is its directory's route; a segment opening
// with `_` is a pathless layout and a `(x)` segment a group, and neither is in the URL; a trailing `_`
// is dropped; a `.lazy` file is its route's lazy half; and a file or directory opening with `-` is
// not a route at all. A file whose last segment is a layout or a group has no path of its own, so it
// returns null and [5] names it rather than reading it as a page.
const routePathOf = (file) => {
  const rel = relative(P.routes, file).replace(/\\/g, "/").replace(/\.tsx$/, "").replace(/\.lazy$/, "");
  // each segment as { text } for the URL and { raw } for the tests, an escaped character reading as
  // a plain letter in `raw` so `[_]x` is not a layout and `[.]` does not split
  const segs = [{ text: "", raw: "" }];
  let esc = false;
  for (const c of rel) {
    const cur = segs[segs.length - 1];
    if (esc) { if (c === "]") esc = false; else { cur.text += c; cur.raw += "x"; } }
    else if (c === "[") esc = true;
    else if (c === "/" || c === ".") segs.push({ text: "", raw: "" });
    else { cur.text += c; cur.raw += c; }
  }
  const pathless = (s) => s.raw.startsWith("_") || /^\(.*\)$/.test(s.raw);
  if (segs.some((s) => s.raw.startsWith("-"))) return null;
  const last = segs[segs.length - 1].raw;
  if (last === "index") segs.pop();
  else if (last === "route") { segs.pop(); if (segs.length && pathless(segs[segs.length - 1])) return null; }
  else if (pathless(segs[segs.length - 1])) return null;
  const kept = segs.filter((s) => !pathless(s)).map((s) => (s.raw.endsWith("_") ? s.text.slice(0, -1) : s.text)).filter(Boolean);
  return "/" + kept.join("/");
};
const normalise = (d) => {
  let t = d.trim().replace(/[`'"]/g, "");
  if (!t || t.startsWith("#")) return null;
  if (!t.startsWith("/")) t = `/${t}`;
  return t.replace(/\/+$/, "") || "/";
};
if (CHARTER && existsSync(CHARTER)) {
  const ch = read(CHARTER) || "";
  const block = ch.match(/```routes\s*\n([\s\S]*?)```/);
  if (!block) {
    soft(`charter ${relative(ROOT, CHARTER)} has no \`\`\`routes block -- add one listing every ` +
         `public route, one per line, slash-prefixed (/ for index). Nothing outside that block ` +
         `is read as a route declaration` + (CI ? " (failing closed in CI)" : ""));
  } else {
    const declared = new Set(block[1].split("\n").map(normalise).filter(Boolean));
    const repoPaths = new Map(), noPath = [];
    for (const f of routeFiles) {
      const p2 = routePathOf(f);
      if (p2 === null) noPath.push(relative(ROOT, f));
      else repoPaths.set(p2, relative(ROOT, f));
    }
    if (noPath.length) note(`route file(s) the router reads as a pathless layout, a group or an ignored file, ` +
      `so they declare no path of their own and are not reconciled (R111): ${noPath.join(", ")}`);
    const orphanInRepo = [...repoPaths.keys()].filter((p2) => !declared.has(p2));
    const declaredNotBuilt = [...declared].filter((p2) => !repoPaths.has(p2));
    if (!declared.size) bad(`charter \`\`\`routes block is empty`);
    if (orphanInRepo.length) bad(`repo route(s) not declared in charter (orphan): ${orphanInRepo.join(", ")}`);
    // The other direction, and it is the half that catches a RETIRED route still declared.
    // Previously this was only "none of which exist", which one accidental match satisfied.
    if (declaredNotBuilt.length) bad(`charter declares route(s) that do not exist in the repo: ${declaredNotBuilt.join(", ")}`);
    if (!orphanInRepo.length && !declaredNotBuilt.length && declared.size)
      ok(`charter <-> repo routes reconcile both ways (${declared.size} declared, ${repoPaths.size} built)`);
  }
} else if (CHARTER) {
  // SET BUT NOT ON DISK. The old message read "no --charter supplied" here, which is false
  // and cost `cafe-josee-site` six red pushes: the workflow DID supply one, the value was
  // the seed's unreplaced `aismith-site-charter.md`, and the operator read the message as
  // "the workflow forgot the argument" and looked in the wrong place. Absent and missing
  // are different defects with different fixes and they now say so.
  (CI ? bad : soft)(`--charter ${CHARTER} was supplied but no such file exists in the repo ` +
    `(this is a MISSING charter, not an absent argument: the workflow's CHARTER value names ` +
    `a file that was never created -- check it was replaced for this site)` + (CI ? " (failing closed in CI)" : ""));
} else {
  (CI ? bad : soft)(`no --charter argument supplied at all; charter<->repo reconciliation skipped` + (CI ? " (failing closed in CI)" : ""));
}

// == 6. LOGO ASSET -- the real extracted mark, never a text-only wordmark fallback ==
// Closes the long-standing enforcement gap: intake S6 / build-agent S6.5 require the
// logo to be the REAL mark extracted from the live site (an image asset), never a
// text-only wordmark stand-in -- but until now this was build-discipline + audit only,
// so cafekamiel and planttrekkerij both shipped a text wordmark past a green gate.
// Mechanism (declare-then-enforce, like the sitemap<->host and charter<->repo checks):
// site.config declares brandMark { kind: "image" | "wordmark" }. DEFAULT = "image", so
// a SILENT text fallback fails closed; a wordmark is legal ONLY when explicitly declared
// (the AS reference instance is a genuine typographic mark and declares kind:"wordmark").
out.push("\n[6] LOGO -- real image mark by default; text wordmark only if explicitly declared");
// (a) resolve the declared brand-mark kind from site.config (default image).
let markKind = "image", markSrc = null;
if (cfg) {
  const bm = cfg.match(/brandMark\s*:\s*\{([\s\S]*?)\}/);
  if (bm) {
    const k = bm[1].match(/kind\s*:\s*["'`](image|wordmark)["'`]/);
    if (k) markKind = k[1];
    const s = bm[1].match(/src\s*:\s*["'`]([^"'`]+)["'`]/);
    if (s) markSrc = s[1];
  }
}
// (b) resolve the logo NODE: the JSX passed to SiteHeader/SiteFooter as logo={...}.
//     It may be inline JSX or an identifier defined (const X = ...) in __root or site.config.
function braced(src, openIdx) { // openIdx points at the '{' after logo=
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) return src.slice(openIdx + 1, i); }
  }
  return null;
}
function resolveLogoNode() {
  for (const [src, srcPath] of [[rootSrc, P.root], [cfg, P.config]]) {
    if (!src) continue;
    const m = src.match(/logo\s*=\s*\{/);
    if (!m) continue;
    const inner = (braced(src, m.index + m[0].length - 1) || "").trim();
    if (!inner) continue;
    if (/^[A-Za-z_$][\w$]*$/.test(inner)) {
      // identifier -> find its definition in __root or site.config
      for (const s2 of [rootSrc, cfg]) {
        if (!s2) continue;
        const def = s2.match(new RegExp("const\\s+" + inner + "\\s*=\\s*([\\s\\S]*?);", ""));
        if (def) return { node: def[1], src: s2, srcPath, via: inner };
      }
      return { node: inner, src, srcPath, via: inner, unresolved: true };
    }
    return { node: inner, src, srcPath, via: "inline" };
  }
  return null;
}
const logoRef = resolveLogoNode();
// (c) classify image vs text-only.
const VECTOR = /<(path|polygon|polyline|circle|ellipse|rect|line|image|use)\b/i;
// Resolve a local module specifier ("@/components/Logo", "./Logo") to a file on disk.
// v0.13.4 (#155 companion): a mark delivered as a LOCAL COMPONENT is still an image mark.
// Before this, isImageNode saw only inline JSX / <img> / an imported asset FILE, so
// aismith.io's real anvil-and-spark vector -- drawn with currentColor so the header
// renders it Iron and the footer Paper -- classified as a text-only wordmark. Proof that
// this was the checker and not the site: the reference seed's own logo failed it too.
const CODE_EXT = [".tsx", ".ts", ".jsx", ".js"];
// v0.13.6: resolve RELATIVE specifiers against the IMPORTING FILE's directory, not against
// src/. The first cut resolved "../components/Logo" as ROOT/src/../components/Logo, which is
// ROOT/components/Logo -- wrong, and it silently returned null so the mark stayed unresolved.
// It passed its fixture only because the fixture used the "@/" alias, i.e. the case the code
// implemented rather than the case aismith.io actually ships.
function resolveLocalModule(spec, fromFile) {
  if (!spec) return null;
  let rel = null;
  if (spec.startsWith("@/") || spec.startsWith("~/")) rel = join(ROOT, "src", spec.slice(2));
  else if (spec.startsWith("./") || spec.startsWith("../")) {
    rel = fromFile ? join(dirname(fromFile), spec) : join(ROOT, "src", spec);
  }
  else if (spec.startsWith("src/") || spec.startsWith("/src/")) rel = join(ROOT, spec.replace(/^\//, ""));
  else return null; // bare specifier = a package, not a local mark
  for (const cand of [rel, ...CODE_EXT.map((e) => rel + e), ...CODE_EXT.map((e) => join(rel, "index" + e))]) {
    try { if (existsSync(cand) && statSync(cand).isFile()) return cand; } catch { /* ignore */ }
  }
  return null;
}
function isImageNode(node, srcText, depth = 0, fromFile = null) {
  if (/<img\b/i.test(node)) return true;
  if (/<svg\b/i.test(node) && VECTOR.test(node)) return true;
  const ids = [...node.matchAll(/\b([A-Za-z_$][\w$]*)\b/g)].map((m) => m[1]);
  for (const id of ids) {
    // (i) imported asset FILE referenced by the node
    const imp = (srcText || "").match(new RegExp("import\\s+" + id + "\\s+from\\s+[\"'`][^\"'`]+\\.(svg|png|webp|jpe?g|avif|gif)[\"'`]", "i"));
    if (imp) return true;
    // (ii) LOCAL COMPONENT module: resolve it and classify its contents (one hop, no cycles)
    if (depth < 2) {
      const m = (srcText || "").match(
        new RegExp("import\\s+(?:\\{[^}]*\\b" + id + "\\b[^}]*\\}|" + id + ")\\s+from\\s+[\"'`]([^\"'`]+)[\"'`]")
      );
      const file = m && resolveLocalModule(m[1], fromFile);
      if (file) {
        let body = "";
        try { body = readFileSync(file, "utf8"); } catch { /* unreadable = not proof */ }
        if (body && isImageNode(body, body, depth + 1, file)) return true;
      }
    }
  }
  return false;
}
// (d) enforce.
if (!logoRef) {
  (CI ? bad : soft)("logo node not found (no logo={...} on SiteHeader/SiteFooter); cannot prove a real image mark");
} else {
  const img = isImageNode(logoRef.node, logoRef.src, 0, logoRef.srcPath);
  if (markKind === "wordmark") {
    if (img) ok("brandMark declared 'wordmark' and the logo carries an image mark (over-delivers; ok)");
    else ok(`brandMark explicitly declared 'wordmark' -- text mark sanctioned (genuine typographic brand; ${logoRef.via})`);
  } else { // image (default, incl. undeclared)
    if (img) ok(`logo resolves to a real image mark (${logoRef.via})`);
    else bad(`logo is a TEXT-ONLY wordmark (${logoRef.via}) but brandMark.kind is '${markKind}'` +
      (cfg && /brandMark/.test(cfg) ? "" : " (defaulted -- not declared)") +
      `: the real extracted mark must be an image asset (intake S6 / build-agent S6.5). ` +
      `Extract the live-site mark, or declare brandMark.kind='wordmark' ONLY if the brand is genuinely typographic.`);
  }
  // (e) if an image src is declared as a public path, the asset must exist.
  if (markKind === "image" && markSrc && markSrc.startsWith("/")) {
    existsSync(join(ROOT, "public", markSrc.replace(/^\//, "")))
      ? ok(`declared logo asset present (public${markSrc})`)
      : bad(`brandMark.src '${markSrc}' declared but public${markSrc} is missing`);
  }
}


// == 7. SSR -- HONEST NOTE (auditor hardening; the residual production gate, E.e) ==
out.push("\n[7] SSR VIEW-SOURCE -- out of scope for this static gate");
note("This gate does NOT prove SSR. The residual production gate is one green `vite build`");
note("plus a view-source by a NON-builder (or CI) confirming rendered copy in the HTML, not");
note("an empty root div (as-site-build-agent.md Section 6.4). Run before PRODUCTION promotion.");

// == 8. TEMPLATE INSTANTIATION -- the gate's own workflow, checked rather than instructed ==
//
// A SITE'S GATE WORKFLOW SAT OUTSIDE THE GATE BY CONSTRUCTION. [0] and [1] re-derive the
// baseline by directory scan over src/components/spine + spine.css, so
// .github/workflows/site-verify.yml is outside the compared set NO MATTER WHAT IT CONTAINS
// -- and that file's own lines instruct a builder to replace two values in it. Instruction
// is not enforcement. Measured 2026-08-14 at cafe-josee-site: it inherited the seed's
// `CHARTER: aismith-site-charter.md` and `SEED_REF: main` verbatim, `site-verify` FAILED on
// ALL SIX pushes from repo creation, and every LOCAL run reported exit 0, because the
// workflow passes --ci and a set-but-missing charter only warned without it.
//
// So the fill-ins are checked here, in the file the workflow runs. Each finding NAMES THE
// FIELD, because "the workflow is wrong" sends a reader to the wrong file.
out.push("\n[8] INSTANTIATION -- the workflow's fill-ins are replaced, not inherited");
{
  // Find the gate workflow by CONTENT, not by filename: at least one site has renamed it,
  // and a check keyed to a filename would report a clean absence on a repo that renamed it.
  const wfDir = join(ROOT, ".github/workflows");
  const wfFiles = walk(wfDir, [".yml", ".yaml"]).filter((f) => /SEED_REPO\s*:/.test(read(f) || ""));
  if (!wfFiles.length) {
    (CI ? bad : soft)("no gate workflow found under .github/workflows (no file declares SEED_REPO): " +
      "this repo has no required status check, so nothing enforces any of the sections above");
  } else {
    // IS THIS REPO THE SEED? The seed legitimately carries SEED_REF: main -- the workflow's
    // own comment says that value is NOT a pin there, because the seed has no external
    // baseline. Resolve it from the git remote so this holds locally as well as in CI,
    // falling back to the env signal [0] already uses.
    let originRepo = null;
    try {
      const u = execSync("git remote get-url origin", { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
      const m = u.match(/[:/]([\w.-]+\/[\w.-]+?)(?:\.git)?$/);
      if (m) originRepo = m[1].toLowerCase();
    } catch { /* no remote: fall through to the env signal */ }
    for (const f of wfFiles) {
      const wf = read(f) || "";
      const rel = relative(ROOT, f);
      const val = (k) => {
        const m = wf.match(new RegExp("^\\s*" + k + "\\s*:\\s*(.+)$", "m"));
        return m ? m[1].replace(/#.*$/, "").trim().replace(/^["']|["']$/g, "").trim() : null;
      };
      const seedRepo = (val("SEED_REPO") || "").toLowerCase();
      // ONE LIST OF SEED NAMES, and it is CANON_SEED_REPOS at the top of this file (row 107). A
      // repo that self-names in its own workflow is NOT thereby the seed: that is the copied env
      // line [0](b) fails on, and granting it the carve-out here would restore the no-op by the
      // other door -- the SEED_REF pin check below is the one this line decides.
      const selfNamed = SEED_SELF_NAMED || (!!originRepo && !!seedRepo && originRepo === seedRepo);
      const isSeed = selfNamed && isCanonSeed(seedRepo || originRepo);
      if (selfNamed && !isSeed) bad(`${rel}: field SEED_REPO names THIS repository (${seedRepo}) and canon ` +
        `does not declare it the seed: a site's SEED_REPO names the canon-declared seed and never itself ` +
        `(as-site-spine-standard.md S8 rule 4). Set it to ${CANON_SEED_REPOS.join(" or ")}`);
      const seedRef = val("SEED_REF");
      const charterField = val("CHARTER");
      // (a) SEED_REF must be the full 40-char sha the charter pins -- except in the seed.
      if (isSeed) {
        note(`${rel}: SEED_REF is not a pin in the seed repo itself (it only has to resolve, per the file's own note); not checked as one`);
      } else if (!seedRef) {
        bad(`${rel}: field SEED_REF is absent -- the baseline the spine is proved against is undeclared`);
      } else if (!/^[0-9a-f]{40}$/i.test(seedRef)) {
        bad(`${rel}: field SEED_REF is ${JSON.stringify(seedRef)}, which is NOT a full 40-character sha. ` +
          (/^(main|master|HEAD)$/i.test(seedRef)
            ? "This is the seed template's own UNREPLACED value: a moving ref silently re-baselines the gate, so the check cannot fail and cannot find (site-contract 1.8.6). Replace it with the sha this site's charter pins."
            : "An abbreviated sha fails actions/checkout with 'git failed with exit code 1'. Use the full 40 characters."));
      } else ok(`${rel}: SEED_REF is a full 40-character sha (${seedRef.slice(0, 12)}...)`);
      // (b) CHARTER must name a file that EXISTS -- the cafe-josee case exactly.
      if (charterField === null) note(`${rel}: field CHARTER is not declared; the charter reconciliation in [5] is deliberately off for this repo`);
      else if (!charterField) note(`${rel}: field CHARTER is declared empty; the charter reconciliation in [5] is deliberately off for this repo`);
      else if (!existsSync(join(ROOT, charterField)))
        bad(`${rel}: field CHARTER names ${JSON.stringify(charterField)} and no such file exists in this repo` +
          (isSeed ? "" : ` -- this is the seed template's value carried over unreplaced; [5] will fail every push until it names THIS site's charter`));
      else ok(`${rel}: field CHARTER names a file that exists (${charterField})`);
      // (c) any other fill-in left as a placeholder.
      const ph = [...wf.matchAll(/^\s*([A-Z_]+)\s*:\s*(<[^>]+>|TODO\b.*|FIXME\b.*|CHANGEME\b.*|["']?xxx+["']?)\s*$/gim)].map((m) => `${m[1]}=${m[2].trim()}`);
      if (ph.length) bad(`${rel}: unreplaced placeholder field(s): ${ph.join(", ")}`);
    }
  }
}

// == 9. S8 PER-LANE RECORD -- present, never proved ==
// as-site-intake-standard.md S8 requires the brief to carry, per intake lane (S3), what that lane
// CONSUMED and what it LOOKED FOR. It is a RECORD and not a verdict, and it is what replaced a
// twice-refuted three-state table. Nothing read it: `lane`, `five lanes`, `enrichment` and `facts
// lane` all returned ZERO across this file against a positive control of eight for `brandMark`, so
// the new wording was exactly as unenforced as the wording it replaced.
//
// THE SHAPE IS DECLARE-THEN-ENFORCE, the same pattern as [5]'s ```routes block and [6]'s
// brandMark: the brief declares the record in ONE fenced block and nothing outside it is read.
// [5]'s own comment records what a scavenging parser cost when it read the whole document. The
// grammar is stated in this repo's README beside this check, so a brief author has a source that
// is not this file (row 098 F9).
//
//     ```lanes
//     content: consumed=<what went in>; looked-for=<what it went looking for>
//     facts: consumed=...; looked-for=...
//     brand: consumed=...; looked-for=...
//     enrichment: consumed=...; looked-for=...
//     intent: consumed=none supplied; looked-for=scope and emphasis
//     ```
//
// WHAT THIS CANNOT PROVE, stated in the check's own output rather than only here, because the
// standard states the same limit rather than engineering around it: NOTHING HERE PROVES AN AGENT
// WENT AND LOOKED. A lane that was never run and whose line was written anyway passes this check.
// It proves the record EXISTS and names every lane, which is the half a document cannot do.
//
// OPT-IN BY --brief, AND THAT IS A BOUND RATHER THAN A PREFERENCE. The stamped workflow template
// passes no --brief and this run may not move a stamped file, so arming the check by discovery
// would red every site in the fleet on a field no template has yet been cut to carry. With no
// --brief this section reports NOT ARMED and fails nothing.
out.push("\n[9] S8 PER-LANE RECORD -- every intake lane has a record; the record is not proof");
{
  const LANES = ["content", "facts", "brand", "enrichment", "intent"];
  if (!BRIEF) {
    note("NOT ARMED: no --brief supplied, so the S8 per-lane record was not read. Arming it is one");
    note("argument in the stamped gate workflow template (a site-contract cut), not a change here.");
  } else if (!existsSync(BRIEF)) {
    bad(`--brief ${BRIEF} was supplied but no such file exists`);
  } else {
    const br = read(BRIEF) || "";
    const block = br.match(/```lanes\s*\n([\s\S]*?)```/);
    if (!block) {
      bad(`brief ${relative(ROOT, BRIEF)} has no \`\`\`lanes block -- add one with a line per intake ` +
          `lane (${LANES.join(", ")}) in the form "<lane>: consumed=<...>; looked-for=<...>". ` +
          `Nothing outside that block is read as a lane record (as-site-intake-standard.md S8)`);
    } else {
      const lines = block[1].split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
      const seenLanes = new Map();
      for (const l of lines) {
        const m = l.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
        if (m) seenLanes.set(m[1].toLowerCase(), m[2].trim());
      }
      const absent = LANES.filter((l) => !seenLanes.has(l));
      if (absent.length) bad(`brief omits the S8 record for lane(s): ${absent.join(", ")} (S3 names five lanes; a lane that came back thin still owes a record saying so)`);
      const thin = [];
      for (const l of LANES) {
        if (!seenLanes.has(l)) continue;
        const v = seenLanes.get(l);
        const halves = [];
        if (!/consumed\s*=\s*\S/i.test(v)) halves.push("consumed");
        if (!/looked-for\s*=\s*\S/i.test(v)) halves.push("looked-for");
        if (halves.length) thin.push(`${l} (no ${halves.join(", no ")})`);
      }
      if (thin.length) bad(`lane record(s) present but incomplete -- S8 requires BOTH halves: ${thin.join(", ")}`);
      const strayLanes = [...seenLanes.keys()].filter((k) => !LANES.includes(k));
      if (strayLanes.length) note(`\`\`\`lanes block declares name(s) S3 does not: ${strayLanes.join(", ")} -- read, not scored`);
      if (!absent.length && !thin.length) ok(`all ${LANES.length} intake lanes carry an S8 record with both halves (${relative(ROOT, BRIEF)})`);
    }
    note("THIS CHECK CANNOT PROVE A LANE WAS RUN. It reads a record the builder wrote and asserts");
    note("only that every lane has one with both halves; a lane never run whose line was written");
    note("anyway passes here. The standard states the same limit rather than engineering around it.");
  }
}

// == 10. PHONE MENU -- a nav item's children are reachable in the open phone menu (R125) ==
// A `.submenu` is a hover/focus-within dropdown whose parent is itself a link. On a touch screen
// the tap that fades the dropdown in is also the click on the parent's link, so the page leaves as
// the children appear, and every site whose nav has `children` carries it (the operator, on a
// phone, 2026-09-29). The fix lives in spine.css's phone block: the media block that hides the
// desktop `.nav` and draws `.nav-open`, found by what it does rather than by its breakpoint. The
// submenu there must be STATIC, SHOWN (visibility and opacity), UNTRANSFORMED (the dropdown's
// translateX(-50%) would push a static list half off the column) and INDENTED under its parent. A
// spine.css without that is the spine at aismith-site-seed b8074088.
//
// AND WHAT IS READ IS THE CASCADE, NOT ONE BLOCK. Every rule in the FILE whose selector ends at a
// `.submenu` under `.nav-open` is read, at the top level or in any @media or @supports block that
// can apply while the phone menu is drawn (one whose min-width is above the phone block's
// max-width cannot), and each property is resolved as the cascade resolves it: !important, then
// specificity, then source order. Reading the phone block alone let a second block, later in the
// file at the same specificity, hide the children again while this line still passed. And the
// box must be DISPLAYED and have HEIGHT: `display: none`, a zero `height` or `max-height`, or a
// clipping `overflow` on a height-bounded list hides the children as surely as `visibility`.
out.push("\n[10] PHONE MENU -- a nav item's children are reachable in the open phone menu");
{
  const css = stripComments(read(P.spineCss) || "");
  const medias = [];
  for (const m of css.matchAll(/@media\s*([^{]+)\{/g)) {
    let depth = 1, i = m.index + m[0].length;
    for (; i < css.length && depth; i++) { if (css[i] === "{") depth++; else if (css[i] === "}") depth--; }
    medias.push({ query: m[1].trim(), body: css.slice(m.index + m[0].length, i - 1), at: m.index });
  }
  const phone = medias.find((b) => /(?:^|[\s}])\.nav\s*\{[^}]*display\s*:\s*none/.test(b.body) && /\.nav-open\b/.test(b.body));
  if (!phone) {
    soft("spine.css has no media block that hides the desktop .nav and draws .nav-open, so the open phone menu " +
         "could not be read and a nav item's children are not shown to be reachable on a touch screen");
  } else {
    // every style rule in source order, with the conditional block it sits in (null = top level)
    // and that block's offset in the file, which is how the phone block is told from a second
    // block carrying the same query
    const all = [];
    (function scan(base, end, media, at) {
      let i = base;
      while (i < end) {
        const open = css.indexOf("{", i);
        if (open < 0 || open >= end) break;
        let depth = 1, j = open + 1;
        for (; j < end && depth; j++) { if (css[j] === "{") depth++; else if (css[j] === "}") depth--; }
        const raw = css.slice(i, open), prelude = raw.trim();
        if (/^@(media|supports)\b/.test(prelude)) scan(open + 1, j - 1, prelude.replace(/^@\w+\s*/, ""), i + raw.length - raw.trimStart().length);
        else if (!prelude.startsWith("@")) all.push({ sels: prelude.split(",").map((x) => x.trim()), body: css.slice(open + 1, j - 1), media, at });
        i = j;
      }
    })(0, css.length, null, null);
    const phoneMax = parseFloat((phone.query.match(/max-width\s*:\s*([\d.]+)px/) || [])[1]);
    const applies = (q) => {
      if (q === null) return true;
      if (/^\s*print\b/.test(q)) return false;
      const min = parseFloat((q.match(/min-width\s*:\s*([\d.]+)px/) || [])[1]);
      return !(min > phoneMax);
    };
    // [ids, classes + attributes + pseudo-classes, elements + pseudo-elements]
    const specificity = (sel) => {
      const s = sel.replace(/::[\w-]+/g, () => " E ");
      return [(s.match(/#[\w-]+/g) || []).length,
              (s.match(/\.[\w-]+|\[[^\]]*\]|:[\w-]+/g) || []).length,
              (s.match(/(?:^|[\s>+~])(?:[a-zA-Z][\w-]*|E)(?![\w-])/g) || []).length];
    };
    const bySpec = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
    const outranks = (a, b) => (a.imp !== b.imp ? a.imp : (bySpec(a.spec, b.spec) || a.order - b.order) > 0);
    const won = {};   // property -> { value, imp, spec, order }
    let read10 = 0, outside = 0;
    all.forEach((r, order) => {
      if (!applies(r.media)) return;
      const hits = r.sels.filter((x) => /\.nav-open\b/.test(x) && /\.submenu$/.test(x));
      if (!hits.length) return;
      read10++;
      if (r.at !== phone.at) outside++;
      const spec = hits.map(specificity).sort((a, b) => bySpec(b, a))[0];
      for (const d of r.body.split(";")) {
        const k = d.indexOf(":");
        if (k <= 0) continue;
        const prop = d.slice(0, k).trim().toLowerCase();
        let value = d.slice(k + 1).trim().toLowerCase();
        const imp = /!\s*important$/.test(value);
        value = value.replace(/\s*!\s*important$/, "");
        const cand = { value, imp, spec, order };
        if (!won[prop] || outranks(cand, won[prop])) won[prop] = cand;
      }
    });
    const decl = Object.fromEntries(Object.entries(won).map(([p, w]) => [p, w.value]));
    const missing = [];
    if (decl.position !== "static") missing.push("position: static (a floating dropdown cannot open on a tap that is also a click)");
    if (decl.visibility !== "visible") missing.push("visibility: visible (shown without hover or focus)");
    if (decl.opacity === undefined || parseFloat(decl.opacity) !== 1) missing.push("opacity: 1");
    if (decl.transform !== "none") missing.push("transform: none (the dropdown's translateX(-50%) pushes a static list half off the column)");
    // the LEFT edge of a padding or margin shorthand, or the longhand, as the cascade reads it
    const leftOf = (prop) => {
      const long = decl[`${prop}-left`];
      if (long !== undefined) return long;
      const v = decl[prop];
      if (v === undefined) return null;
      const p = v.split(/\s+/);
      return p.length === 1 ? p[0] : p.length < 4 ? p[1] : p[3];
    };
    const indented = ["padding", "margin"].some((prop) => parseFloat(leftOf(prop) || "0") > 0);
    if (!indented) missing.push("an indent under its parent (a non-zero padding-left or margin-left)");
    if (decl.display === "none") missing.push("a display other than none (display: none hides every child)");
    const zero = (v) => v !== undefined && parseFloat(v) === 0;
    const bounded = (v) => v !== undefined && !/^(auto|none)$/.test(v);
    if (zero(decl.height) || zero(decl["max-height"])) missing.push("a height (a zero height or max-height collapses the list)");
    else if ((bounded(decl.height) || bounded(decl["max-height"])) && [decl.overflow, decl["overflow-y"]].some((v) => /^(hidden|clip)\b/.test(v || "")))
      missing.push("an overflow that does not clip it (overflow hidden or clip on a height-bounded list cuts children off)");
    const where = `${read10} rule(s) across the file${outside ? `, ${outside} of them outside the phone block` : ""}`;
    if (missing.length) bad(`open phone menu (@media ${phone.query}): .nav-open .submenu ${read10 ? `is read from ${where} and still lacks` : "has no rule, so it lacks"} ` +
      `${missing.join("; ")}. A nav item's children are unreachable on a touch screen (R125)`);
    else ok(`open phone menu (@media ${phone.query}): every .submenu is static, shown, untransformed and indented ` +
      `under its parent, displayed and not collapsed or clipped (read from ${where})`);
  }
}

// == 11. BUILD OUTPUT -- a linked public/ file reaches the published build byte for byte (R109) ==
// The prerender crawl (`crawlLinks`) follows every local <a href> in every page it renders and writes
// the RESPONSE TEXT to that path in the output, so a linked /menu.pdf is fetched, decoded as text and
// written over the copy Vite made of public/menu.pdf: the deployed file is corrupt and the build says
// it succeeded (@tanstack/start-plugin-core dist/esm/prerender.js, `await res.text()` then
// `writeFile`). The seed's vite.config.ts filters such paths out of the crawl, and a site that sets
// crawlLinks owes the same filter. Nothing read the build, so a missing or wrong filter shipped
// silently. This reads the BYTES, not the config.
//
// WHAT IS COMPARED IS WHAT THE CRAWL CAN REACH: every public/ file a built page links with <a href>,
// read with the crawl's own pattern, against its copy in the directory the host publishes
// (netlify.toml's `publish`, `dist/client` where none is set). Not every public/ file: a build
// plugin may rewrite one on purpose (Nitro appends its fallback to `_headers`), and that is not this
// defect. It reads the build the gate workflow makes in the step before this one; with no publish
// directory to read it has verified nothing, so that is soft(): a warning locally, a failure under --ci.
//
// A LINKED FILE WITH NO COPY AT THE SAME PATH IS NAMED, NOT FAILED (the code review of #25, F2). The
// crawl only writes (`mkdir` then `writeFile`, it deletes nothing), so a missing copy cannot be the
// defect this section reads for: it says the publish directory does not mirror public/ at the same
// relative path, which is a build-layout fact, and failing it would redden a site whose host lays the
// build out differently for no R109 reason. So it is compared only where the copy exists, and the
// rest is a note with the files by name. A broken-download check, if one is wanted, is its own
// assertion with its own operand.
out.push("\n[11] BUILD OUTPUT -- a public/ file a built page links reaches the published build byte for byte");
{
  const pub = join(ROOT, "public");
  const toml = read(join(ROOT, "netlify.toml")) || "";
  const publish = ((toml.match(/^\s*publish\s*=\s*["']([^"']+)["']/m) || [])[1] || "dist/client").replace(/^\.?\/+|\/+$/g, "");
  const built = join(ROOT, publish);
  if (!walk(pub, null).length) note("public/ holds no files, so the crawl has nothing to overwrite and nothing is compared");
  else if (!existsSync(built)) {
    soft(`no ${publish} to read (the directory netlify.toml publishes), so no linked public/ file is shown to reach ` +
      `the build intact: build first (the gate workflow builds in the step before this one) (R109)`);
  } else {
    const pages = walk(built, [".html"]);
    const linked = new Set();
    for (const f of pages)
      for (const m of (read(f) || "").matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/g)) {
        if (!/^\.?\//.test(m[1])) continue;
        let rel;
        try { rel = decodeURIComponent(m[1].replace(/^\.?\/+/, "").split(/[?#]/)[0]); } catch { continue; }
        const src = join(pub, rel);
        if (rel && existsSync(src) && statSync(src).isFile()) linked.add(rel);
      }
    const differ = [], absent = [];
    for (const rel of [...linked].sort()) {
      const copy = join(built, rel);
      if (!existsSync(copy)) absent.push(rel);
      else if (!readFileSync(join(pub, rel)).equals(readFileSync(copy))) differ.push(rel);
    }
    if (differ.length) bad(`${publish} copy differs from its public/ source for linked file(s): ${differ.join(", ")}. The ` +
      `prerender crawl fetched each as a page and wrote the response over it as text; filter such paths out of the ` +
      `crawl (vite.config.ts prerender.filter) (R109)`);
    if (absent.length) note(`linked public/ file(s) with no copy at the same path in ${publish}, so not compared: ` +
      `${absent.join(", ")}. The crawl only writes, so this is the build's layout, not the crawl's rewrite (R109)`);
    if (!pages.length) note(`${publish} holds no prerendered page, so no crawl wrote there and no linked public/ file is compared (R109)`);
    else if (!differ.length) ok(`${linked.size - absent.length} public/ file(s) linked from ${pages.length} built page(s) ` +
      `are byte-identical in ${publish} (R109)`);
  }
}

// == REPORT ==
console.log(out.join("\n"));
console.log("\n" + (hardFail ? "VERIFY: FAIL -- build is not done." : "VERIFY: PASS"));
// Set exitCode rather than process.exit() so buffered stdout always flushes (a piped
// stdout can truncate on process.exit()). The event loop is idle, so the process ends
// with this code once the report has drained.
process.exitCode = hardFail ? 1 : 0;

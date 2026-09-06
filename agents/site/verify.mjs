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
// Zero dependencies. Node 18+.  Usage:
//   node verify.mjs [repoRoot] --seed <seedRoot> [--charter <file>] [--base <ref>] [--ci]
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
// --ci       fail-closed mode: a missing seed baseline or unresolvable git base is a
//            HARD FAIL, not a warning. CI must pass --ci.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, basename, dirname } from "node:path";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";

const args = process.argv.slice(2);
// Flags that CONSUME the next argv. Without this set a flag's VALUE looks like a bare
// positional, and the first bare positional is repoRoot -- so
// `node verify.mjs --charter zuidgeluid-site-charter.md` rooted the entire check at the
// CHARTER FILE, every path below it missed, and the run reported NINE confident FAILs on
// a clean tree. CI was never exposed (it passes `.` first); the documented local
// invocation was. Raised by zuidgeluid-site, 2026-08-04.
const VALUE_FLAGS = new Set(["--seed", "--charter", "--base"]);
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
  console.error("Usage: node verify.mjs [repoRoot] --seed <seedRoot> [--charter <file>] [--base <ref>] [--ci]");
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
const SEED_ROLE = !!(process.env.GITHUB_REPOSITORY && process.env.SEED_REPO &&
  process.env.GITHUB_REPOSITORY.trim().toLowerCase() === process.env.SEED_REPO.trim().toLowerCase());
const CHARTER = flag("--charter");
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
out.push("\n[0] BASELINE -- authoritative spine re-derived from the seed at runtime");
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
out.push("\n[2] AA MATRIX -- normal text 4.5; accent-as-text 3.0 (large), 4.5 only if small text");
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
const T = parseTokens(stripComments(tokens || ""));
const TA = parseAlphaTokens(stripComments(tokens || ""));
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
for (const cell of [...composed].sort()) {
  const [tone, n] = cell.split("|");
  const hue = `--hue-${n}`;
  if (!T[hue] && !TA[hue]) continue;        // undeclared slot is inert (S4.6)
  composedHues.add(n);
  const hb = HUE_BLOCKS[n];
  if (!hb) { note(`hue ${n} is composed in the markup but spine.css declares no [data-hue="${n}"] block`); continue; }
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
// S4.6 hue slots + hue-as-text (declared-only; undeclared tokens skip below): the
// standard has ALWAYS said each declared --hue-N/--hue-N-ink pair is AA-gated, but no
// pair was in the list until v1.8.2 -- the gate now matches the standard. --hue-N-text
// (ruled in 2026-07-30) is checked as normal text on the three light grounds.
for (let n = 1; n <= 5; n++) {
  NORMAL_PAIRS.push([`--hue-${n}-ink`, `--hue-${n}`]);
  NORMAL_PAIRS.push([`--hue-${n}-text`, "--bg"], [`--hue-${n}-text`, "--bg-alt"], [`--hue-${n}-text`, "--surface"]);
}
let aaChecked = 0;
let derivedPairs = NORMAL_PAIRS.length;
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
  const ratio = cr(T[fg], T[bg]);
  const threshold = accentSmallText ? 4.5 : 3.0;
  if (ratio < threshold) bad(`${fg} on ${bg} (accent tone) = ${ratio.toFixed(2)} (< ${threshold} ${accentSmallText ? "-- accent section carries small text" : "large"})`);
  else ok(`${fg} on ${bg} (accent tone) = ${ratio.toFixed(2)} (>= ${threshold}${accentSmallText ? "" : " large-only"})`);
}
if (accentSmallText) note("an accent-tone section appears to carry small text -- accent checked at 4.5, not the large-only 3.0");
// THE DENOMINATOR, AND THE CHOICE, STATED IN THE SAME PLACE. A checker that reports a
// verdict without its denominator has been silently narrowed before while it kept printing
// OK, and the rgba class was outside the checked set for weeks with nothing saying so.
note(`AA denominator: ${derivedPairs} pair(s) derived, ${aaChecked} asserted ` +
     `(${flattenedPairs} of them with a translucent ink FLATTENED over its ground per the ` +
     `mapping profile's Rule B), ${skippedTokens.size} token(s) unresolvable`);
if (skippedTokens.size) note(`tokens the AA matrix could NOT resolve, by name: ${[...skippedTokens].join(", ")}`);
if (!aaChecked) bad("no colour token pairs found to check (tokens.css missing or unparseable)");

// == 3. VOICE -- em-dash literal AND entity forms (auditor hardening) ==
out.push("\n[3] VOICE -- zero prose em-dashes (literal + entity); superlatives flagged");
const copyFiles = [...walk(P.content, [".tsx", ".ts"]), ...walk(P.routes, [".tsx", ".ts"]), ...walk(P.spineDir, [".tsx", ".ts"])];
let emDash = 0; const emFiles = [];
const EM = String.fromCharCode(0x2014); // the em-dash, by code point (keep this file ASCII)
for (const f of copyFiles) {
  const body = stripComments(read(f) || "");
  const litRe = new RegExp(EM, "g");
  const n = (body.match(litRe) || []).length + (body.match(/&mdash;|&#8212;|&#x2014;/gi) || []).length;
  if (n) { emDash += n; emFiles.push(relative(ROOT, f)); }
}
if (emDash) bad(`${emDash} em-dash(es) in rendered copy (literal or entity): ${emFiles.join(", ")}`);
else ok("no em-dashes in rendered copy (literal or entity; comments exempt, S9.4)");

// Dutch stems: the list is half Dutch already, but `best` was English-only, so `beste`
// (the ordinary Dutch superlative) passed a gate whose whole job is superlatives.
// Found on zuidgeluid.be 2026-08-02 by a second reader, not by the checker.
// "best" is the noisy one: "as best we reasonably can" is a liability hedge and
// "best practice" is a term of art -- neither is a marketing claim, and both were failing
// this gate. Excluded by context rather than dropped from the list, so promotional uses
// ("the best CRM") still surface.
const SUPER = /(?<!\bas\s)\b(uniek|magisch|naadloos|onvergetelijk|wereldklasse|toonaangevend|onge[eë]venaard|revolutionair|best|beste|finest|leading|premier|world-class|cutting-edge|revolutionary|unique|amazing|incredible|unparalleled|ultimate|seamless|effortless|transformative|unforgettable|magical)\b(?!\s+(?:practices?|effort|of\s+our\s+knowledge))/gi;
const superHits = [];
for (const f of copyFiles) {
  const body = stripComments(read(f) || "");
  const hits = [...body.matchAll(SUPER)].map((m) => m[0]);
  if (hits.length) superHits.push(`${relative(ROOT, f)}: ${[...new Set(hits)].join(", ")}`);
}
if (superHits.length) review(`superlative candidates -- ADVISORY, never blocks ("Beste klant" is fine, so is a liability hedge): ${superHits.join(" | ")}`);
else ok("no superlative candidates");

// == 4. PER-ROUTE META + LANG + NOINDEX + TITLE UNIQUENESS ==
out.push("\n[4] META / LANG / NOINDEX -- per-route head, unique titles, host-agnostic sitemap");
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
const routeToPath = (r) => (r === "index" ? "/" : `/${r}`);
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
    const repoPaths = new Map(
      routeFiles.map((f) => {
        const r = basename(f).replace(/\.tsx$/, "");
        return [routeToPath(r), relative(ROOT, f)];
      })
    );
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
      const isSeed = SEED_ROLE || (!!originRepo && !!seedRepo && originRepo === seedRepo);
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

// == REPORT ==
console.log(out.join("\n"));
console.log("\n" + (hardFail ? "VERIFY: FAIL -- build is not done." : "VERIFY: PASS"));
// Set exitCode rather than process.exit() so buffered stdout always flushes (a piped
// stdout can truncate on process.exit()). The event loop is idle, so the process ends
// with this code once the report has drained.
process.exitCode = hardFail ? 1 : 0;

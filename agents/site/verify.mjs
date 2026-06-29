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
//
// --seed     authoritative spine source (a checked-out site-seed repo, or a dir
//            holding the canonical spine files). REQUIRED to prove spine integrity.
// --charter  the <slug>-site-charter.md to reconcile routes against (bidirectional).
// --ci       fail-closed mode: a missing seed baseline or unresolvable git base is a
//            HARD FAIL, not a warning. CI must pass --ci.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, basename } from "node:path";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";

const args = process.argv.slice(2);
const ROOT = args.find((a) => !a.startsWith("--")) || ".";
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const SEED = flag("--seed");
const CHARTER = flag("--charter");
const BASE = flag("--base");
const CI = args.includes("--ci") || process.env.CI === "true";

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
// In --ci, a soft check is promoted to a hard fail (fail-closed). Outside CI it warns.
const soft = (m) => { out.push(`  ${CI ? "FAIL" : "WARN"}  ${m}`); if (CI) hardFail = true; };
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
    const spineTouched = changed.filter((f) => f.includes("src/components/spine/") || f.endsWith("src/styles/spine.css"));
    if (spineTouched.length) bad(`spine files changed vs ${base}: ${spineTouched.join(", ")}`);
    else ok(`git diff vs ${base}: no spine path changed (${changed.length} files touched)`);
  } catch { (CI ? bad : soft)("git diff failed; relying on static + hash checks"); }
} else {
  (CI ? bad : soft)("no git base resolvable (pass --base <ref>); relying on static + hash checks");
}
// (b) spine byte-for-byte vs the seed baseline (recursive). Auditor hardening.
if (seedSpine) {
  const built = spineFilesUnder(ROOT);
  const mism = [], missing = [], extra = [];
  for (const [rel, h] of Object.entries(seedSpine)) {
    if (!(rel in built)) missing.push(rel);
    else if (built[rel] !== h) mism.push(rel);
  }
  for (const rel of Object.keys(built)) if (!(rel in seedSpine)) extra.push(rel);
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
  for (const m of (css || "").matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) map[m[1]] = m[2];
  return map;
}
const T = parseTokens(stripComments(tokens || ""));
// Normal body-text pairs -- must clear 4.5.
const NORMAL_PAIRS = [
  ["--text", "--bg"], ["--text", "--bg-alt"], ["--text", "--surface"],
  ["--text-soft", "--bg"], ["--text-soft", "--bg-alt"], ["--text-soft", "--surface"],
  ["--on-dark", "--dark"], ["--on-dark", "--slate"], ["--on-dark-soft", "--dark"], ["--on-dark-soft", "--slate"],
  ["--accent-text", "--bg"], ["--accent-text", "--bg-alt"], ["--accent-text", "--surface"],
  ["--accent-on-dark", "--dark"], ["--accent-on-dark", "--slate"],
];
// Accent-as-BACKGROUND text pair (on-dark body colour on the accent tone) --
// large-display-only by S2.3/S4.3, so the threshold is 3.0 (NOT 4.5). On the accent
// tone, accent text falls back to the on-dark BODY colour only (S4.3), so --on-dark is
// the single exercised pair -- --on-dark-soft is "n/a" in the S2.3 matrix and must not
// be force-checked. The canonical AS skin --on-dark on Ember = 3.81 clears 3.0 and
// S2.3 sanctions it as large-only; checking it at 4.5 would false-fail the reference skin.
const ACCENT_LARGE_PAIRS = [
  ["--on-dark", "--accent"],
];
let aaChecked = 0;
for (const [fg, bg] of NORMAL_PAIRS) {
  if (!T[fg] || !T[bg]) continue;
  aaChecked++;
  const ratio = cr(T[fg], T[bg]);
  if (ratio < 4.5) bad(`${fg} on ${bg} = ${ratio.toFixed(2)} (< 4.5 normal)`);
  else ok(`${fg} on ${bg} = ${ratio.toFixed(2)}`);
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
if (!aaChecked) bad("no hex token pairs found to check (tokens.css missing or non-hex)");

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

const SUPER = /\b(uniek|magisch|naadloos|onvergetelijk|wereldklasse|toonaangevend|onge[eë]venaard|revolutionair|best|finest|leading|premier|world-class|cutting-edge|revolutionary|unique|amazing|incredible|unparalleled|ultimate|seamless|effortless|transformative|unforgettable|magical)\b/gi;
const superHits = [];
for (const f of copyFiles) {
  const body = stripComments(read(f) || "");
  const hits = [...body.matchAll(SUPER)].map((m) => m[0]);
  if (hits.length) superHits.push(`${relative(ROOT, f)}: ${[...new Set(hits)].join(", ")}`);
}
if (superHits.length) soft(`superlative candidates (review; "Beste klant" salutation is fine): ${superHits.join(" | ")}`);
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
if (CHARTER && existsSync(CHARTER)) {
  const ch = read(CHARTER) || "";
  const repoRoutes = routeFiles.map((f) => basename(f).replace(/\.tsx$/, ""));
  const repoSet = new Set(repoRoutes);
  const declared = new Set();
  for (const m of ch.matchAll(/`([a-z][a-z0-9-]*)`/g)) declared.add(m[1]);
  const block = ch.match(/routes?[:\-]\s*([^\n]+(?:\n\s+[^\n]+)*)/i);
  if (block) for (const m of block[1].matchAll(/[a-z][a-z0-9-]*/gi)) declared.add(m[0]);
  const orphanInRepo = [...repoSet].filter((r) => !declared.has(r) && r !== "__root");
  if (!declared.size) soft("charter supplied but no route list parsed -- verify charter format");
  else {
    if (orphanInRepo.length) bad(`repo route(s) not declared in charter (orphan): ${orphanInRepo.join(", ")}`);
    if (![...declared].some((r) => repoSet.has(r))) bad("charter declares routes none of which exist in the repo");
    if (!orphanInRepo.length && [...declared].some((r) => repoSet.has(r))) ok("charter <-> repo routes reconcile (no orphans, no undeclared)");
  }
} else {
  (CI ? bad : soft)(`no --charter supplied; charter<->repo reconciliation skipped` + (CI ? " (failing closed in CI)" : ""));
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
  for (const src of [rootSrc, cfg]) {
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
        if (def) return { node: def[1], src: s2, via: inner };
      }
      return { node: inner, src, via: inner, unresolved: true };
    }
    return { node: inner, src, via: "inline" };
  }
  return null;
}
const logoRef = resolveLogoNode();
// (c) classify image vs text-only.
const VECTOR = /<(path|polygon|polyline|circle|ellipse|rect|line|image|use)\b/i;
function isImageNode(node, srcText) {
  if (/<img\b/i.test(node)) return true;
  if (/<svg\b/i.test(node) && VECTOR.test(node)) return true;
  // imported asset referenced by the node (import x from "...png|svg|webp|...")
  const ids = [...node.matchAll(/\b([A-Za-z_$][\w$]*)\b/g)].map((m) => m[1]);
  for (const id of ids) {
    const imp = (srcText || "").match(new RegExp("import\\s+" + id + "\\s+from\\s+[\"'`][^\"'`]+\\.(svg|png|webp|jpe?g|avif|gif)[\"'`]", "i"));
    if (imp) return true;
  }
  return false;
}
// (d) enforce.
if (!logoRef) {
  (CI ? bad : soft)("logo node not found (no logo={...} on SiteHeader/SiteFooter); cannot prove a real image mark");
} else {
  const img = isImageNode(logoRef.node, logoRef.src);
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

// == REPORT ==
console.log(out.join("\n"));
console.log("\n" + (hardFail ? "VERIFY: FAIL -- build is not done." : "VERIFY: PASS"));
// Set exitCode rather than process.exit() so buffered stdout always flushes (a piped
// stdout can truncate on process.exit()). The event loop is idle, so the process ends
// with this code once the report has drained.
process.exitCode = hardFail ? 1 : 0;

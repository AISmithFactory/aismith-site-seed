// spine/modules/tiles.tsx -- OPTIONAL module (S3.3): the tile/chip grammar.
// Folded from the ZG conversion harvest (#122 item 3): the small composed units a
// content-rich site needs between "card" and "plain prose" -- name/role chips, fact
// chips, info cells, bordered detail cards, numbered skill tiles, team members,
// on-dark credit chips, a title-left/action-right section head, and the standalone
// zig-zag divider band. All colour through semantic tokens (S2.2); optional hue
// slots fall back to core tokens. Import directly ("components/spine/modules/tiles");
// not re-exported by the barrel.
import * as React from "react";
import "./tiles.css";

/** Chips -- flex-wrap row for Chip / FactChip / CreditChip. */
export function Chips({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="tl-chips" style={style}>{children}</div>;
}

/** Chip -- name (+ optional role) chip. */
export function Chip({ n, r }: { n: string; r?: React.ReactNode }) {
  return (
    <div className="tl-chip">
      <span className="tl-chip-n">{n}</span>
      {r && <span className="tl-chip-r">{r}</span>}
    </div>
  );
}

/** FactChip -- uppercase label + bold value (hero facts). */
export function FactChip({ k, v }: { k?: string; v: React.ReactNode }) {
  return (
    <div className="tl-chip tl-fact">
      {k && <span className="tl-fact-k">{k}</span>}
      <span className="tl-fact-v">{v}</span>
    </div>
  );
}

/** Cell -- surface info cell (key + soft body). */
export function Cell({ k, children }: { k: string; children?: React.ReactNode }) {
  return (
    <div className="tl-cell">
      <div className="tl-cell-k">{k}</div>
      {children && <div className="tl-cell-b">{children}</div>}
    </div>
  );
}

/** DCard -- bordered detail card: heading + uppercase sub + dotted list / body. */
export function DCard({ t, sub, items, children }:
  { t: string; sub?: string; items?: React.ReactNode[]; children?: React.ReactNode }) {
  return (
    <div className="tl-dcard">
      <h3>{t}</h3>
      {sub && <div className="tl-dcard-sub">{sub}</div>}
      {items && (
        <ul>
          {items.map((it, i) => (
            <li key={i}><span className="tl-dot" aria-hidden="true" /><span>{it}</span></li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}

/** SkillTile -- numbered tile (n, title, body). */
export function SkillTile({ n, t, children }: { n: number; t: string; children: React.ReactNode }) {
  return (
    <div className="tl-skill">
      <div className="tl-skill-n">{n}</div>
      <div className="tl-skill-t">{t}</div>
      <div className="tl-skill-b">{children}</div>
    </div>
  );
}

/** Member -- team member card (photo, name, role, more-link). */
export function Member({ href, img, alt, name, role, more = "Read more" }:
  { href: string; img: string; alt: string; name: string; role: string; more?: string }) {
  return (
    <a href={href} className="tl-member">
      <img src={img} alt={alt} loading="lazy" />
      <div className="tl-member-b">
        <div className="tl-member-n">{name}</div>
        <div className="tl-member-r">{role}</div>
        <span className="tl-member-m">{more} &rarr;</span>
      </div>
    </a>
  );
}

/** CreditChip -- translucent on-dark credit chip (name + highlighted role). */
export function CreditChip({ n, r }: { n: string; r: string }) {
  return (
    <div className="tl-credit">
      <div className="tl-credit-n">{n}</div>
      <div className="tl-credit-r">{r}</div>
    </div>
  );
}

/** SectionHead -- title block left, action right, baseline-aligned. */
export function SectionHead({ children, action }:
  { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="tl-schead">
      <div>{children}</div>
      {action}
    </div>
  );
}

/** ZZDivider -- standalone multi-colour zig-zag band (static, in flow). Strokes walk
    the action/accent/highlight family; the fourth leg uses hue-3 when the skin
    declares it and falls back to the action colour. */
export function ZZDivider() {
  return (
    <svg className="tl-zzdiv" aria-hidden="true" width="100%" height="48" preserveAspectRatio="none">
      <defs>
        <pattern id="tl-zz-div" width="60" height="48" patternUnits="userSpaceOnUse">
          <path d="M4 34 L19 14" stroke="var(--action)" strokeWidth="6.5" strokeLinecap="round" fill="none" />
          <path d="M19 14 L34 34" stroke="var(--accent)" strokeWidth="6.5" strokeLinecap="round" fill="none" />
          <path d="M34 34 L49 14" stroke="var(--highlight)" strokeWidth="6.5" strokeLinecap="round" fill="none" />
          <path d="M49 14 L64 34" stroke="var(--hue-3, var(--action))" strokeWidth="6.5" strokeLinecap="round" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="48" fill="url(#tl-zz-div)" />
    </svg>
  );
}

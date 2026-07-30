// spine/primitives.tsx — layout + type + button atoms.  SPINE: never edited per site.
// Reference tokens only (via spine.css classes); no colour decisions live here.
import * as React from "react";

type Tone = "paper" | "alt" | "surface" | "dark" | "slate" | "accent";

export function Wrap({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className="wrap" style={style}>
      {children}
    </div>
  );
}

/** Section — the alternating-banner unit (S4). `tone` maps to tokens in tokens.css.
    `hue` (S4.6, optional): a bounded secondary-palette slot 1-5. Each slot the SKIN
    declares in tokens.css (--hue-N + --hue-N-ink [+ --hue-N-soft], AA-gated pair)
    re-grounds the section in that hue; an undeclared slot falls back to the tone —
    tone = register, hue = brand family. `fx` layers decorative content (the deco
    module) behind the content; it is aria-hidden and never intercepts input. */
export function Section({
  tone = "paper",
  hue,
  pad,
  id,
  className = "",
  fx,
  children,
}: {
  tone?: Tone;
  hue?: 1 | 2 | 3 | 4 | 5;
  pad?: "sm" | "lg";
  id?: string;
  className?: string;
  fx?: React.ReactNode;
  children: React.ReactNode;
}) {
  const cls = ["section", pad ? `pad-${pad}` : "", fx ? "section--fx" : "", className]
    .filter(Boolean).join(" ");
  return (
    <section id={id} data-tone={tone} data-hue={hue} className={cls}>
      {fx && <div className="sec-fx" aria-hidden="true">{fx}</div>}
      <Wrap>{children}</Wrap>
    </section>
  );
}

/** Band — full-width CTA (replaces ZG .cta/.steun). Defaults to a dark tone.
    `ambient` (additive) layers per-skin quiet motion behind the band: embers for
    forge/original (and the no-skin default), a node network for engine, a dotted grid
    for blueprint. Markup ships all three; spine.css gates visibility by [data-skin]. */
export function Band({
  tone = "dark",
  eyebrow,
  heading,
  sub,
  actions,
  id,
  ambient = false,
  art,
}: {
  tone?: Tone;
  eyebrow?: React.ReactNode;
  heading: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
  id?: string;
  ambient?: boolean;
  /** Brand illustration bleeding in from the right under a tone-ground scrim
      (grammar since v0.13.1, #129 follow-up). Background layer: decorative only. */
  art?: string;
}) {
  const cls = ["band", ambient ? "band--fx" : "", art ? "band--art" : ""].filter(Boolean).join(" ");
  const style = art ? ({ "--band-art": `url("${art}")` } as React.CSSProperties) : undefined;
  return (
    <section id={id} data-tone={tone} className={cls} style={style}>
      {ambient && <BandAmbient />}
      <Wrap>
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{heading}</h2>
          {sub && <p>{sub}</p>}
        </div>
        {actions && <div className="actions">{actions}</div>}
      </Wrap>
    </section>
  );
}

const bandEmbers: [number, number, number, number, number][] = [
  [6, 8, 5, 4.2, 0],
  [14, 0, 3, 5.1, 0.8],
  [22, 12, 6, 4.7, 1.6],
  [31, 2, 4, 5.6, 0.3],
  [39, 16, 3, 4.4, 2.1],
  [47, 4, 5, 5.3, 1.1],
  [55, 10, 4, 4.9, 0.6],
  [63, 1, 6, 5.8, 1.9],
  [71, 14, 3, 4.3, 0.4],
  [79, 5, 5, 5.4, 1.4],
  [87, 11, 4, 4.6, 2.3],
  [93, 3, 3, 5.0, 0.9],
];
const bandNodeLines: [number, number, number, number][] = [
  [70, 60, 230, 130],
  [230, 130, 180, 250],
  [230, 130, 420, 80],
  [420, 80, 560, 180],
  [560, 180, 480, 260],
  [560, 180, 720, 110],
  [720, 110, 880, 190],
  [880, 190, 820, 270],
  [720, 110, 640, 40],
  [420, 80, 330, 30],
];
const bandNodeDots: [number, number, number, number][] = [
  [70, 60, 3.5, 0],
  [230, 130, 4.5, 0.4],
  [420, 80, 4, 0.8],
  [560, 180, 4.5, 1.2],
  [720, 110, 4, 0.6],
  [880, 190, 3.5, 1.6],
  [180, 250, 3, 1.0],
  [480, 260, 3, 1.9],
  [640, 40, 3, 0.2],
  [330, 30, 3, 1.4],
];
function BandAmbient() {
  return (
    <>
      <div
        className="bandfx bandfx--ember"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          opacity: 0.65,
          pointerEvents: "none",
        }}
      >
        {bandEmbers.map(([left, bottom, size, dur, delay], i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${left}%`,
              bottom: `${bottom}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: "var(--accent-on-dark)",
              boxShadow: `0 0 ${size + 3}px var(--accent-on-dark)`,
              animation: `sp-emberRise ${dur}s linear infinite ${delay}s`,
            }}
          />
        ))}
      </div>
      <div
        className="bandfx bandfx--node"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      >
        <svg
          viewBox="0 0 1000 300"
          preserveAspectRatio="xMidYMid slice"
          style={{ width: "100%", height: "100%" }}
        >
          <g
            stroke="var(--accent-on-dark)"
            strokeWidth="1"
            strokeDasharray="4 7"
            fill="none"
            opacity=".7"
            style={{ animation: "sp-dashFlow 1.1s linear infinite" }}
          >
            {bandNodeLines.map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
          </g>
          <g fill="var(--accent-on-dark)">
            {bandNodeDots.map(([cx, cy, r, delay], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  animation: `sp-pulseDot 2.4s ease-in-out infinite ${delay}s`,
                }}
              />
            ))}
          </g>
        </svg>
      </div>
      <div
        className="bandfx bandfx--dots"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.4,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(var(--accent-on-dark) 1px, transparent 1.4px)",
          backgroundSize: "22px 22px",
          backgroundPosition: "center",
        }}
      />
    </>
  );
}

export function Display({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={`display ${className}`} style={style}>
      {children}
    </span>
  );
}
// PageTitle — the hero <h1>. Size comes from a bounded spine scale (hero|xl|lg), not an
// inline font-size, so a composition never hand-rolls type (S3.2). One h1 per page (S7).
export function PageTitle({
  size = "xl",
  children,
}: {
  size?: "hero" | "xl" | "lg";
  children: React.ReactNode;
}) {
  return <h1 className={`display page-title s-${size}`}>{children}</h1>;
}
export function SecTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="sec-title">{children}</h2>;
}
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}
export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="lead">{children}</p>;
}
/** Em -- accent-coloured word. `hue` (1-5) colours the word in a declared
    --hue-N-text instead (AA-gated skin slot; undeclared = inert, the word keeps the
    title colour). Light-ground device; on dark tones plain Em. */
export function Em({ hue, children }: { hue?: 1 | 2 | 3 | 4 | 5; children: React.ReactNode }) {
  return <span className={hue ? `em-hue-${hue}` : "em"}>{children}</span>;
}

type BtnVariant = "action" | "line" | "ghost" | "paper";
export function Btn({
  variant = "action",
  href,
  children,
  onClick,
}: {
  variant?: BtnVariant;
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const cls = variant === "ghost" ? "btn-ghost" : `btn btn-${variant}`;
  if (href)
    return (
      <a className={cls} href={href}>
        {children}
      </a>
    );
  return (
    <button className={cls} onClick={onClick}>
      {children}
    </button>
  );
}

/** Crumb -- the breadcrumb a sub-page opens with, directly above its title (core,
    #141: on some pages it is the only route back up, so it is navigation, not
    decoration). `up` is the parent link; omit it when the crumb is a single
    segment; `children` is the current page. */
export function Crumb({
  up,
  children,
}: {
  up?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <span className="crumb">
      {up ? (
        <>
          <a href={up.href}>{up.label}</a>
          <span aria-hidden="true">&middot;</span>
        </>
      ) : null}
      <span>{children}</span>
    </span>
  );
}

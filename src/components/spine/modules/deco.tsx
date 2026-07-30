// spine/modules/deco.tsx — OPTIONAL module (S3.3): the decorative layer.
// Import directly ("components/spine/modules/deco"); not re-exported by the barrel.
// Precedent: the Band `ambient` prop (per-skin quiet motion). Every piece here is
// aria-hidden (or its motion part is), issues zero at-rest requests (inline SVG only),
// and dies under prefers-reduced-motion. Positioning is the composition's job: DecoStar
// and CutBadge are absolutely positioned via `style`.
import * as React from "react";
import "./deco.css";

/** Floating brand star with the `bob` animation. Position via style ({top,left,...}). */
export function DecoStar(
  { size = 26, style }: { size?: number; style?: React.CSSProperties }
) {
  return (
    <span className="deco-star" style={style} aria-hidden="true">
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path fill="currentColor" d="M12 1.8l2.6 6.9 7.4.4-5.8 4.7 1.9 7.2L12 17l-6.1 4 1.9-7.2L2 9.1l7.4-.4z"/>
      </svg>
    </span>
  );
}

/** Page-wide paper-grain overlay (inline SVG noise; no request, no interaction). */
export function Grain() {
  const noise =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='.55'/></svg>`
    );
  return <div className="deco-grain" style={{ backgroundImage: `url("${noise}")` }} aria-hidden="true" />;
}

/** Zig-zag section divider; colour = currentColor (inherits the tone ink). */
export function ZigZag({ height = 12 }: { height?: number }) {
  return (
    <div className="deco-zz" style={{ height }} aria-hidden="true">
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 120 12">
        <path d="M0 12 6 0l6 12L18 0l6 12L30 0l6 12L42 0l6 12L54 0l6 12L66 0l6 12L78 0l6 12L90 0l6 12L102 0l6 12L114 0l6 12"
          fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
      </svg>
    </div>
  );
}

/** Tilted photo/illustration frame (rotation from --tilt; 0deg disables site-wide). */
export function TiltFrame(
  { children, flip = false }: { children: React.ReactNode; flip?: boolean }
) {
  return <div className={flip ? "deco-tilt deco-tilt--flip" : "deco-tilt"}>{children}</div>;
}

/** Cut-paper circular badge (illustration stamp). Decorative by default; pass `label`
    if the badge carries meaning. Position via style; size sm | lg | xl. */
export function CutBadge(
  { children, size = "sm", shape = "cut", label, style }:
  { children: React.ReactNode; size?: "sm" | "lg" | "xl"; shape?: "cut" | "ring";
    label?: string; style?: React.CSSProperties }
) {
  return (
    <span className={`deco-badge deco-badge--${size}${shape === "ring" ? " deco-badge--ring" : ""}`} style={style}
      aria-hidden={label ? undefined : "true"} aria-label={label} role={label ? "img" : undefined}>
      {children}
    </span>
  );
}

/** Status pill with a pulsing dot (the hero "live" pill). Text is real content. */
export function PulsePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="deco-pill">
      <span className="deco-dot" aria-hidden="true" />
      {children}
    </span>
  );
}

// spine/modules/marquee.tsx — OPTIONAL module (S3.3): Marquee ticker band.
// Import directly ("components/spine/modules/marquee"); not re-exported by the barrel.
// The track renders TWICE in JSX (never innerHTML +=) for the seamless -50% loop; the
// duplicate is aria-hidden. Under prefers-reduced-motion the animation stops and the
// band falls back to a static row (the same fallback a non-module site composes).
import * as React from "react";
import "./marquee.css";

export function Marquee(
  { items, speed = 34, separator }:
  { items: React.ReactNode[]; speed?: number; separator?: React.ReactNode }
) {
  const run = (hidden: boolean) => (
    <div className="mq-run" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <span className="mq-item" key={i}>
          {separator ?? <span className="mq-star" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 1.8l2.6 6.9 7.4.4-5.8 4.7 1.9 7.2L12 17l-6.1 4 1.9-7.2L2 9.1l7.4-.4z"/>
            </svg>
          </span>}
          {it}
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee" style={{ ["--mq-dur" as any]: `${speed}s` }}>
      <div className="mq-track">
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}

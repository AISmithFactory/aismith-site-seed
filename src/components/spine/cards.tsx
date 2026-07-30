// spine/cards.tsx — the five card primitives (Appendix B).  SPINE: never edited per site.
import * as React from "react";

export function MediaCard(
  { image, alt, category, title, loc, body, href, more = "Learn more", pill, stamp,
    stampPlacement = "art", pillPlacement = "art", ground }:
  { image?: string; alt?: string; category?: string; title: string; loc?: string;
    body?: string; href?: string; more?: string; pill?: string; stamp?: React.ReactNode;
    stampPlacement?: "art" | "seam"; pillPlacement?: "art" | "meta";
    ground?: "surface" | "alt" }
) {
  const Tag: any = href ? "a" : "div";
  return (
    <Tag className="media-card" href={href} data-card-ground={ground === "alt" ? "alt" : undefined}>
      <div className="art">
        {image && <img src={image} alt={alt || ""} />}
        {pill && pillPlacement === "art" && <span className="pill">{pill}</span>}
        {stamp && stampPlacement === "art" && <span className="stamp" aria-hidden="true">{stamp}</span>}
      </div>
      <div className="body">
        {stamp && stampPlacement === "seam" && <span className="stamp stamp--seam" aria-hidden="true">{stamp}</span>}
        {pill && pillPlacement === "meta" && <div className="meta"><span className="pill pill--meta">{pill}</span></div>}
        {category && <span className="cat">{category}</span>}
        <h3>{title}</h3>
        {loc && <p className="loc">{loc}</p>}
        {body && <p>{body}</p>}
        {href && <span className="btn-ghost">{more} &rarr;</span>}
      </div>
    </Tag>
  );
}

export function TierCard(
  { label, price, per, items, cta, hue, icon }:
  { label: string; price: string; per?: string; items: string[]; cta?: React.ReactNode;
    hue?: 1 | 2 | 3 | 4 | 5; icon?: React.ReactNode }
) {
  return (
    <div className="tier-card" data-hue-bar={hue}>
      {icon && <span className="tier-ico" aria-hidden="true">{icon}</span>}
      <span className="label">{label}</span>
      <div className="price">{price}{per && <small>{per}</small>}</div>
      <ul>{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
      {cta}
    </div>
  );
}

export function EventCard(
  { poster, posterAlt, posterHref, posterLead = false, when, title, details, href }:
  { poster?: string; posterAlt?: string; posterHref?: string; posterLead?: boolean;
    when: string; title: string; details?: string; href?: string }
) {
  const img = poster && <img src={poster} alt={posterAlt || ""} loading="lazy" />;
  return (
    <div className={[poster ? "event-card" : "event-card noposter", posterLead ? "event-card--lead" : ""].filter(Boolean).join(" ")}>
      {poster && (
        <div className="poster">
          {posterHref
            ? <a href={posterHref} target="_blank" rel="noopener noreferrer">{img}</a>
            : img}
        </div>
      )}
      <div>
        <span className="when">{when}</span>
        <h3>{title}</h3>
        {details && <p className="det">{details}</p>}
        {href && <a className="btn-ghost" href={href}>Details &rarr;</a>}
      </div>
    </div>
  );
}

export function StatCard({ num, plus, label }: { num: string; plus?: boolean; label: string }) {
  return (
    <div className="stat">
      <div className="num">{num}{plus && <span className="plus">+</span>}</div>
      <div className="lbl">{label}</div>
    </div>
  );
}

export function InfoCard({ k, v }: { k: string; v: string }) {
  return <div className="info-card"><div className="k">{k}</div><div className="v">{v}</div></div>;
}

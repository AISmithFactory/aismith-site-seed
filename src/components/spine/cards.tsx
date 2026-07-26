// spine/cards.tsx — the five card primitives (Appendix B).  SPINE: never edited per site.
import * as React from "react";

export function MediaCard(
  { image, alt, category, title, body, href, more = "Learn more", pill, stamp }:
  { image?: string; alt?: string; category?: string; title: string; body?: string;
    href?: string; more?: string; pill?: string; stamp?: React.ReactNode }
) {
  const Tag: any = href ? "a" : "div";
  return (
    <Tag className="media-card" href={href}>
      <div className="art">
        {image && <img src={image} alt={alt || ""} />}
        {pill && <span className="pill">{pill}</span>}
        {stamp && <span className="stamp" aria-hidden="true">{stamp}</span>}
      </div>
      <div className="body">
        {category && <span className="cat">{category}</span>}
        <h3>{title}</h3>
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
  { poster, posterAlt, when, title, details, href }:
  { poster?: string; posterAlt?: string; when: string; title: string; details?: string; href?: string }
) {
  return (
    <div className={poster ? "event-card" : "event-card noposter"}>
      {poster && <div className="poster"><img src={poster} alt={posterAlt || ""} /></div>}
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

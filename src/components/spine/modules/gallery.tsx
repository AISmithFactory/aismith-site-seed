// spine/modules/gallery.tsx — OPTIONAL module (S3.3): GalleryGrid + built-in Lightbox
// + optional category filter. Import directly ("components/spine/modules/gallery");
// not re-exported by the barrel.
// - Filtering hides tiles with the `hidden` attribute; tile images are loading="lazy",
//   so photos in a never-shown category are never fetched (the ZG 219-photo lesson).
// - With `headings`, the all-view renders a heading row per category (grid-column 1/-1).
// - Lightbox: role="dialog" overlay; Escape + backdrop + button close; focus moves to
//   the close button on open and returns to the opening tile on close (AA).
import * as React from "react";
import "./gallery.css";

export type GalleryPhoto = { src: string; full?: string; alt: string; cat?: string };
export type GalleryCategory = { id: string; label: string };

export function GalleryGrid(
  { categories, photos, headings = false, allLabel = "All" }:
  { categories?: GalleryCategory[]; photos: GalleryPhoto[];
    headings?: boolean; allLabel?: string }
) {
  const [filter, setFilter] = React.useState<string>("all");
  const [lightbox, setLightbox] = React.useState<{ src: string; alt: string; tile: HTMLElement } | null>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!lightbox) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [lightbox]);

  function close() {
    const t = lightbox?.tile;
    setLightbox(null);
    t?.focus();
  }

  const counts = new Map<string, number>();
  for (const p of photos) counts.set(p.cat ?? "", (counts.get(p.cat ?? "") ?? 0) + 1);
  const groups: { cat?: GalleryCategory; items: GalleryPhoto[] }[] =
    categories && headings
      ? categories.map((c) => ({ cat: c, items: photos.filter((p) => p.cat === c.id) }))
      : [{ items: photos }];

  const tile = (p: GalleryPhoto, i: number) => (
    <button
      type="button"
      key={`${p.src}-${i}`}
      className="gal-photo"
      hidden={filter !== "all" && p.cat !== filter}
      onClick={(e) =>
        setLightbox({ src: p.full ?? p.src, alt: p.alt, tile: e.currentTarget })}
      aria-label={p.alt}
    >
      <img src={p.src} alt={p.alt} loading="lazy" />
    </button>
  );

  return (
    <div className="gallery">
      {categories && categories.length > 1 && (
        <div className="gal-chips" role="group">
          <button type="button" className="gal-chip" aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}>
            {allLabel} <span className="gal-count">{photos.length}</span>
          </button>
          {categories.map((c) => (
            <button type="button" key={c.id} className="gal-chip"
              aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.label} <span className="gal-count">{counts.get(c.id) ?? 0}</span>
            </button>
          ))}
        </div>
      )}
      <div className="gal-grid">
        {groups.map((g, gi) => (
          <React.Fragment key={g.cat?.id ?? gi}>
            {g.cat && (
              <h3 className="gal-head" hidden={filter !== "all" && filter !== g.cat.id}>
                {g.cat.label}
              </h3>
            )}
            {g.items.map(tile)}
          </React.Fragment>
        ))}
      </div>
      {lightbox && (
        <div className="gal-lightbox" role="dialog" aria-modal="true" aria-label={lightbox.alt}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <img src={lightbox.src} alt={lightbox.alt} />
          <button ref={closeRef} type="button" className="gal-close" onClick={close}
            aria-label="Close">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path fill="currentColor"
                d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

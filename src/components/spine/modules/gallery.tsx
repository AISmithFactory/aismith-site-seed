// spine/modules/gallery.tsx — OPTIONAL module (S3.3): GalleryGrid + built-in Lightbox
// + optional category filter. Import directly ("components/spine/modules/gallery");
// not re-exported by the barrel.
// - Filtering hides tiles with the `hidden` attribute; tile images are loading="lazy",
//   so photos in a never-shown category are never fetched (the ZG 219-photo lesson).
// - With `headings`, the all-view renders a heading row per category (grid-column 1/-1).
// - Lightbox: role="dialog" overlay; Escape + backdrop + button close; focus moves to
//   the close button on open and returns to the tile of the photo last shown on close (AA).
// - Lightbox MOVES between the photos of the OPEN category (R123): previous and next
//   buttons, and the left and right arrow keys, step through the photos the current filter
//   shows, in grid order, wrapping at either end. Tab and Shift+Tab stay inside the dialog.
//   One photo in view means no previous or next control at all.
// - Every label is a PROP (R123), as `allLabel` already was: `closeLabel`, `prevLabel` and
//   `nextLabel` default to English, and a Dutch site passes its own. The spine takes no
//   locale import here; chrome.tsx's one import from src/content/ is deliberate and alone.
import * as React from "react";
import "./gallery.css";

export type GalleryPhoto = { src: string; full?: string; alt: string; cat?: string };
export type GalleryCategory = { id: string; label: string };

export function GalleryGrid(
  { categories, photos, headings = false, allLabel = "All",
    closeLabel = "Close", prevLabel = "Previous photo", nextLabel = "Next photo" }:
  { categories?: GalleryCategory[]; photos: GalleryPhoto[];
    headings?: boolean; allLabel?: string;
    closeLabel?: string; prevLabel?: string; nextLabel?: string }
) {
  const [filter, setFilter] = React.useState<string>("all");
  // The open photo is an INDEX into `shown`, the photos the current filter shows in grid
  // order, so previous and next never leave the open category.
  const [lightbox, setLightbox] = React.useState<{ index: number; tile: HTMLElement } | null>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const counts = new Map<string, number>();
  for (const p of photos) counts.set(p.cat ?? "", (counts.get(p.cat ?? "") ?? 0) + 1);
  const groups: { cat?: GalleryCategory; items: GalleryPhoto[] }[] =
    categories && headings
      ? categories.map((c) => ({ cat: c, items: photos.filter((p) => p.cat === c.id) }))
      : [{ items: photos }];
  const inView = (p: GalleryPhoto) => filter === "all" || p.cat === filter;
  const shown = groups.flatMap((g) => g.items).filter(inView);
  const total = shown.length;
  const open = lightbox && lightbox.index < total ? shown[lightbox.index] : null;

  const step = (by: number) =>
    setLightbox((lb) => (lb && total > 1 ? { ...lb, index: (lb.index + by + total) % total } : lb));

  function close() {
    // Focus returns to the tile of the photo now shown, so the visitor's place in the grid
    // follows the lightbox; the opening tile is the fallback.
    const tiles = gridRef.current?.querySelectorAll<HTMLElement>(".gal-photo:not([hidden])");
    const t = (lightbox && tiles?.[lightbox.index]) || lightbox?.tile;
    setLightbox(null);
    t?.focus();
  }

  const isOpen = lightbox !== null;
  React.useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
  }, [isOpen]);

  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "Tab") {
        // Focus kept in the dialog: wrap at either end, and pull a stray focus back in.
        const f = dialogRef.current
          ? Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button"))
          : [];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        const active = document.activeElement;
        const inside = !!active && !!dialogRef.current?.contains(active);
        if (e.shiftKey && (active === first || !inside)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (active === last || !inside)) { e.preventDefault(); first.focus(); }
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [lightbox, total]);

  const tile = (p: GalleryPhoto, i: number) => (
    <button
      type="button"
      key={`${p.src}-${i}`}
      className="gal-photo"
      hidden={!inView(p)}
      onClick={(e) => setLightbox({ index: shown.indexOf(p), tile: e.currentTarget })}
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
      <div className="gal-grid" ref={gridRef}>
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
      {open && (
        <div ref={dialogRef} className="gal-lightbox" role="dialog" aria-modal="true" aria-label={open.alt}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <img src={open.full ?? open.src} alt={open.alt} />
          {total > 1 && (
            <>
              <button type="button" className="gal-prev" onClick={() => step(-1)} aria-label={prevLabel}>
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <path fill="currentColor" d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4-4.6-4.6z" />
                </svg>
              </button>
              <button type="button" className="gal-next" onClick={() => step(1)} aria-label={nextLabel}>
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <path fill="currentColor" d="M8.6 16.6 10 18l6-6-6-6-1.4 1.4 4.6 4.6z" />
                </svg>
              </button>
            </>
          )}
          <button ref={closeRef} type="button" className="gal-close" onClick={close}
            aria-label={closeLabel}>
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

// spine/modules/video.tsx — OPTIONAL module (S3.3): VideoFacade (facade, S3.5).
// Generalises the S3.5 facade rule beyond Map: nothing third-party loads until the
// visitor clicks, so the resting page issues no YouTube request and sets no cookie
// (youtube-nocookie even after activation). The MP4 path builds a native <video>
// exactly once (one-shot guard — later clicks fall through to the native controls;
// the ZG v3 rebuild-loop lesson). playsinline is set so iOS plays on the first tap.
// Import directly ("components/spine/modules/video"); not re-exported by the barrel.
import * as React from "react";
import "./video.css";

type Ratio = "16/9" | "2.35/1";

/**
 * VideoFacade — click-to-play poster for a YouTube id (`yt`) or a self-hosted MP4
 * (`mp4`). Exactly one of the two. `ratio` defaults to 16/9; "2.35/1" is the wide
 * band variant (aftermovies with burned-in subtitles crop in 16/9 — keep the
 * source ratio). The poster is self-hosted (S3.5: tokenised resting state).
 */
export function VideoFacade(
  { poster, posterAlt = "", yt, mp4, ratio = "16/9", label, labelVisible = true, cta = "Play video" }:
  { poster: string; posterAlt?: string; yt?: string; mp4?: string;
    ratio?: Ratio; label: string; labelVisible?: boolean; cta?: string }
) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="vfacade" data-ratio={ratio} data-open={open ? "true" : "false"}>
      {open ? (
        yt ? (
          <iframe
            className="vf-frame"
            src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&playsinline=1&rel=0`}
            title={label}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        ) : (
          <video
            className="vf-frame"
            src={mp4}
            controls
            autoPlay
            playsInline
            preload="metadata"
          />
        )
      ) : (
        <button
          type="button"
          className="vf-poster"
          onClick={() => setOpen(true)}
          aria-label={`${cta}: ${label}`}
        >
          <img src={poster} alt={posterAlt} loading="lazy" />
          <span className="vf-scrim" aria-hidden="true" />
          <span className="vf-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26">
              <path fill="currentColor" d="M8 5v14l11-7z" />
            </svg>
          </span>
          {/* #129: a facade is not always captioned; `label` stays the accessible
              name (the button aria-label above) when the visible caption is off. */}
          {labelVisible && <span className="vf-label">{label}</span>}
        </button>
      )}
    </div>
  );
}

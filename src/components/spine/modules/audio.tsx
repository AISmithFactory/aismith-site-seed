// spine/modules/audio.tsx — OPTIONAL module (S3.3): AudioPlayer card.
// Import directly ("components/spine/modules/audio"); not re-exported by the barrel.
// Native <audio controls> does the work; the icon button mirrors play/pause state and
// starting one card pauses the others (the ZG song-page behaviour). No third-party.
import * as React from "react";
import "./audio.css";

export function AudioPlayer(
  { title, sub, src, playLabel = "Play", pauseLabel = "Pause" }:
  { title: string; sub?: string; src: string; playLabel?: string; pauseLabel?: string }
) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState(false);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      document.querySelectorAll<HTMLAudioElement>(".audio-card audio").forEach((o) => {
        if (o !== a) o.pause();
      });
      void a.play().catch(() => {});
    } else a.pause();
  }

  return (
    <div className="audio-card">
      <button type="button" className="ac-ico" onClick={toggle}
        aria-label={playing ? pauseLabel : playLabel}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          {playing
            ? <path fill="currentColor" d="M7 5h4v14H7zM13 5h4v14h-4z" />
            : <path fill="currentColor" d="M8 5v14l11-7z" />}
        </svg>
      </button>
      <div className="ac-meta">
        <span className="ac-title">{title}</span>
        {sub && <span className="ac-sub">{sub}</span>}
        <audio ref={audioRef} src={src} controls preload="metadata"
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)} />
      </div>
    </div>
  );
}

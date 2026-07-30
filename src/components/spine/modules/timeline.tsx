// spine/modules/timeline.tsx -- OPTIONAL module (S3.3): Timeline (#141 item 2).
// A rail, a dot per row, a display-face date, a sentence. The list grammar for
// past-and-planned items; a row whose emphasis is inline takes CHILDREN, never a
// title/details pair (mapping such a row onto a card duplicates the lead-in and
// turns a quiet list into a column of tiles -- the 27-pink-tiles lesson).
// Import directly ("components/spine/modules/timeline"); not re-exported by the barrel.
import * as React from "react";
import "./timeline.css";

export function Timeline({ children }: { children: React.ReactNode }) {
  return <div className="tl">{children}</div>;
}

/** One row. `when` is the display-face date; `children` is the sentence, with any
    emphasis inline (<strong> stays where the copy put it). */
export function TimelineRow({ when, children }:
  { when: string; children?: React.ReactNode }) {
  return (
    <div className="tl-row">
      <div className="tl-when">{when}</div>
      {children && <div className="tl-tx">{children}</div>}
    </div>
  );
}

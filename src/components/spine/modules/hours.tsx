// spine/modules/hours.tsx — OPTIONAL module (S3.3): Hours. Import directly
// ("components/spine/modules/hours"); not re-exported by the spine barrel.
import * as React from "react";
import "./hours.css";

type HoursRow = { label: string; value: string };

/**
 * Hours — structured opening hours. Static by design: no "open now" computation
 * (timezone/locale correctness is a separate, opt-in enhancement). Each row is a
 * day-or-range label and its time value, e.g. { label: "Ma–Vr", value: "12:00–23:00" }.
 */
export function Hours(
  { heading = "Openingsuren", rows, note }:
  { heading?: string; rows: HoursRow[]; note?: React.ReactNode }
) {
  return (
    <div className="hours">
      {heading ? <h3 className="hours-title">{heading}</h3> : null}
      <dl className="hours-list">
        {rows.map((r, i) => (
          <div className="hours-row" key={i}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
      {note ? <p className="hours-note">{note}</p> : null}
    </div>
  );
}

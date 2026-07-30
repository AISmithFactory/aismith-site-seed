// spine/forms.tsx — ContactForm + NewsletterForm.  SPINE: never edited per site.
// S6: these POST to an edge function that only sends mail / hits a newsletter API.
// No secret, no service-role, no hub-DB write ever lives client-side.
import * as React from "react";

type Opt = string | { label: string; value: string };
type Field = { name: string; label: string; type?: "text" | "email" | "textarea" | "select";
  options?: Opt[]; placeholder?: string; required?: boolean };

async function postJson(action: string, data: Record<string, string>) {
  const res = await fetch(action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(String(res.status));
}

export function ContactForm({ action, fields, submitLabel = "Send", done = "Thanks, we'll be in touch.", honeypot = "company" }:
  { action: string; fields: Field[]; submitLabel?: string; done?: string; honeypot?: string | false }) {
  const [sent, setSent] = React.useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(Array.from(fd.entries()).map(([k, v]) => [k, String(v)]));
    try { await postJson(action, data); } finally { setSent(true); }
  };
  if (sent) return <div className="form-card"><div className="form-done">{done}</div></div>;
  return (
    <form className="form-card" onSubmit={onSubmit}>
      {/* S6: optional hidden honeypot — a real human never fills it; the `contact` edge
          function drops any POST where it is non-empty. Defence-in-depth on top of the
          origin allowlist (no wildcard) + server-side fixed destination + per-origin rate
          limit. Off-screen, aria-hidden, not tab-reachable, autocomplete off. Pass
          honeypot={false} only if a site deliberately omits it. */}
      {honeypot ? (
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
          <label htmlFor={honeypot}>Do not fill this in</label>
          <input id={honeypot} name={honeypot} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
      ) : null}
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name}>{f.label}</label>
          {f.type === "textarea"
            ? <textarea id={f.name} name={f.name} required={f.required} />
            : f.type === "select"
              /* #141 item 5: {label,value} options + a real placeholder -- value="" +
                 required means the placeholder can never submit itself as the answer. */
              ? <select id={f.name} name={f.name} required={f.required} defaultValue={f.placeholder ? "" : undefined}>
                  {f.placeholder && <option value="" disabled>{f.placeholder}</option>}
                  {(f.options || []).map((o) => {
                    const label = typeof o === "string" ? o : o.label;
                    const value = typeof o === "string" ? o : o.value;
                    return <option key={value} value={value}>{label}</option>;
                  })}
                </select>
              : <input id={f.name} name={f.name} type={f.type || "text"} required={f.required} />}
        </div>
      ))}
      <button className="btn btn-action" type="submit">{submitLabel} &rarr;</button>
    </form>
  );
}

/** NewsletterForm v2 -- stacked NAME + EMAIL is the fleet default (operator decision
    2026-07-27, #122 item 5). Posts {name, email}; the shared `contact` fn's signup
    mode folds `name` into the mail. Pass withName={false} for the email-only shape. */
export function NewsletterForm({ action, withName = true, namePlaceholder = "Your name",
  placeholder = "Your email", submitLabel = "Subscribe", done = "You're on the list." }:
  { action: string; withName?: boolean; namePlaceholder?: string; placeholder?: string;
    submitLabel?: string; done?: string }) {
  const [sent, setSent] = React.useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = { email: String(fd.get("email") || "") };
    if (withName) data.name = String(fd.get("name") || "");
    try { await postJson(action, data); } finally { setSent(true); }
  };
  if (sent) return <p className="nl-done">{done}</p>;
  return (
    <form className="nl-form" onSubmit={onSubmit}>
      {withName && <input name="name" type="text" required placeholder={namePlaceholder} aria-label={namePlaceholder} />}
      <input name="email" type="email" required placeholder={placeholder} aria-label={placeholder} />
      <button className="btn btn-action" type="submit">{submitLabel} &rarr;</button>
    </form>
  );
}

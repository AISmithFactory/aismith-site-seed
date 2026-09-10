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

// A FAILED POST IS REPORTED, NEVER CONFIRMED (aismith-site #47 drift item 2, raised
// 2026-08-30). This component did `try { await postJson(...) } finally { setSent(true) }`,
// so a rejected or unreachable POST still rendered `done` and the visitor believed a lost
// lead had been delivered. `sent` is now reached only when the post RESOLVES; a failure
// names itself and offers the mail path, which is the behaviour aismith-site shipped
// locally in `src/components/IntakeForm.tsx` because the spine is byte-locked to the
// pinned seed and it could not fix this file.
//
// `failed` mirrors `done`: both mounting sites are Dutch-language and already override
// `done`, so a hardcoded English failure sentence would ship English into a Dutch page.
// `contactEmail` is OPTIONAL because a required prop would break every mounting site's
// build on the pin bump; without it the default failure copy states the failure and asks
// for a retry rather than naming a mail path the component was not given.
export function ContactForm({ action, fields, submitLabel = "Send", done = "Thanks, we'll be in touch.", honeypot = "company",
  contactEmail, failed }:
  { action: string; fields: Field[]; submitLabel?: string; done?: string; honeypot?: string | false;
    contactEmail?: string; failed?: React.ReactNode }) {
  const [state, setState] = React.useState<"idle" | "sending" | "sent" | "failed">("idle");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(Array.from(fd.entries()).map(([k, v]) => [k, String(v)]));
    setState("sending");
    try { await postJson(action, data); setState("sent"); } catch { setState("failed"); }
  };
  const failureNode = failed ?? (contactEmail
    ? <>That did not go through. Nothing was lost on your side: send the same thing to{" "}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a> and we will pick it up.</>
    : <>That did not go through, so nothing reached us. Please try again in a moment.</>);
  if (state === "sent") return <div className="form-card"><div className="form-done">{done}</div></div>;
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
      {state === "failed" ? (
        <p role="alert" style={{ color: "var(--accent-text)", marginTop: 4 }}>{failureNode}</p>
      ) : null}
      {/* disabled while the post is in flight, so a slow endpoint cannot be double-posted.
          The LABEL is not swapped for a "Sending" string: `submitLabel` is per-site copy and
          a hardcoded English transient would read as English on the two Dutch sites that
          mount this. aismith-site's IntakeForm does swap it; that is the one deliberate
          difference between the two and it is stated here rather than left to be found. */}
      <button className="btn btn-action" type="submit" disabled={state === "sending"}>{submitLabel} &rarr;</button>
    </form>
  );
}

/** NewsletterForm v2 -- stacked NAME + EMAIL is the fleet default (operator decision
    2026-07-27, #122 item 5). Posts {name, email}; the shared `contact` fn's signup
    mode folds `name` into the mail. Pass withName={false} for the email-only shape. */
// A FAILED POST IS REPORTED, NEVER CONFIRMED. #18 (`5e77d77`) is the PRECEDENT: it fixed
// the identical shape in ContactForm above, and this component was left still
// holding it. It did `try { await postJson(...) } finally { setSent(true) }`, so a
// rejected or unreachable POST still rendered `done` and the visitor believed they were
// subscribed when nothing had reached us. `sent` is now reached only when the post
// RESOLVES; a failure names itself, and the button is disabled while the post is in
// flight so a slow endpoint cannot be double-posted. The LABEL is not swapped for a
// "Sending" string, for the same per-site-copy reason ContactForm states.
//
// `failed` mirrors `done`: both mounting sites are Dutch-language and already override
// `done`, so a hardcoded English failure sentence would ship English into a Dutch page.
// The default sentence is ContactForm's contactEmail-less one VERBATIM, because this form
// takes no `contactEmail`: a newsletter signup has no mail path to offer, so the copy
// states the failure and asks for a retry rather than naming one it was not given.
//
// The failure ink is `--accent-on-dark`, NOT ContactForm's `--accent-text`. This form
// mounts on a DARK ground and the spine says so itself in `spine.css`, at the rule
// `.nl-done { color: var(--on-dark) }`; `--accent-text` is tuned for the light grounds
// ContactForm sits on and would ship a sub-AA ink into the footer.
export function NewsletterForm({ action, withName = true, namePlaceholder = "Your name",
  placeholder = "Your email", submitLabel = "Subscribe", done = "You're on the list.", failed }:
  { action: string; withName?: boolean; namePlaceholder?: string; placeholder?: string;
    submitLabel?: string; done?: string; failed?: React.ReactNode }) {
  const [state, setState] = React.useState<"idle" | "sending" | "sent" | "failed">("idle");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = { email: String(fd.get("email") || "") };
    if (withName) data.name = String(fd.get("name") || "");
    setState("sending");
    try { await postJson(action, data); setState("sent"); } catch { setState("failed"); }
  };
  const failureNode = failed ?? <>That did not go through, so nothing reached us. Please try again in a moment.</>;
  if (state === "sent") return <p className="nl-done">{done}</p>;
  return (
    <form className="nl-form" onSubmit={onSubmit}>
      {withName && <input name="name" type="text" required placeholder={namePlaceholder} aria-label={namePlaceholder} />}
      <input name="email" type="email" required placeholder={placeholder} aria-label={placeholder} />
      {state === "failed" ? (
        <p role="alert" style={{ color: "var(--accent-on-dark)", marginTop: 4 }}>{failureNode}</p>
      ) : null}
      <button className="btn btn-action" type="submit" disabled={state === "sending"}>{submitLabel} &rarr;</button>
    </form>
  );
}

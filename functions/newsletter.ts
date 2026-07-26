// functions/newsletter.ts — Supabase Edge Function (Deno) behind /functions/v1/newsletter.
// S6: adds a contact to a Brevo list. Keys in env (BREVO_API_KEY, BREVO_LIST_ID), never
// client-side. No DB access, no service-role, no stored data. UNLIKE contact (the shared
// AISmith-functions backbone), newsletter has no shared backbone yet, so it stays a PER-SITE
// function deployed into the site's own functions-only Supabase project. Deploy + secrets:
// see functions/DEPLOY.md. Unmounted in the concept build (footer omits the newsletter).
const ALLOWED_ORIGIN = "https://aismith.io"; // the site's domain, exact

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST")
    return new Response("Method Not Allowed", { status: 405, headers: cors });

  try {
    const body = await req.json();
    const email = String(body.email ?? "").slice(0, 200);
    if (!email.includes("@"))
      return new Response(JSON.stringify({ error: "invalid email" }),
        { status: 400, headers: { ...cors, "content-type": "application/json" } });

    const key = Deno.env.get("BREVO_API_KEY");
    const listId = Number(Deno.env.get("BREVO_LIST_ID") ?? 1);
    if (!key)
      return new Response(JSON.stringify({ error: "not configured" }),
        { status: 500, headers: { ...cors, "content-type": "application/json" } });

    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "api-key": key, "content-type": "application/json" },
      body: JSON.stringify({ email, listIds: [listId], updateEnabled: true }),
    });
    if (!res.ok && res.status !== 204)
      return new Response(JSON.stringify({ error: "subscribe failed" }),
        { status: 502, headers: { ...cors, "content-type": "application/json" } });

    return new Response(JSON.stringify({ ok: true }),
      { headers: { ...cors, "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "bad request" }),
      { status: 400, headers: { ...cors, "content-type": "application/json" } });
  }
});

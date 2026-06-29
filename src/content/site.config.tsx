// site.config.ts — PER-SITE CONTENT.  This + pages + tokens.css are all you edit.
// AI Smith instance.  No secret lives here; integration endpoints are public routes
// to edge functions that hold their keys in env (S6).
import type { NavItem, FooterColumn, Social } from "../components/spine/chrome";

export const site = {
  name: "AI Smith",
  // S2.4: fonts loaded in __root.tsx <head>; values set in tokens.css
  contactEmail: "contact@aismith.io",

  // S6: contactAction = the SHARED AISmith-functions /contact URL when a form replaces mailto;
  // newsletterAction = this site's OWN functions-only project URL if a newsletter is mounted.
  // Empty while unmounted (contact is mailto-only, newsletter omitted). See DEPLOY.md.
  integrations: {
    contactAction: "",     // → shared AISmith-functions /contact endpoint when mounted (mailto: until then)
    newsletterAction: "",  // → functions/newsletter.ts (Brevo) when mounted
    booking: "https://cal.com/aismith",  // Cal.com embed/link (optional)
  },

  // S5: data posture — declared in aismith-site-charter.md as "no-db, static-in-repo"

  // verify.mjs [6] LOGO — brand mark KIND, gated by the audit. Default "image" forces the
  // real extracted mark; a text wordmark is legal ONLY when declared. AI Smith's mark is
  // genuinely typographic, so the reference declares it. Client sites omit (default "image").
  brandMark: { kind: "wordmark" },
};

// Demo = true (public but not crawlable; shareable for feedback). Production = false.
export const seo = { noindex: true };

export const nav: NavItem[] = [
  { label: "What we make", href: "/" },
  { label: "For restaurants", href: "/restaurants" },
  { label: "For cultural orgs", href: "/cultural" },
  { label: "Ownership", href: "/ownership" },
  { label: "Plans", href: "/plans" },
];

export const footerColumns: FooterColumn[] = [
  { title: "What we make", links: [
    { label: "For restaurants", href: "/restaurants" },
    { label: "For cultural orgs", href: "/cultural" },
  ]},
  { title: "The promise", links: [
    { label: "Your hub, your data", href: "/ownership" },
    { label: "Plans", href: "/plans" },
    { label: "Website option", href: "/website" },
  ]},
  { title: "Talk", links: [
    { label: "Start a conversation", href: "mailto:contact@aismith.io" },
    { label: "contact@aismith.io", href: "mailto:contact@aismith.io" },
  ]},
];

const ig = (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="17.2" cy="6.8" r="1.25" fill="currentColor" />
  </svg>
);
export const socials: Social[] = [
  { label: "Instagram", href: "https://instagram.com/aismith", icon: ig },
];

// S8.3 / footer rule: AI Smith is the public brand; the operating entity is not foregrounded.
export const legal = "AI Smith · Antwerp, Belgium · Concept site 2026";

// S7.4: privacy-notice data. The build agent fills this from the manifest `legal` block;
// it must reflect the site's ACTUAL subprocessors, not generic boilerplate. AS is mailto-only
// (no Resend/Brevo mounted) and ships no map, so only the host is a processor here.
export const privacy = {
  controller: { name: "AI Smith", email: "contact@aismith.io" },
  subprocessors: [
    { name: "Netlify", purpose: "hosting and server logs", location: "EU/US", link: "https://www.netlify.com/privacy/" },
  ],
  effectiveDate: "23 June 2026",
  mapsEmbed: false,
  lang: "en" as const,   // AI Smith is an English-language site (S7.4 supports nl | en)
};

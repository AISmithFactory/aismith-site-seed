// routes/__root.tsx — root layout + document shell (TanStack Start). SPINE wiring.
// Owns the HTML shell so `lang` is hard-set here (S7.2), not left to the scaffold.
// HeadContent renders the merged root + per-route head() (S7.1). The durable value
// (components + tokens + composition) is framework-agnostic.
import * as React from "react";
import {
  createRootRoute, Outlet, useRouterState, HeadContent, Scripts,
} from "@tanstack/react-router";
import { SiteHeader, SiteFooter, SkipLink } from "../components/spine";
import { nav, footerColumns, socials, legal, site, seo, og } from "../content/site.config";
import "../styles/tokens.css";
import "../styles/spine.css";

const Logo = <>AI<span className="dot">·</span>Smith</>;

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <RootDocument>
      <SkipLink />
      <SiteHeader
        logo={Logo}
        nav={nav}
        currentPath={path}
        memberLink={undefined}
        cta={<a className="btn btn-action" href="mailto:contact@aismith.io">Start a conversation</a>}
      />
      <Outlet />
      <SiteFooter
        logo={Logo}
        tagline="The work, already done."
        address={<>{site.contactEmail}</>}
        columns={footerColumns}
        socials={socials}
        legal={legal}
        legalLinks={[{ label: "Privacy", href: "/privacy" }]}
      />
    </RootDocument>
  );
}

export const Route = createRootRoute({
  // Root defaults; each content route adds its own head() which overrides title/description.
  head: () => ({
    meta: [
      { title: "AI Smith · Software that already speaks your organisation" },
      { name: "description", content: "Made to fit. Yours to keep. Software built for how your organisation works, run for you, and yours to keep." },
      { property: "og:title", content: "AI Smith" },
      { property: "og:description", content: "Made to fit. Yours to keep." },
      { property: "og:type", content: "website" },
      // Link-preview card (R221): filled from `og` in src/content/site.config, ABSOLUTE on
      // site.canonicalHost because a relative og:image is not resolved by the apps that matter.
      { property: "og:image", content: new URL(og.image, site.canonicalHost).href },
      { property: "og:image:type", content: og.type },
      { property: "og:image:width", content: String(og.width) },
      { property: "og:image:height", content: String(og.height) },
      { property: "og:image:alt", content: og.alt },
      { property: "og:locale", content: og.locale },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // Demo↔production privacy switch (S7): noindex when seo.noindex is true (src/content/site.config).
      ...(seo.noindex ? [{ name: "robots", content: "noindex,nofollow" }] : []),
    ],
    links: [
      // S2.4 — fonts loaded by the app (swap for @fontsource self-hosting in production).
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter:wght@400;500;600&display=swap" },
    ],
  }),
  component: RootLayout,
});

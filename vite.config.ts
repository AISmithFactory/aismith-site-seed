import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
import viteReact from "@vitejs/plugin-react";

// aismith-site-seed — TanStack Start (Vite plugin) targeting Netlify, all routes
// prerendered to static HTML (SSG). The `pages` list is the seed's reference instance;
// a build reskins content and updates this list to the client's actual route set.
export default defineConfig({
  plugins: [
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
        // The crawl fetches every local <a href> it finds and writes the response as TEXT to that
        // path, so a linked public/ file (/menu.pdf) is written over its own copy in dist/ as
        // corrupt text, and a link carrying a query or a fragment (/contact?aan=x) is fetched as a
        // page of its own and written over the page it names. Crawl plain page paths only.
        // agents/site/verify.mjs [11] fails a build whose published copy of a linked public/
        // file differs from the source (R109).
        filter: (page) => !/[?#]/.test(page.path) && !/\.[a-z0-9]{2,5}$/i.test(page.path),
      },
      pages: [
        { path: "/" },
        { path: "/restaurants" },
        { path: "/cultural" },
        { path: "/ownership" },
        { path: "/plans" },
        { path: "/website" },
        { path: "/privacy" },
      ],
    }),
    netlify(),
    viteReact(),
  ],
});

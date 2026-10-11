// pages/website.tsx — the optional public-site add-on (positioning §5B). No prose em-dashes.
import * as React from "react";
import { PageTitle, Section, Band, SecTitle, Eyebrow, Lead, Em, Btn, InfoCard } from "../components/spine";

export function Website() {
  return (
    <main id="main">
      <Section tone="paper" pad="lg">
        <Eyebrow>Optional add-on</Eyebrow>
        <PageTitle size="lg">
          Want your website on it too?
        </PageTitle>
        <Lead>
          An extra, if you need it. Not the main product. The product is the hub that runs your
          operation. If you also need a public website, we can build it on the same foundation, so your
          shop window and your back office are one system you own.
        </Lead>
        <div className="actions" style={{ marginTop: 26 }}>
          <Btn href="mailto:contact@aismith.io">Ask about it</Btn>
          <Btn variant="line" href="/plans">Back to the plan</Btn>
        </div>
      </Section>

      <Section tone="alt">
        <Eyebrow>If you want the whole presence</Eyebrow>
        <SecTitle>One foundation, two surfaces.</SecTitle>
        <Lead>
          Built as separate apps on one stack you own. The public site and the operation keep their
          own boundaries, but share a single home. Standard formats, portable.
        </Lead>
        <div className="grid grid-2" style={{ marginTop: 30 }}>
          <InfoCard k="Public website" v="What the world sees: pages, news, sign-ups." />
          <InfoCard k="Your hub" v="What runs the place: the operation behind it." />
        </div>
        {/* A linked public/ binary, so verify.mjs [11] compares a real file on every build (R109) */}
        <div className="actions" style={{ marginTop: 26 }}>
          <Btn variant="ghost" href="/og-card.png">See the preview card a shared link shows &rarr;</Btn>
        </div>
      </Section>

      <Section tone="paper">
        <Eyebrow>When it makes sense</Eyebrow>
        <SecTitle>Add it only if it helps.</SecTitle>
        <div className="grid grid-2" style={{ marginTop: 30 }}>
          <InfoCard k="Already have a site you like" v="Keep it, and we work behind it. The hub runs your operation quietly behind the site you already have. No rebuild needed. And if you ever want it rebuilt on the same foundation, that option is open too." />
          <InfoCard k="Starting fresh, or outgrown your old one" v="We build the public site on the same foundation as your hub. Your whole presence, yours to keep." />
        </div>
        <p className="lead" style={{ marginTop: 22 }}>
          <Em>Not sure you need it?</Em> You probably don't, and that is fine. The hub stands on its
          own. If a website would help, we'll tell you straight, and price it as the add-on it is.
        </p>
      </Section>

      <Band tone="slate"
        heading="The hub first. The website only if it earns its place."
        sub="Tell us what you run, and we'll tell you plainly whether the website option is worth it for you."
        actions={<Btn href="mailto:contact@aismith.io">Ask about it</Btn>}
      />
    </main>
  );
}

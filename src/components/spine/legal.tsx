// spine/legal.tsx — CORE legal notices (S7.4). Every site ships a privacy notice.
// GDPR structure + standard clauses authored ONCE here (fleet-wide, consistent and correct);
// per-site facts (controller, enabled subprocessors, dates) arrive as props from site.config,
// filled from the manifest `legal` block. What the site actually SHIPS is a prop too:
// `newsletter` gates the newsletter clause and its consent basis, `withName` matches the
// clause to NewsletterForm's shape (forms.tsx defaults withName={true} and posts data.name),
// `mapsEmbed` gates the map clause and its consent basis. Defaults describe the fleet default
// site: a newsletter on the name+email form, no map. Bilingual NL + EN via `lang` (the fleet's two
// languages); the per-site subprocessor `purpose` strings are authored in the site's language.
// Tokens only via .legal classes; no colour decision here (S2.2).
import * as React from "react";
import { Section, PageTitle } from "./primitives";

export type Controller = { name: string; address?: React.ReactNode; vatId?: string; email: string };
export type Subprocessor = { name: string; purpose: string; location?: string; link?: string };
type Lang = "nl" | "en";

const DPA: Record<Lang, { name: string; url: string }> = {
  nl: { name: "Gegevensbeschermingsautoriteit", url: "https://www.gegevensbeschermingsautoriteit.be" },
  en: { name: "Belgian Data Protection Authority", url: "https://www.dataprotectionauthority.be" },
};

export function PrivacyNotice(
  { controller, subprocessors = [], effectiveDate, retention, mapsEmbed = false,
    newsletter = true, withName = true, dpoEmail, lang = "nl", dpaName, dpaUrl }:
  { controller: Controller; subprocessors?: Subprocessor[]; effectiveDate: string;
    retention?: React.ReactNode; mapsEmbed?: boolean; newsletter?: boolean;
    withName?: boolean; dpoEmail?: string; lang?: Lang;
    dpaName?: string; dpaUrl?: string }
) {
  const rightsTo = dpoEmail ?? controller.email;
  const dpa = { name: dpaName ?? DPA[lang].name, url: dpaUrl ?? DPA[lang].url };
  const mailto = (e: string) => <a href={`mailto:${e}`}>{e}</a>;
  // S7.4a: the legal basis names the consent sources this site ACTUALLY has. A notice
  // that lists a newsletter or a map the site does not ship overstates its processing,
  // and one that omits a field the default form posts understates it. Both are defects
  // and this site has shipped each of them.
  const consent: Record<Lang, string[]> = {
    nl: [...(newsletter ? ["nieuwsbrief"] : []), ...(mapsEmbed ? ["kaart"] : [])],
    en: [...(newsletter ? ["newsletter"] : []), ...(mapsEmbed ? ["map"] : [])],
  };
  const basisNl = consent.nl.length
    ? `We verwerken deze gegevens op basis van je toestemming (${consent.nl.join(", ")}), de uitvoering van je verzoek (contact) en ons gerechtvaardigd belang om de site veilig te laten werken.`
    : "We verwerken deze gegevens op basis van de uitvoering van je verzoek (contact) en ons gerechtvaardigd belang om de site veilig te laten werken.";
  const basisEn = consent.en.length
    ? `We process this data on the basis of your consent (${consent.en.join(", ")}), the performance of your request (contact), and our legitimate interest in keeping the site secure.`
    : "We process this data on the basis of the performance of your request (contact) and our legitimate interest in keeping the site secure.";

  const T: Record<Lang, any> = {
    nl: {
      title: "Privacybeleid",
      updated: `Laatst bijgewerkt op ${effectiveDate}.`,
      whoT: "Wie wij zijn",
      who: (<>{controller.name} is verantwoordelijk voor de verwerking van je persoonsgegevens
        {controller.vatId ? <> (ondernemingsnummer {controller.vatId})</> : null}.
        {controller.address ? <> Adres: {controller.address}.</> : null}{" "}
        Je kan ons bereiken via {mailto(controller.email)}.
        {dpoEmail ? <> Voor privacyvragen: {mailto(dpoEmail)}.</> : null}</>),
      dataT: "Welke gegevens we verwerken en waarom",
      dContact: <><strong>Contact.</strong> Stuur je ons een bericht, dan verwerken we je naam, e-mailadres en de inhoud van je bericht om je vraag te beantwoorden.</>,
      dNews: <><strong>Nieuwsbrief.</strong> Schrijf je je in, dan verwerken we je {withName ? "naam en e-mailadres" : "e-mailadres"} om je de nieuwsbrief te sturen. Je kan je op elk moment uitschrijven.</>,
      dLogs: <><strong>Technische logs.</strong> Onze hostingpartij houdt beperkte serverlogs bij (waaronder je IP-adres) voor de beveiliging en goede werking van de site.</>,
      dMap: <><strong>Kaart.</strong> Onze kaart laadt pas wanneer je er zelf op klikt. Vanaf dat moment wordt je IP-adres aan Google doorgegeven om de kaart te tonen.</>,
      basisT: "Rechtsgrond",
      basis: basisNl,
      shareT: "Met wie we gegevens delen",
      shareNone: "We delen je gegevens niet met derden, behalve waar nodig voor de werking van de site.",
      neverSell: "We verkopen je gegevens nooit.",
      transferT: "Doorgifte buiten de EU",
      transfer: "Sommige van bovenstaande partijen kunnen gegevens buiten de Europese Economische Ruimte verwerken. In dat geval gebeurt dat met de passende waarborgen die de wet vereist, zoals de standaardcontractbepalingen van de Europese Commissie.",
      retainT: "Hoe lang we gegevens bewaren",
      retainDefault: <>We bewaren je gegevens niet langer dan nodig is voor het doel waarvoor we ze verzamelden, en verwijderen ze daarna.</>,
      rightsT: "Jouw rechten",
      rights: (<>Je hebt recht op inzage, correctie en verwijdering van je gegevens, op beperking van of bezwaar tegen de verwerking, en op overdraagbaarheid. Gaf je toestemming, dan kan je die op elk moment intrekken. Stuur je verzoek naar {mailto(rightsTo)}.</>),
      complaintsT: "Klachten",
      complaints: (<>Ben je het niet eens met hoe we met je gegevens omgaan, dan kan je een klacht indienen bij de <a href={dpa.url} target="_blank" rel="noopener">{dpa.name}</a>.</>),
      changesT: "Wijzigingen",
      changes: "We kunnen dit privacybeleid bijwerken. De datum bovenaan toont wanneer het laatst wijzigde.",
    },
    en: {
      title: "Privacy policy",
      updated: `Last updated ${effectiveDate}.`,
      whoT: "Who we are",
      who: (<>{controller.name} is responsible for processing your personal data
        {controller.vatId ? <> (company number {controller.vatId})</> : null}.
        {controller.address ? <> Address: {controller.address}.</> : null}{" "}
        You can reach us at {mailto(controller.email)}.
        {dpoEmail ? <> For privacy questions: {mailto(dpoEmail)}.</> : null}</>),
      dataT: "What data we process and why",
      dContact: <><strong>Contact.</strong> If you send us a message, we process your name, email address and the content of your message to answer your question.</>,
      dNews: <><strong>Newsletter.</strong> If you subscribe, we process your {withName ? "name and email address" : "email address"} to send you the newsletter. You can unsubscribe at any time.</>,
      dLogs: <><strong>Technical logs.</strong> Our hosting provider keeps limited server logs (including your IP address) for the security and proper operation of the site.</>,
      dMap: <><strong>Map.</strong> Our map only loads when you click it. From that moment your IP address is sent to Google to show the map.</>,
      basisT: "Legal basis",
      basis: basisEn,
      shareT: "Who we share data with",
      shareNone: "We do not share your data with third parties, except where needed to operate the site.",
      neverSell: "We never sell your data.",
      transferT: "Transfers outside the EU",
      transfer: "Some of the parties above may process data outside the European Economic Area. Where they do, it happens with the appropriate safeguards the law requires, such as the European Commission's standard contractual clauses.",
      retainT: "How long we keep data",
      retainDefault: <>We keep your data no longer than necessary for the purpose we collected it for, and delete it afterwards.</>,
      rightsT: "Your rights",
      rights: (<>You have the right to access, correct and delete your data, to restrict or object to processing, and to data portability. Where you gave consent, you can withdraw it at any time. Send your request to {mailto(rightsTo)}.</>),
      complaintsT: "Complaints",
      complaints: (<>If you disagree with how we handle your data, you can lodge a complaint with the <a href={dpa.url} target="_blank" rel="noopener">{dpa.name}</a>.</>),
      changesT: "Changes",
      changes: "We may update this privacy policy. The date at the top shows when it last changed.",
    },
  };

  const t = T[lang];
  return (
    <main id="main">
      <Section tone="paper" pad="lg">
        <PageTitle size="lg">{t.title}</PageTitle>
        <div className="legal">
          <p className="legal-meta">{t.updated}</p>
          <h2>{t.whoT}</h2>
          <p>{t.who}</p>
          <h2>{t.dataT}</h2>
          <ul>
            <li>{t.dContact}</li>
            {newsletter ? <li>{t.dNews}</li> : null}
            <li>{t.dLogs}</li>
            {mapsEmbed ? <li>{t.dMap}</li> : null}
          </ul>
          <h2>{t.basisT}</h2>
          <p>{t.basis}</p>
          <h2>{t.shareT}</h2>
          {subprocessors.length ? (
            <ul>
              {subprocessors.map((sp) => (
                <li key={sp.name}>
                  <strong>{sp.link ? <a href={sp.link} target="_blank" rel="noopener">{sp.name}</a> : sp.name}</strong>
                  {": "}{sp.purpose}{sp.location ? <> ({sp.location})</> : null}.
                </li>
              ))}
            </ul>
          ) : (
            <p>{t.shareNone}</p>
          )}
          <p>{t.neverSell}</p>
          <h2>{t.transferT}</h2>
          <p>{t.transfer}</p>
          <h2>{t.retainT}</h2>
          <p>{retention ?? t.retainDefault}</p>
          <h2>{t.rightsT}</h2>
          <p>{t.rights}</p>
          <h2>{t.complaintsT}</h2>
          <p>{t.complaints}</p>
          <h2>{t.changesT}</h2>
          <p>{t.changes}</p>
        </div>
      </Section>
    </main>
  );
}
